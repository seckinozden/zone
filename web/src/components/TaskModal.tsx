import { useEffect, useState } from 'react'
import { addHours, format } from 'date-fns'
import { X, Clock, Trash2 } from 'lucide-react'
import type { EventRow } from '../api/client'
import { useCategories, useCreateEvent, useDeleteEvent, useUpdateEvent } from '../api/hooks'
import { categoryColor } from '../lib/categories'

type Props = {
  open: boolean
  initial?: EventRow | null
  defaultDay?: Date
  /** Specific start time for a click-to-create flow. Overrides defaultDay. */
  defaultStart?: Date
  onClose: () => void
}

const QUICK_TEMPLATES = ['Breakfast', 'Lunch', 'Dinner', 'Gym', 'Yoga']

export function TaskModal({ open, initial, defaultDay, defaultStart, onClose }: Props) {
  const { data: categories } = useCategories()
  const createMut = useCreateEvent()
  const updateMut = useUpdateEvent()
  const deleteMut = useDeleteEvent()
  const editing = !!initial

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => format(defaultDay ?? new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      const s = new Date(initial.startTime)
      const e = new Date(initial.endTime)
      setTitle(initial.title)
      setDate(format(s, 'yyyy-MM-dd'))
      setStartTime(format(s, 'HH:mm'))
      setEndTime(format(e, 'HH:mm'))
      setCategoryId(initial.categoryId)
      setNotes(initial.notes ?? '')
    } else if (defaultStart) {
      const end = addHours(defaultStart, 1)
      setTitle('')
      setDate(format(defaultStart, 'yyyy-MM-dd'))
      setStartTime(format(defaultStart, 'HH:mm'))
      setEndTime(format(end, 'HH:mm'))
      setCategoryId(categories?.[0]?.id ?? null)
      setNotes('')
    } else {
      setTitle('')
      setDate(format(defaultDay ?? new Date(), 'yyyy-MM-dd'))
      setStartTime('09:00')
      setEndTime('10:00')
      setCategoryId(categories?.[0]?.id ?? null)
      setNotes('')
    }
  }, [open, initial, defaultDay, defaultStart, categories])

  // ESC closes the modal.
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
      title: title.trim() || 'Untitled',
      startTime: new Date(`${date}T${startTime}:00`).toISOString(),
      endTime: new Date(`${date}T${endTime}:00`).toISOString(),
      categoryId,
      notes: notes.trim() || null,
    }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg bg-surface rounded-2xl border border-white/5 p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold">{editing ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-on-surface-variant">
            <X size={20} />
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you focusing on?"
          className="w-full bg-surface-lowest border border-white/5 rounded-lg p-3 mb-5 outline-none focus:border-brand"
        />

        <div className="grid grid-cols-2 gap-3 mb-5">
          <TimeField label="Start Time" value={startTime} onChange={setStartTime} />
          <TimeField label="End Time" value={endTime} onChange={setEndTime} />
        </div>
        <div className="mb-5">
          <div className="label-caps mb-1">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-surface-lowest border border-white/5 rounded-lg p-2.5 outline-none focus:border-brand"
          />
        </div>

        {!editing && (
          <div className="mb-5">
            <div className="label-caps mb-2">Quick Templates</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  className="px-3 py-1.5 text-sm rounded-full bg-surface-lowest border border-white/5"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <div className="label-caps mb-2">Category</div>
          <div className="flex flex-wrap gap-3">
            {categories?.map((c) => {
              const selected = c.id === categoryId
              const color = categoryColor(c)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${
                    selected ? 'border-white/20' : 'border-white/5'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{ borderColor: color, backgroundColor: selected ? color : 'transparent' }}
                  />
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <div className="label-caps mb-1">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add some details about this session..."
            rows={3}
            className="w-full bg-surface-lowest border border-white/5 rounded-lg p-3 outline-none focus:border-brand resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <button
              onClick={remove}
              className="flex items-center gap-2 text-sm text-red-300"
            >
              <Trash2 size={16} /> Delete Task
            </button>
          ) : <span />}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-white/10 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-5 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-semibold"
            >
              {editing ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="label-caps mb-1">{label}</div>
      <div className="flex items-center bg-surface-lowest border border-white/5 rounded-lg px-3">
        <Clock size={16} className="text-on-surface-variant" />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent w-full p-2.5 outline-none"
        />
      </div>
    </div>
  )
}
