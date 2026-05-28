import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import type { Habit } from '../api/client'
import { useCreateHabit, useDeleteHabit, useUpdateHabit } from '../api/hooks'

const COLORS = ['#8b8cff', '#ffb1c6', '#ffb689', '#69d6a3', '#7dd3fc', '#facc15']

type Props = {
  open: boolean
  initial?: Habit | null
  suggestion?: string | null
  onClose: () => void
}

export function HabitModal({ open, initial, suggestion, onClose }: Props) {
  const editing = !!initial
  const createMut = useCreateHabit()
  const updateMut = useUpdateHabit()
  const deleteMut = useDeleteHabit()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [targetKind, setTargetKind] = useState<'daily' | 'weekly'>('daily')
  const [targetCount, setTargetCount] = useState('3')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setName(initial.name)
      setColor(initial.color)
      setTargetKind(initial.targetKind)
      setTargetCount(initial.targetCount.toString())
    } else {
      setName(suggestion ?? '')
      setColor(COLORS[0])
      setTargetKind('daily')
      setTargetCount('3')
    }
  }, [open, initial, suggestion])

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
      name: name.trim(),
      color,
      targetKind,
      targetCount: targetKind === 'daily' ? 1 : parseInt(targetCount, 10),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-surface rounded-2xl border border-divider p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold">{editing ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="text-on-surface-variant" aria-label="Close"><X size={20} /></button>
        </div>
        <label className="block mb-4">
          <div className="label-caps mb-1">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
        </label>
        <div className="mb-4">
          <div className="label-caps mb-2">Color</div>
          <div className="flex gap-2">
            {COLORS.map((c) => <button key={c} aria-label={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-on-surface' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setTargetKind('daily')} className={`rounded-lg border px-3 py-2 text-sm ${targetKind === 'daily' ? 'border-brand bg-brand/15' : 'border-divider text-on-surface-variant'}`}>Daily</button>
          <button onClick={() => setTargetKind('weekly')} className={`rounded-lg border px-3 py-2 text-sm ${targetKind === 'weekly' ? 'border-brand bg-brand/15' : 'border-divider text-on-surface-variant'}`}>Weekly</button>
        </div>
        {targetKind === 'weekly' && (
          <label className="block mb-5">
            <div className="label-caps mb-1">Times per week</div>
            <input type="number" min={1} max={7} value={targetCount} onChange={(e) => setTargetCount(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
          </label>
        )}
        <div className="flex items-center justify-between gap-3">
          {editing ? <button onClick={remove} className="flex items-center gap-2 text-sm text-red-300"><Trash2 size={16} /> Delete</button> : <span />}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-stroke text-sm">Cancel</button>
            <button onClick={save} disabled={!name.trim()} className="px-5 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-semibold disabled:opacity-50">{editing ? 'Save Changes' : 'Create Habit'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
