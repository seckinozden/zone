import { useMemo, useState } from 'react'
import { addDays, endOfWeek, format, startOfWeek, subDays } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react'
import type { Meal } from '../api/client'
import { localDate } from '../api/client'
import { useMeals, useSettings } from '../api/hooks'
import { MealModal } from '../components/MealModal'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export function NutritionPage() {
  const [anchor, setAnchor] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Meal | null>(null)
  const [defaultMealType, setDefaultMealType] = useState('breakfast')
  const weekRange = useMemo(() => ({ from: startOfWeek(anchor, { weekStartsOn: 1 }), to: endOfWeek(anchor, { weekStartsOn: 1 }) }), [anchor])
  const { data: meals = [] } = useMeals(weekRange)
  const { data: settings } = useSettings()
  const dateKey = localDate(anchor)
  const dayMeals = meals.filter((m) => m.date === dateKey)
  const consumed = meals.reduce((sum, m) => sum + m.calories, 0)
  const budget = settings?.weeklyCalorieBudget ?? 14000
  const left = budget - consumed
  const pct = Math.min(100, Math.round((consumed / budget) * 100))

  function openCreate(mealType: string) {
    setEditing(null)
    setDefaultMealType(mealType)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Nutrition</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-on-surface-variant">
            <span className="text-on-surface">{format(anchor, 'EEEE, MMM d')}</span>
            <button onClick={() => setAnchor((d) => subDays(d, 1))}><ChevronLeft size={18} /></button>
            <button onClick={() => setAnchor(new Date())} title="Today"><CalendarDays size={18} /></button>
            <button onClick={() => setAnchor((d) => addDays(d, 1))}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-divider bg-surface-low/30 p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label-caps">Weekly Budget</div>
          <div className="text-sm text-on-surface-variant">{format(weekRange.from, 'MMM d')} - {format(weekRange.to, 'MMM d')}</div>
        </div>
        <div className="h-3 rounded-full bg-surface-high overflow-hidden">
          <div className="h-full rounded-full bg-brand-strong" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-sm text-on-surface-variant">{consumed} kcal used · {left} left · {Math.round(budget / 7)} avg/day</div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        {MEAL_TYPES.map((type) => {
          const rows = dayMeals.filter((m) => m.mealType === type)
          return (
            <section key={type} className="rounded-xl border border-divider bg-surface-low/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold capitalize">{type}</h2>
                <button onClick={() => openCreate(type)} className="text-brand flex items-center gap-1 text-sm"><Plus size={15} /> Add</button>
              </div>
              <ul className="space-y-2">
                {rows.map((meal) => (
                  <li key={meal.id} className="flex items-center gap-3 rounded-lg bg-surface/60 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{meal.description}</div>
                      <div className="text-xs text-on-surface-variant">{meal.calories} kcal</div>
                    </div>
                    <button onClick={() => { setEditing(meal); setModalOpen(true) }} className="text-on-surface-variant hover:text-on-surface" aria-label="Edit meal"><Pencil size={15} /></button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <MealModal open={modalOpen} initial={editing} defaultDate={anchor} defaultMealType={defaultMealType} onClose={() => setModalOpen(false)} />
    </div>
  )
}
