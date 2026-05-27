import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import type { Category } from '../api/client'
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '../api/hooks'

type Props = {
  open: boolean
  initial?: Category | null
  onClose: () => void
}

/** Palette derived from the Chronos Deep tokens — covers warm, cool, and neutral hues. */
export const LABEL_PALETTE = [
  '#7c5cff', // brand purple
  '#5d5fef', // deep indigo
  '#3ec6c6', // teal
  '#22c55e', // green
  '#facc15', // yellow
  '#f59e0b', // amber
  '#ff6b6b', // red/pink
  '#ec4899', // hot pink
  '#94a3b8', // slate
]

export function LabelModal({ open, initial, onClose }: Props) {
  const editing = !!initial
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deleteMut = useDeleteCategory()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState<string>(LABEL_PALETTE[0])

  useEffect(() => {
    if (!open) return
    if (initial) {
      setName(initial.name)
      setDescription(initial.description ?? '')
      setColor(initial.color)
    } else {
      setName('')
      setDescription('')
      setColor(LABEL_PALETTE[0])
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
      name: name.trim() || 'Untitled',
      color,
      description: description.trim() || null,
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
        className="w-full max-w-md bg-surface rounded-2xl border border-white/5 p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold">{editing ? 'Edit Label' : 'New Label'}</h2>
          <button onClick={onClose} className="text-on-surface-variant" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <label className="block mb-4">
          <div className="label-caps mb-1">Name</div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work"
            className="w-full bg-surface-lowest border border-white/5 rounded-lg p-3 outline-none focus:border-brand"
          />
        </label>

        <label className="block mb-4">
          <div className="label-caps mb-1">Description</div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional — short description"
            className="w-full bg-surface-lowest border border-white/5 rounded-lg p-3 outline-none focus:border-brand"
          />
        </label>

        <div className="mb-6">
          <div className="label-caps mb-2">Color</div>
          <div className="flex flex-wrap gap-2">
            {LABEL_PALETTE.map((swatch) => {
              const selected = swatch === color
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  aria-label={`Pick ${swatch}`}
                  aria-pressed={selected}
                  className={`w-8 h-8 rounded-full transition ${
                    selected ? 'ring-2 ring-offset-2 ring-offset-surface ring-white/40' : 'ring-0'
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <button
              onClick={remove}
              className="flex items-center gap-2 text-sm text-red-300"
            >
              <Trash2 size={16} /> Delete Label
            </button>
          ) : (
            <span />
          )}
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
              {editing ? 'Save Changes' : 'Add Label'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
