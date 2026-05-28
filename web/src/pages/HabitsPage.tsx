import { useMemo, useState } from 'react'
import { eachDayOfInterval, endOfWeek, format, startOfDay, startOfWeek, subDays } from 'date-fns'
import { Check, Pencil, Plus } from 'lucide-react'
import type { Habit } from '../api/client'
import { localDate } from '../api/client'
import { useCompleteHabit, useHabitCompletions, useHabits, useUncompleteHabit } from '../api/hooks'
import { HabitModal } from '../components/HabitModal'

const SUGGESTIONS = ['Supplements', 'Eye drops', 'German practice', 'Finance learning']

export function HabitsPage() {
  const today = startOfDay(new Date())
  const [view, setView] = useState<'day' | 'grid'>('day')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const range = useMemo(() => ({ from: subDays(today, 83), to: today }), [today])
  const weekRange = useMemo(() => ({ from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) }), [today])
  const { data: habits = [] } = useHabits()
  const { data: completions = [] } = useHabitCompletions(range)
  const complete = useCompleteHabit()
  const uncomplete = useUncompleteHabit()
  const todayKey = localDate(today)

  const completionSet = new Set(completions.map((c) => `${c.habitId}:${c.date}`))

  function openCreate(name?: string) {
    setEditing(null)
    setSuggestion(name ?? null)
    setModalOpen(true)
  }

  async function toggle(habit: Habit, date: string) {
    if (completionSet.has(`${habit.id}:${date}`)) await uncomplete.mutateAsync({ id: habit.id, date })
    else await complete.mutateAsync({ id: habit.id, date })
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Habits</h1>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => setView('day')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'day' ? 'bg-surface text-on-surface' : 'text-on-surface-variant'}`}>Day</button>
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'grid' ? 'bg-surface text-on-surface' : 'text-on-surface-variant'}`}>3 Months</button>
          </div>
        </div>
        <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"><Plus size={16} /> Add Habit</button>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-xl border border-divider bg-surface-low/30 p-8">
          <div className="text-on-surface-variant mb-4">No habits yet.</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => <button key={s} onClick={() => openCreate(s)} className="rounded-full border border-divider px-3 py-1.5 text-sm hover:bg-surface">{s}</button>)}
          </div>
        </div>
      ) : view === 'day' ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="text-2xl font-semibold mb-4">{format(today, 'EEEE, MMM d')}</div>
          <ul className="space-y-2">
            {habits.map((habit) => {
              const done = completionSet.has(`${habit.id}:${todayKey}`)
              const weekDone = completions.filter((c) => c.habitId === habit.id && c.date >= localDate(weekRange.from) && c.date <= localDate(weekRange.to)).length
              return (
                <li key={habit.id} className="rounded-xl border border-divider bg-surface-low/40 p-4 flex items-center gap-3">
                  <button onClick={() => toggle(habit, todayKey)} className={`w-9 h-9 rounded-full border flex items-center justify-center ${done ? 'bg-brand-strong border-brand-strong text-white' : 'border-divider'}`} aria-label={`Toggle ${habit.name}`}>
                    {done && <Check size={18} />}
                  </button>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                  <div className="flex-1">
                    <div className="font-semibold">{habit.name}</div>
                    {habit.targetKind === 'weekly' && <div className="text-xs text-on-surface-variant">this week: {weekDone}/{habit.targetCount}</div>}
                  </div>
                  <button onClick={() => { setEditing(habit); setSuggestion(null); setModalOpen(true) }} className="text-on-surface-variant hover:text-on-surface" aria-label="Edit habit"><Pencil size={16} /></button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <HabitGrid habits={habits} completionSet={completionSet} from={range.from} to={range.to} />
      )}

      <HabitModal open={modalOpen} initial={editing} suggestion={suggestion} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function HabitGrid({ habits, completionSet, from, to }: { habits: Habit[]; completionSet: Set<string>; from: Date; to: Date }) {
  const days = eachDayOfInterval({ start: from, end: to })
  return (
    <div className="flex-1 min-h-0 overflow-auto space-y-4">
      {habits.map((habit) => {
        const completed = days.filter((d) => completionSet.has(`${habit.id}:${localDate(d)}`)).length
        const pct = Math.round((completed / days.length) * 100)
        return (
          <div key={habit.id} className="rounded-xl border border-divider bg-surface-low/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{habit.name}</div>
              <div className="text-sm text-on-surface-variant">{pct}%</div>
            </div>
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
              {days.map((d) => {
                const key = localDate(d)
                const done = completionSet.has(`${habit.id}:${key}`)
                return <div key={key} title={key} className="w-3 h-3 rounded-sm" style={{ backgroundColor: done ? habit.color : 'var(--color-surface-high)' }} />
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
