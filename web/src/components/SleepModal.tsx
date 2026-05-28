import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2, X } from 'lucide-react'
import type { SleepEntry } from '../api/client'
import { useCreateSleep, useDeleteSleep, useUpdateSleep } from '../api/hooks'

type Props = {
  open: boolean
  initial?: SleepEntry | null
  defaultDate?: Date
  onClose: () => void
}

export function SleepModal({ open, initial, defaultDate, onClose }: Props) {
  const editing = !!initial
  const createMut = useCreateSleep()
  const updateMut = useUpdateSleep()
  const deleteMut = useDeleteSleep()

  const [date, setDate] = useState('')
  const [score, setScore] = useState<number>(80)
  const [durationMin, setDurationMin] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (initial) {
      setDate(initial.date)
      setScore(initial.score)
      setDurationMin(initial.durationMin?.toString() ?? '')
      setNotes(initial.notes ?? '')
    } else {
      setDate(format(defaultDate ?? new Date(), 'yyyy-MM-dd'))
      setScore(80)
      setDurationMin('')
      setNotes('')
    }
  }, [open, initial, defaultDate])

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
    setError(null)
    const input = {
      date,
      score,
      durationMin: durationMin.trim() ? parseInt(durationMin, 10) : null,
      notes: notes.trim() || null,
    }
    try {
      if (editing && initial) {
        await updateMut.mutateAsync({ id: initial.id, input })
      } else {
        await createMut.mutateAsync(input)
      }
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('409')) {
        setError('A sleep entry already exists for that date.')
      } else {
        setError(msg)
      }
    }
  }

  async function remove() {
    if (!initial) return
    await deleteMut.mutateAsync(initial.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md bg-surface rounded-2xl border border-divider p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold">{editing ? 'Edit Sleep Entry' : 'New Sleep Entry'}</h2>
          <button onClick={onClose} className="text-on-surface-variant" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <label className="block mb-4">
          <div className="label-caps mb-1">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand"
          />
        </label>

        <label className="block mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="label-caps">Score</div>
            <div className="text-sm text-on-surface-variant">{score}</div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value, 10))}
            className="w-full accent-brand"
          />
        </label>

        <label className="block mb-4">
          <div className="label-caps mb-1">Duration (minutes)</div>
          <input
            type="number"
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="Optional"
            className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand"
          />
        </label>

        <label className="block mb-5">
          <div className="label-caps mb-1">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What made it good or bad?"
            rows={3}
            className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand resize-none"
          />
        </label>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-md p-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <button onClick={remove} className="flex items-center gap-2 text-sm text-red-300">
              <Trash2 size={16} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stroke text-sm">
              Cancel
            </button>
            <button
              onClick={save}
              className="px-5 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-semibold"
            >
              {editing ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
