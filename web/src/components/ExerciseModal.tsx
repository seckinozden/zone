import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2, X } from 'lucide-react'
import type { ExerciseEntry } from '../api/client'
import { useCreateExercise, useDeleteExercise, useUpdateExercise } from '../api/hooks'

const TYPES = ['running', 'biking', 'weights', 'other']

type Props = {
  open: boolean
  initial?: ExerciseEntry | null
  onClose: () => void
}

export function ExerciseModal({ open, initial, onClose }: Props) {
  const editing = !!initial
  const createMut = useCreateExercise()
  const updateMut = useUpdateExercise()
  const deleteMut = useDeleteExercise()

  const [dateTime, setDateTime] = useState('')
  const [type, setType] = useState('running')
  const [durationMin, setDurationMin] = useState('')
  const [caloriesBurned, setCaloriesBurned] = useState('0')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDateTime(format(new Date(initial.performedAt), "yyyy-MM-dd'T'HH:mm"))
      setType(initial.type)
      setDurationMin(initial.durationMin?.toString() ?? '')
      setCaloriesBurned(initial.caloriesBurned.toString())
      setNotes(initial.notes ?? '')
    } else {
      setDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
      setType('running')
      setDurationMin('')
      setCaloriesBurned('0')
      setNotes('')
    }
  }, [open, initial])

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
    const input = {
      performedAt: new Date(dateTime).toISOString(),
      type,
      durationMin: durationMin.trim() ? parseInt(durationMin, 10) : null,
      caloriesBurned: parseInt(caloriesBurned, 10),
      notes: notes.trim() || null,
    }
    if (editing && initial) {
      await updateMut.mutateAsync({ id: initial.id, input })
    } else {
      await createMut.mutateAsync(input)
    }
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
          <h2 className="text-xl font-semibold">{editing ? 'Edit Workout' : 'New Workout'}</h2>
          <button onClick={onClose} className="text-on-surface-variant" aria-label="Close"><X size={20} /></button>
        </div>

        <label className="block mb-4">
          <div className="label-caps mb-1">When</div>
          <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
        </label>

        <div className="mb-4">
          <div className="label-caps mb-2">Type</div>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} className={`rounded-lg border px-2 py-2 text-sm capitalize ${type === t ? 'border-brand bg-brand/15 text-on-surface' : 'border-divider text-on-surface-variant'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <label>
            <div className="label-caps mb-1">Duration</div>
            <input type="number" min={1} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="Optional" className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
          </label>
          <label>
            <div className="label-caps mb-1">Calories</div>
            <input type="number" min={0} value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
          </label>
        </div>

        <label className="block mb-5">
          <div className="label-caps mb-1">Notes</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand resize-none" />
        </label>

        <div className="flex items-center justify-between gap-3">
          {editing ? <button onClick={remove} className="flex items-center gap-2 text-sm text-red-300"><Trash2 size={16} /> Delete</button> : <span />}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stroke text-sm">Cancel</button>
            <button onClick={save} className="px-5 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-semibold">{editing ? 'Save Changes' : 'Add Workout'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
