import { useEffect, useMemo, useRef, useState } from 'react'
import { differenceInMinutes, format, isSameDay } from 'date-fns'
import { useCategories, useEvents, useUpdateEvent } from '../api/hooks'
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
import { dragStartFor, snapAt, slotToDate, type Slot } from '../lib/slot'
import type { EventRow } from '../api/client'

type Props = {
  anchor: Date
  /** 'day' = single column, 'week' = Mon→Sun. */
  mode?: 'day' | 'week'
  range: { from: Date; to: Date }
  onSelectEvent: (e: EventRow) => void
  onCreateAt: (start: Date) => void
}

/** Dwell time before the hover preview appears. Prevents flicker while scanning the grid. */
const HOVER_DELAY_MS = 400
/** Distance (px) before a pointerdown on an event becomes a drag instead of a click. */
const DRAG_THRESHOLD_PX = 4

type DragState = {
  event: EventRow
  durationMs: number
  grabOffsetMin: number
  start: Date
  pointerStartX: number
  pointerStartY: number
  hasMoved: boolean
}

export function CalendarWeek({ anchor, mode = 'week', range, onSelectEvent, onCreateAt }: Props) {
  const { data: events } = useEvents(range)
  const { data: categories } = useCategories()
  const updateMut = useUpdateEvent()
  const days = useMemo(
    () => (mode === 'day' ? [anchor] : weekDays(anchor)),
    [anchor, mode],
  )
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i)
  const colCount = days.length
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

  // ── Drag-to-move state ──
  const [drag, setDrag] = useState<DragState | null>(null)

  function onEventPointerDown(event: EventRow, e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const yWithinEvent = e.clientY - rect.top
    const grabOffsetMin = Math.max(0, Math.floor((yWithinEvent / HOUR_ROW_PX) * 60))
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    setDrag({
      event,
      durationMs: end.getTime() - start.getTime(),
      grabOffsetMin,
      start,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      hasMoved: false,
    })
  }

  useEffect(() => {
    if (!drag) return

    function onMove(e: PointerEvent) {
      if (!drag) return
      // Threshold gate: stay a click until pointer moves enough.
      if (!drag.hasMoved) {
        const dist = Math.hypot(e.clientX - drag.pointerStartX, e.clientY - drag.pointerStartY)
        if (dist < DRAG_THRESHOLD_PX) return
      }
      // Hit-test for the day column the cursor is over.
      const dayEls = Array.from(document.querySelectorAll<HTMLElement>('[data-day]'))
      let hit: { day: Date; rect: DOMRect } | null = null
      for (const el of dayEls) {
        const r = el.getBoundingClientRect()
        if (e.clientX >= r.left && e.clientX < r.right) {
          hit = { day: new Date(el.dataset.day!), rect: r }
          break
        }
      }
      if (!hit) return
      const newStart = dragStartFor({
        day: hit.day,
        pointerYInColumn: e.clientY - hit.rect.top,
        grabOffsetMin: drag.grabOffsetMin,
      })
      if (newStart.getTime() !== drag.start.getTime() || !drag.hasMoved) {
        setDrag({ ...drag, start: newStart, hasMoved: true })
      }
    }

    function onUp() {
      if (!drag) return
      const moved = drag.hasMoved
      const originalStart = new Date(drag.event.startTime)
      const changed = drag.start.getTime() !== originalStart.getTime()

      if (moved) {
        // Suppress the click event that fires immediately after pointerup,
        // so we don't trigger the column's click-to-create handler on drop.
        const stop = (ev: MouseEvent) => {
          ev.stopPropagation()
          ev.preventDefault()
          window.removeEventListener('click', stop, true)
        }
        window.addEventListener('click', stop, true)
        setTimeout(() => window.removeEventListener('click', stop, true), 50)

        if (changed) {
          const newEnd = new Date(drag.start.getTime() + drag.durationMs)
          updateMut.mutate({
            id: drag.event.id,
            input: {
              title: drag.event.title,
              startTime: drag.start.toISOString(),
              endTime: newEnd.toISOString(),
              categoryId: drag.event.categoryId,
              notes: drag.event.notes,
            },
          })
        }
      } else {
        // Not moved past the threshold — treat as a click.
        onSelectEvent(drag.event)
      }
      setDrag(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, onSelectEvent, updateMut])

  return (
    <div
      className="border border-white/5 rounded-xl overflow-hidden bg-surface-low/30 flex flex-col h-full"
      style={{ userSelect: drag?.hasMoved ? 'none' : undefined }}
    >
      <div
        className="grid border-b border-white/5 flex-shrink-0"
        style={{ gridTemplateColumns: `64px repeat(${colCount}, 1fr)` }}
      >
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
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `64px repeat(${colCount}, 1fr)` }}
        >
          <div>
            {hours.map((h) => (
              <div key={h} className="text-xs text-on-surface-variant pl-3 pt-1" style={{ height: HOUR_ROW_PX }}>
                {hourLabel(h)}
              </div>
            ))}
          </div>

          {days.map((d) => {
            const showGhost = drag?.hasMoved && isSameDay(d, drag.start)
            const dimmedId = drag?.hasMoved ? drag.event.id : null
            return (
              <DayColumn
                key={d.toISOString()}
                day={d}
                events={(events ?? []).filter((e) => isSameDay(new Date(e.startTime), d))}
                categories={categories}
                onSelectEvent={onSelectEvent}
                onCreateAt={onCreateAt}
                onEventPointerDown={onEventPointerDown}
                dimmedEventId={dimmedId}
                ghost={showGhost ? drag : null}
                disabled={!!drag}
              />
            )
          })}

          {nowInRange && <NowIndicator now={now} />}
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
  onEventPointerDown,
  dimmedEventId,
  ghost,
  disabled,
}: {
  day: Date
  events: EventRow[]
  categories: ReturnType<typeof useCategories>['data']
  onSelectEvent: (e: EventRow) => void
  onCreateAt: (start: Date) => void
  onEventPointerDown: (e: EventRow, ev: React.PointerEvent<HTMLButtonElement>) => void
  dimmedEventId: number | null
  ghost: DragState | null
  disabled: boolean
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
    if (pendingSlot.current?.top === slot.top) return
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingSlot.current = slot
    setHoverSlot(null)
    timerRef.current = setTimeout(() => {
      setHoverSlot(pendingSlot.current)
      timerRef.current = null
    }, HOVER_DELAY_MS)
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  // Suppress hover preview while a drag is in flight — the ghost block is the
  // user's feedback during drag, not the dashed create-preview.
  useEffect(() => {
    if (disabled) cancelHover()
  }, [disabled])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled || !colRef.current) return
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
      data-day={day.toISOString()}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="relative border-l border-white/5 cursor-pointer"
      style={{ height: totalHours * HOUR_ROW_PX }}
    >
      {Array.from({ length: totalHours }).map((_, i) => (
        <div key={i} className="border-b border-white/5" style={{ height: HOUR_ROW_PX }} />
      ))}

      {hoverSlot && !disabled && (
        <div
          className="absolute pointer-events-none rounded-md"
          style={{
            top: hoverSlot.top + 4,
            left: 6,
            right: 6,
            height: HOUR_ROW_PX - 8,
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
          onPointerDown={onEventPointerDown}
          dimmed={e.id === dimmedEventId}
          interactive={!disabled || e.id === dimmedEventId}
          ignoreClick={!!disabled}
          onSelect={onSelectEvent}
        />
      ))}

      {ghost && (
        <DragGhost
          start={ghost.start}
          durationMs={ghost.durationMs}
          event={ghost.event}
          categories={categories}
        />
      )}
    </div>
  )
}

function EventBlock({
  event,
  categories,
  onPointerDown,
  onSelect,
  dimmed,
  interactive,
  ignoreClick,
}: {
  event: EventRow
  categories: ReturnType<typeof useCategories>['data']
  onPointerDown: (e: EventRow, ev: React.PointerEvent<HTMLButtonElement>) => void
  onSelect: (e: EventRow) => void
  dimmed: boolean
  interactive: boolean
  ignoreClick: boolean
}) {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const rawTop = (hourFraction(start) - DAY_START_HOUR) * HOUR_ROW_PX
  const rawDur = (differenceInMinutes(end, start) / 60) * HOUR_ROW_PX
  const top = rawTop + 2
  const height = Math.max(28, rawDur - 4)
  const cat = categoryById(categories, event.categoryId)
  const color = categoryColor(cat)

  return (
    <button
      data-event="1"
      onPointerDown={(e) => {
        if (!interactive) return
        e.stopPropagation()
        onPointerDown(event, e)
      }}
      onClick={(e) => {
        // The drag system handles the click via pointerup. Stop the click here
        // so the column doesn't see it. If a drag DIDN'T happen, pointerup
        // already called onSelect. So nothing else to do.
        e.stopPropagation()
        if (ignoreClick) return
        // Fallback if pointer events were intercepted: behave like before.
        if (!interactive) onSelect(event)
      }}
      className="event-block absolute text-left rounded-md py-1.5 pr-2 overflow-hidden"
      style={{
        top,
        height,
        left: 3,
        right: 3,
        ['--cat' as string]: color,
        opacity: dimmed ? 0.35 : 1,
        cursor: dimmed ? 'grabbing' : 'grab',
      }}
    >
      <div className="event-title text-xs font-semibold truncate" style={{ color }}>
        {event.title}
      </div>
      <div className="text-[10px] text-on-surface-variant">{timeRange(start, end)}</div>
    </button>
  )
}

function DragGhost({
  start,
  durationMs,
  event,
  categories,
}: {
  start: Date
  durationMs: number
  event: EventRow
  categories: ReturnType<typeof useCategories>['data']
}) {
  const end = new Date(start.getTime() + durationMs)
  const rawTop = (hourFraction(start) - DAY_START_HOUR) * HOUR_ROW_PX
  const rawDur = (durationMs / 3_600_000) * HOUR_ROW_PX
  const top = rawTop + 2
  const height = Math.max(28, rawDur - 4)
  const cat = categoryById(categories, event.categoryId)
  const color = categoryColor(cat)

  return (
    <div
      className="drag-ghost absolute rounded-md pointer-events-none py-1.5 pr-2 overflow-hidden"
      style={{
        top,
        height,
        left: 3,
        right: 3,
        ['--cat' as string]: color,
        backgroundColor: `color-mix(in srgb, ${color} 28%, transparent)`,
        boxShadow: `inset 0 0 0 1px ${color}aa, 0 14px 30px -10px ${color}aa`,
        zIndex: 20,
      }}
    >
      <div className="text-xs font-semibold truncate" style={{ color }}>
        {event.title}
      </div>
      <div className="text-[10px] text-on-surface-variant">{timeRange(start, end)}</div>
    </div>
  )
}

function NowIndicator({ now }: { now: Date }) {
  const top = (hourFraction(now) - DAY_START_HOUR) * HOUR_ROW_PX
  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{ top, left: 64, right: 0 }}
      aria-label={`Current time ${format(now, 'HH:mm')}`}
    >
      <div className="h-px bg-brand opacity-90" />
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
