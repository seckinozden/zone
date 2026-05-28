import { useMemo, useState } from 'react'
import { addMonths, endOfMonth, format, isWithinInterval, parseISO, startOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'
import { Bike, CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Flame, Pencil, Plus, Route } from 'lucide-react'
import { useExercise } from '../api/hooks'
import { ExerciseModal } from '../components/ExerciseModal'
import type { ExerciseEntry } from '../api/client'

export function ExercisePage() {
  const [anchor, setAnchor] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExerciseEntry | null>(null)
  const range = useMemo(() => ({ from: startOfMonth(anchor), to: endOfMonth(anchor) }), [anchor])
  const weekRange = useMemo(() => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }), [])
  const { data: entries = [], isLoading } = useExercise(range)

  const weekly = entries.filter((e) => isWithinInterval(new Date(e.performedAt), { start: weekRange.from, end: weekRange.to }))
  const calories = weekly.reduce((sum, e) => sum + e.caloriesBurned, 0)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Exercise</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-on-surface-variant">
            <span className="text-on-surface">{format(anchor, 'MMMM yyyy')}</span>
            <button onClick={() => setAnchor((d) => subMonths(d, 1))}><ChevronLeft size={18} /></button>
            <button onClick={() => setAnchor(new Date())} title="This month"><CalendarDays size={18} /></button>
            <button onClick={() => setAnchor((d) => addMonths(d, 1))}><ChevronRight size={18} /></button>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"><Plus size={16} /> Add Workout</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Stat label="This week" value={`${weekly.length} workouts`} />
        <Stat label="Calories burned" value={`${calories} kcal`} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading && <div className="text-on-surface-variant text-sm">Loading...</div>}
        {!isLoading && entries.length === 0 && <div className="rounded-xl border border-divider bg-surface-low/30 p-8 text-center text-on-surface-variant">No workouts logged this month yet.</div>}
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-divider bg-surface-low/40 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-surface-high flex items-center justify-center text-brand">{typeIcon(entry.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold capitalize">{entry.type}</div>
                <div className="text-sm text-on-surface-variant">
                  {format(parseISO(entry.performedAt), 'EEE, MMM d HH:mm')}
                  {entry.durationMin != null ? ` · ${entry.durationMin} min` : ''} · {entry.caloriesBurned} kcal
                </div>
                {entry.notes && <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-wrap">{entry.notes}</p>}
              </div>
              <button onClick={() => { setEditing(entry); setModalOpen(true) }} className="text-on-surface-variant hover:text-on-surface p-1" aria-label="Edit workout"><Pencil size={16} /></button>
            </li>
          ))}
        </ul>
      </div>

      <ExerciseModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-divider bg-surface-low/30 p-4"><div className="label-caps mb-1">{label}</div><div className="text-2xl font-semibold">{value}</div></div>
}

function typeIcon(type: string) {
  if (type === 'biking') return <Bike size={20} />
  if (type === 'weights') return <Dumbbell size={20} />
  if (type === 'running') return <Route size={20} />
  return <Flame size={20} />
}
