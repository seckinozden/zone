import { useMemo, useState } from 'react'
import {
  addMonths,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react'
import { useSleep } from '../api/hooks'
import { SleepModal } from '../components/SleepModal'
import { scoreBand, scoreBandColor } from '../lib/sleepScore'
import type { SleepEntry } from '../api/client'

const SPARKLINE_DAYS = 30

export function SleepPage() {
  const [anchor, setAnchor] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SleepEntry | null>(null)

  const range = useMemo(
    () => ({ from: startOfMonth(anchor), to: endOfMonth(anchor) }),
    [anchor],
  )
  const sparklineRange = useMemo(() => {
    const to = new Date()
    return { from: subDays(to, SPARKLINE_DAYS - 1), to }
  }, [])

  const { data: monthEntries = [], isLoading } = useSleep(range)
  const { data: sparklineEntries = [] } = useSleep(sparklineRange)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(entry: SleepEntry) {
    setEditing(entry)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Sleep</h1>
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
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <Sparkline entries={sparklineEntries} days={SPARKLINE_DAYS} />

      <div className="mt-6 flex-1 min-h-0 overflow-y-auto">
        {isLoading && <div className="text-on-surface-variant text-sm">Loading…</div>}
        {!isLoading && monthEntries.length === 0 && (
          <div className="rounded-xl border border-divider bg-surface-low/30 p-8 text-center text-on-surface-variant">
            No sleep entries logged this month yet.
          </div>
        )}
        <ul className="space-y-2">
          {monthEntries.map((e) => (
            <EntryRow key={e.id} entry={e} onEdit={() => openEdit(e)} />
          ))}
        </ul>
      </div>

      <SleepModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function Sparkline({ entries, days }: { entries: SleepEntry[]; days: number }) {
  const today = useMemo(() => new Date(), [])
  const byDate = useMemo(() => {
    const m = new Map<string, SleepEntry>()
    for (const e of entries) m.set(e.date, e)
    return m
  }, [entries])

  const cells = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i)
    const key = format(date, 'yyyy-MM-dd')
    return { date, key, entry: byDate.get(key) ?? null }
  })

  return (
    <div className="rounded-xl border border-divider bg-surface-low/30 p-4">
      <div className="label-caps mb-3">Last {days} days</div>
      <div className="flex items-end gap-1 h-20">
        {cells.map(({ key, entry }) => {
          if (!entry) {
            return (
              <div
                key={key}
                className="flex-1 rounded-sm bg-on-surface/[0.06]"
                title={`${key} — no entry`}
                style={{ height: '15%' }}
              />
            )
          }
          const band = scoreBand(entry.score)
          return (
            <div
              key={key}
              className="flex-1 rounded-sm transition"
              title={`${key} — ${entry.score}`}
              style={{
                height: `${Math.max(8, entry.score)}%`,
                backgroundColor: scoreBandColor(band),
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function EntryRow({ entry, onEdit }: { entry: SleepEntry; onEdit: () => void }) {
  const date = parseISO(entry.date)
  const band = scoreBand(entry.score)
  const color = scoreBandColor(band)
  return (
    <li className="rounded-xl border border-divider bg-surface-low/40 p-4 flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-semibold"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`,
          color,
        }}
      >
        {entry.score}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="font-semibold">{format(date, 'EEEE, MMM d')}</span>
          {entry.durationMin != null && (
            <span className="text-xs text-on-surface-variant">
              {Math.floor(entry.durationMin / 60)}h {entry.durationMin % 60}m
            </span>
          )}
        </div>
        {entry.notes && (
          <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-wrap">{entry.notes}</p>
        )}
      </div>
      <button
        onClick={onEdit}
        className="text-on-surface-variant hover:text-on-surface p-1"
        aria-label={`Edit sleep entry for ${entry.date}`}
      >
        <Pencil size={16} />
      </button>
    </li>
  )
}
