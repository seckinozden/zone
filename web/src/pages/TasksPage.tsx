import { useMemo, useState } from 'react'
import {
  addMonths,
  endOfMonth,
  format,
  isToday,
  isTomorrow,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { useCategories, useEvents } from '../api/hooks'
import { categoryById, categoryColor } from '../lib/categories'
import { timeRange } from '../lib/time'
import { useTaskModal } from '../components/taskModalContext'
import type { EventRow } from '../api/client'

export function TasksPage() {
  const [anchor, setAnchor] = useState(new Date())
  const { openCreate, openEdit } = useTaskModal()

  const range = useMemo(
    () => ({ from: startOfMonth(anchor), to: endOfMonth(anchor) }),
    [anchor],
  )

  const { data: events = [], isLoading } = useEvents(range)
  const { data: categories } = useCategories()

  const grouped = useMemo(() => groupByDay(events), [events])

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Tasks</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-on-surface-variant">
            <span className="text-on-surface">{format(anchor, 'MMMM yyyy')}</span>
            <button onClick={() => setAnchor((d) => subMonths(d, 1))} className="ml-2">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setAnchor(new Date())} title="This month">
              <CalendarDays size={18} />
            </button>
            <button onClick={() => setAnchor((d) => addMonths(d, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={() => openCreate(anchor)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto">
        {isLoading && <div className="text-on-surface-variant text-sm">Loading…</div>}
        {!isLoading && events.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-surface-low/30 p-8 text-center text-on-surface-variant">
            No tasks scheduled for {format(anchor, 'MMMM yyyy')}.
          </div>
        )}
        {grouped.map(([dayKey, items]) => (
          <DaySection
            key={dayKey}
            day={new Date(dayKey)}
            items={items}
            categories={categories}
            onEdit={openEdit}
          />
        ))}
      </div>
    </div>
  )
}

function DaySection({
  day,
  items,
  categories,
  onEdit,
}: {
  day: Date
  items: EventRow[]
  categories: ReturnType<typeof useCategories>['data']
  onEdit: (e: EventRow) => void
}) {
  const heading = isToday(day)
    ? 'Today'
    : isTomorrow(day)
    ? 'Tomorrow'
    : format(day, 'EEEE, MMM d')
  return (
    <section className="mb-7">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <span className="label-caps">{format(day, 'EEE · MMM d')}</span>
      </div>
      <ul className="space-y-2">
        {items.map((e) => {
          const cat = categoryById(categories, e.categoryId)
          const color = categoryColor(cat)
          return (
            <li key={e.id}>
              <button
                onClick={() => onEdit(e)}
                className="w-full flex items-center gap-3 text-left rounded-xl bg-surface-low/40 hover:bg-surface-low border border-white/5 p-3"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="flex-1">
                  <div className="font-medium">{e.title}</div>
                  {e.notes && (
                    <div className="text-xs text-on-surface-variant mt-0.5 truncate">{e.notes}</div>
                  )}
                </div>
                <div className="text-xs text-on-surface-variant text-right">
                  <div>{timeRange(new Date(e.startTime), new Date(e.endTime))}</div>
                  {cat && <div className="mt-0.5">{cat.name}</div>}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function groupByDay(rows: EventRow[]): Array<[string, EventRow[]]> {
  const map = new Map<string, EventRow[]>()
  for (const r of rows) {
    const key = format(new Date(r.startTime), 'yyyy-MM-dd')
    const arr = map.get(key) ?? []
    arr.push(r)
    map.set(key, arr)
  }
  return [...map.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
}
