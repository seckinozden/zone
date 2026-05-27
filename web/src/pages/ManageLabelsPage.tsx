import { useState } from 'react'
import { Pencil, Plus, Tag } from 'lucide-react'
import { useCategories } from '../api/hooks'
import { categoryColor } from '../lib/categories'
import { LabelModal } from '../components/LabelModal'
import type { Category } from '../api/client'

export function ManageLabelsPage() {
  const { data: categories = [], isLoading } = useCategories()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(c: Category) {
    setEditing(c)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Manage Labels</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Organize your workflow with custom color categories.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"
        >
          <Plus size={16} /> New Label
        </button>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto">
        {isLoading && <div className="text-on-surface-variant text-sm">Loading…</div>}
        {!isLoading && categories.length === 0 && (
          <div className="rounded-xl border border-divider bg-surface-low/30 p-8 text-center text-on-surface-variant">
            No labels yet — create your first one to start organizing.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <LabelCard key={c.id} category={c} onEdit={() => openEdit(c)} />
          ))}
        </div>
      </div>

      <LabelModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function LabelCard({ category, onEdit }: { category: Category; onEdit: () => void }) {
  const color = categoryColor(category)
  return (
    <div className="rounded-xl border border-divider bg-surface-low/40 p-5 flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`, color }}
      >
        <Tag size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-base font-semibold truncate">{category.name}</h3>
        </div>
        <p className="text-sm text-on-surface-variant">
          {category.description || (
            <span className="italic opacity-60">No description</span>
          )}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="text-on-surface-variant hover:text-on-surface p-1"
        aria-label={`Edit ${category.name}`}
      >
        <Pencil size={16} />
      </button>
    </div>
  )
}
