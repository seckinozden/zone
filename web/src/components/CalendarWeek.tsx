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
import type { EventRow } from '../api/client'

type Props = {
  anchor: Date
  range: { from: Date; to: Date }
  onSelectEvent: (e: EventRow) => void
}

export function CalendarWeek({ anchor, range, onSelectEvent }: Props) {
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
              events={(events ?? []).filter((e) => isSameDay(new Date(e.startTime), d))}
              categories={categories}
              onSelectEvent={onSelectEvent}
            />
          ))}

          {nowInRange && <NowIndicator now={now} todayIndex={todayIndex} />}
        </div>
      </div>
    </div>
  )
}

function DayColumn({
  events,
  categories,
  onSelectEvent,
}: {
  events: EventRow[]
  categories: ReturnType<typeof useCategories>['data']
  onSelectEvent: (e: EventRow) => void
}) {
  const totalHours = DAY_END_HOUR - DAY_START_HOUR + 1
  return (
    <div className="relative border-l border-white/5" style={{ height: totalHours * HOUR_ROW_PX }}>
      {Array.from({ length: totalHours }).map((_, i) => (
        <div key={i} className="border-b border-white/5" style={{ height: HOUR_ROW_PX }} />
      ))}
      {events.map((e) => {
        const start = new Date(e.startTime)
        const end = new Date(e.endTime)
        const top = (hourFraction(start) - DAY_START_HOUR) * HOUR_ROW_PX
        const height = Math.max(28, (differenceInMinutes(end, start) / 60) * HOUR_ROW_PX)
        const cat = categoryById(categories, e.categoryId)
        const color = categoryColor(cat)
        return (
          <button
            key={e.id}
            onClick={() => onSelectEvent(e)}
            className="absolute left-1 right-1 text-left rounded-md px-2 py-1.5 overflow-hidden"
            style={{
              top,
              height,
              backgroundColor: `${color}1a`,
              borderLeft: `3px solid ${color}`,
            }}
          >
            <div className="text-xs font-semibold truncate" style={{ color }}>{e.title}</div>
            <div className="text-[10px] text-on-surface-variant">{timeRange(start, end)}</div>
          </button>
        )
      })}
    </div>
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
