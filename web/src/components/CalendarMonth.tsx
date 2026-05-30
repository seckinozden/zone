import { useMemo } from 'react'
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useCategories, useActivities } from '../api/hooks'
import { categoryById, categoryColor } from '../lib/categories'
import type { ActivityRow } from '../api/client'

type Props = {
  anchor: Date
  range: { from: Date; to: Date }
  onSelectDay: (day: Date) => void
  onSelectActivity: (e: ActivityRow) => void
}

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export function CalendarMonth({ anchor, range, onSelectDay, onSelectActivity }: Props) {
  const { data: activities = [] } = useActivities(range)
  const { data: categories } = useCategories()

  const days = useMemo(() => {
    const monthStart = startOfMonth(anchor)
    const monthEnd = endOfMonth(anchor)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [anchor])

  const activitiesByDay = useMemo(() => {
    const m = new Map<string, ActivityRow[]>()
    for (const a of activities) {
      const key = format(new Date(a.startTime), 'yyyy-MM-dd')
      const arr = m.get(key) ?? []
      arr.push(a)
      m.set(key, arr)
    }
    // Sort each day's activities by start time so the pills read top-to-bottom in time order.
    for (const arr of m.values()) {
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return m
  }, [activities])

  const today = new Date()
  const rowCount = days.length / 7

  return (
    <div className="border border-divider rounded-xl overflow-hidden bg-surface-low/30 flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-divider flex-shrink-0">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="label-caps text-center py-3">{d}</div>
        ))}
      </div>

      <div
        className="flex-1 min-h-0 grid grid-cols-7"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayActivities = activitiesByDay.get(key) ?? []
          const inMonth = isSameMonth(day, anchor)
          const isToday = isSameDay(day, today)
          const visible = dayActivities.slice(0, 3)
          const moreCount = dayActivities.length - visible.length

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`relative border-t border-l border-divider p-2 cursor-pointer hover:bg-on-surface/[0.04] flex flex-col gap-1 overflow-hidden ${
                inMonth ? '' : 'opacity-40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold leading-none ${
                    isToday
                      ? 'bg-brand text-on-brand w-6 h-6 rounded-full flex items-center justify-center'
                      : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="flex-1 min-h-0 space-y-1 overflow-hidden">
                {visible.map((e) => {
                  const cat = categoryById(categories, e.categoryId)
                  const color = categoryColor(cat)
                  return (
                    <button
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        onSelectActivity(e)
                      }}
                      className="w-full text-left rounded-md px-1.5 py-1 text-[11px] truncate hover:opacity-90"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`,
                        color,
                        borderLeft: `2px solid ${color}`,
                      }}
                    >
                      <span className="opacity-80 mr-1">
                        {format(new Date(e.startTime), 'HH:mm')}
                      </span>
                      {e.title}
                    </button>
                  )
                })}
                {moreCount > 0 && (
                  <div className="text-[10px] text-on-surface-variant px-1.5">
                    +{moreCount} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
