import { useEffect, useMemo, useRef, useState } from 'react'
import { differenceInMinutes, format, isSameDay } from 'date-fns'
import { useCategories, useEvents } from '../api/hooks'
import { categoryById, categoryColor } from '../lib/categories'
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_ROW_PX,
  SCROLL_ANCHOR_HOUR,
  hourFraction,
  hourLabel,
  timeRange,
  weekDays,
} from '../lib/time'
import { snapAt, slotToDate, type Slot } from '../lib/slot'
import type { EventRow } from '../api/client'

type Props = {
  anchor: Date
  range: { from: Date; to: Date }
  onSelectEvent: (e: EventRow) => void
  onCreateAt: (start: Date) => void
}

/** Dwell time before the hover preview appears. Prevents flicker while scanning the grid. */
const HOVER_DELAY_MS = 500

export function CalendarWeek({ anchor, range, onSelectEvent, onCreateAt }: Props) {
  const { data: events } = useEvents(range)
  const { data: categories } = useCategories()
  const days = useMemo(() => weekDays(anchor), [anchor])
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i)
  const now = useNow(60_000)
  const todayIndex = days.findIndex((d) => isSameDay(d, now))
  const nowInRange =
    todayIndex !== -1 && now.getHours() >= DAY_START_HOUR && now.getHours() <= DAY_END_HOUR

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (SCROLL_ANCHOR_HOUR - DAY_START_HOUR) * HOUR_ROW_PX
    }
  }, [anchor])

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-surface-low/30 flex flex-col h-full">
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/5 flex-shrink-0">
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className="py-3 text-center">
            <div className="label-caps">{format(d, 'EEE')}</div>
            <div
              className={`mt-1 mx-auto text-lg font-semibold w-9 h-9 leading-9 rounded-full ${
                isSameDay(d, now) ? 'bg-brand text-on-brand' : ''
              }`}
            >
              {format(d, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
          <div>
            {hours.map((h) => (
              <div key={h} className="text-xs text-on-surface-variant pl-3 pt-1" style={{ height: HOUR_ROW_PX }}>
                {hourLabel(h)}
              </div>
            ))}
          </div>

          {days.map((d) => (
            <DayColumn
              key={d.toISOString()}
              day={d}
              events={(events ?? []).filter((e) => isSameDay(new Date(e.startTime), d))}
              categories={categories}
              onSelectEvent={onSelectEvent}
              onCreateAt={onCreateAt}
            />
          ))}

          {nowInRange && <NowIndicator now={now} todayIndex={todayIndex} />}
        </div>
      </div>
    </div>
  )
}

function DayColumn({
  day,
  events,
  categories,
  onSelectEvent,
  onCreateAt,
}: {
  day: Date
  events: EventRow[]
  categories: ReturnType<typeof useCategories>['data']
  onSelectEvent: (e: EventRow) => void
  onCreateAt: (start: Date) => void
}) {
  const totalHours = DAY_END_HOUR - DAY_START_HOUR + 1
  const colRef = useRef<HTMLDivElement>(null)
  const [hoverSlot, setHoverSlot] = useState<Slot | null>(null)
  const pendingSlot = useRef<Slot | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelHover() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    pendingSlot.current = null
    setHoverSlot(null)
  }

  function scheduleHover(slot: Slot) {
    // Already waiting on or showing this exact slot — no-op so micro-movements
    // within a slot don't restart the timer or flicker the preview.
    if (pendingSlot.current?.top === slot.top) return
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingSlot.current = slot
    setHoverSlot(null)
    timerRef.current = setTimeout(() => {
      setHoverSlot(pendingSlot.current)
      timerRef.current = null
    }, HOVER_DELAY_MS)
  }

  // Clean up timer on unmount so a stale setState doesn't fire on a dead column.
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!colRef.current) return
    const target = e.target as HTMLElement
    if (target.closest('[data-event="1"]')) {
      cancelHover()
      return
    }
    const rect = colRef.current.getBoundingClientRect()
    scheduleHover(snapAt(e.clientY - rect.top))
  }

  function onLeave() {
    cancelHover()
  }

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!colRef.current) return
    const rect = colRef.current.getBoundingClientRect()
    const slot = snapAt(e.clientY - rect.top)
    onCreateAt(slotToDate(day, slot))
  }

  return (
    <div
      ref={colRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="relative border-l border-white/5 cursor-pointer"
      style={{ height: totalHours * HOUR_ROW_PX }}
    >
      {Array.from({ length: totalHours }).map((_, i) => (
        <div key={i} className="border-b border-white/5" style={{ height: HOUR_ROW_PX }} />
      ))}

      {hoverSlot && (
        <div
          className="absolute left-1 right-1 pointer-events-none rounded-md transition-opacity"
          style={{
            top: hoverSlot.top,
            height: HOUR_ROW_PX,
            backgroundColor: 'rgba(193,193,255,0.06)',
            backgroundImage:
              'linear-gradient(to right, rgba(193,193,255,0.18) 1px, transparent 1px), ' +
              'linear-gradient(to bottom, rgba(193,193,255,0.18) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            border: '1px dashed rgba(193,193,255,0.45)',
          }}
        >
          <div className="px-2 pt-1 text-[10px] font-semibold tracking-wide text-brand/90 uppercase">
            {hoverSlot.label}
          </div>
        </div>
      )}

      {events.map((e) => (
        <EventBlock
          key={e.id}
          event={e}
          categories={categories}
          onSelect={onSelectEvent}
        />
      ))}
    </div>
  )
}

function EventBlock({
  event,
  categories,
  onSelect,
}: {
  event: EventRow
  categories: ReturnType<typeof useCategories>['data']
  onSelect: (e: EventRow) => void
}) {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const top = (hourFraction(start) - DAY_START_HOUR) * HOUR_ROW_PX
  const height = Math.max(28, (differenceInMinutes(end, start) / 60) * HOUR_ROW_PX)
  const cat = categoryById(categories, event.categoryId)
  const color = categoryColor(cat)

  return (
    <button
      data-event="1"
      onClick={(ev) => {
        ev.stopPropagation()
        onSelect(event)
      }}
      className="event-block absolute left-1 right-1 text-left rounded-md px-2 py-1.5 overflow-hidden cursor-pointer"
      style={{ top, height, ['--cat' as string]: color }}
    >
      <div className="event-title text-xs font-semibold truncate" style={{ color }}>
        {event.title}
      </div>
      <div className="text-[10px] text-on-surface-variant">{timeRange(start, end)}</div>
    </button>
  )
}

function NowIndicator({ now, todayIndex }: { now: Date; todayIndex: number }) {
  const top = (hourFraction(now) - DAY_START_HOUR) * HOUR_ROW_PX
  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{ top, left: 64, right: 0 }}
      aria-label={`Current time ${format(now, 'HH:mm')}`}
    >
      <div className="h-px bg-brand opacity-90" />
      <div
        className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-brand"
        style={{
          left: `calc(${todayIndex} * (100% / 7) - 5px)`,
          boxShadow: '0 0 12px rgba(193,193,255,0.7)',
        }}
      />
    </div>
  )
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
