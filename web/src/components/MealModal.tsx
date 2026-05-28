import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2, X } from 'lucide-react'
import type { Meal } from '../api/client'
import { useCreateMeal, useDeleteMeal, useUpdateMeal } from '../api/hooks'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

type Props = {
  open: boolean
  initial?: Meal | null
  defaultDate?: Date
  defaultMealType?: string
  onClose: () => void
}

export function MealModal({ open, initial, defaultDate, defaultMealType = 'breakfast', onClose }: Props) {
  const editing = !!initial
  const createMut = useCreateMeal()
  const updateMut = useUpdateMeal()
  const deleteMut = useDeleteMeal()
  const [date, setDate] = useState('')
  const [mealType, setMealType] = useState(defaultMealType)
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('0')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDate(initial.date)
      setMealType(initial.mealType)
      setDescription(initial.description)
      setCalories(initial.calories.toString())
    } else {
      setDate(format(defaultDate ?? new Date(), 'yyyy-MM-dd'))
      setMealType(defaultMealType)
      setDescription('')
      setCalories('0')
    }
  }, [open, initial, defaultDate, defaultMealType])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function save() {
    const input = { date, mealType, description: description.trim(), calories: parseInt(calories, 10) }
    if (editing && initial) await updateMut.mutateAsync({ id: initial.id, input })
    else await createMut.mutateAsync(input)
    onClose()
  }

  async function remove() {
    if (!initial) return
    await deleteMut.mutateAsync(initial.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-surface rounded-2xl border border-divider p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold">{editing ? 'Edit Meal' : 'Add Meal'}</h2>
          <button onClick={onClose} className="text-on-surface-variant" aria-label="Close"><X size={20} /></button>
        </div>
        <label className="block mb-4">
          <div className="label-caps mb-1">Date</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
        </label>
        <div className="mb-4">
          <div className="label-caps mb-2">Meal</div>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map((t) => <button key={t} onClick={() => setMealType(t)} className={`rounded-lg border px-2 py-2 text-sm capitalize ${mealType === t ? 'border-brand bg-brand/15' : 'border-divider text-on-surface-variant'}`}>{t}</button>)}
          </div>
        </div>
        <label className="block mb-4">
          <div className="label-caps mb-1">Description</div>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
        </label>
        <label className="block mb-5">
          <div className="label-caps mb-1">Calories</div>
          <input type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
        </label>
        <div className="flex items-center justify-between gap-3">
          {editing ? <button onClick={remove} className="flex items-center gap-2 text-sm text-red-300"><Trash2 size={16} /> Delete</button> : <span />}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stroke text-sm">Cancel</button>
            <button onClick={save} disabled={!description.trim()} className="px-5 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-semibold disabled:opacity-50">{editing ? 'Save Changes' : 'Add Meal'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
