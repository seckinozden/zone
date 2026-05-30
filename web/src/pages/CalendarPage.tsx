import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react'
import { CalendarWeek } from '../components/CalendarWeek'
import { CalendarMonth } from '../components/CalendarMonth'
import { useActivityModal } from '../components/activityModalContext'

type View = 'day' | 'week' | 'month'

export function CalendarPage() {
  const [anchor, setAnchor] = useState(new Date())
  const [view, setView] = useState<View>('week')
  const { openCreate, openEdit } = useActivityModal()

  const { from, to, label } = useMemo(() => computeWindow(anchor, view), [anchor, view])

  function stepBack() {
    setAnchor((d) =>
      view === 'day' ? subDays(d, 1) : view === 'week' ? subWeeks(d, 1) : subMonths(d, 1),
    )
  }
  function stepForward() {
    setAnchor((d) =>
      view === 'day' ? addDays(d, 1) : view === 'week' ? addWeeks(d, 1) : addMonths(d, 1),
    )
  }
  function jumpToDayView(day: Date) {
    setAnchor(day)
    setView('day')
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{format(anchor, 'MMMM yyyy')}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-on-surface-variant">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`capitalize pb-1 ${
                  view === v ? 'text-on-surface border-b-2 border-brand' : ''
                }`}
              >
                {v}
              </button>
            ))}
            <span className="text-on-surface ml-2">{label}</span>
            <button onClick={stepBack}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setAnchor(new Date())} title="Today">
              <Calendar size={18} />
            </button>
            <button onClick={stepForward}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={() => openCreate({ day: anchor })}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"
        >
          <Plus size={16} /> Add Activity
        </button>
      </div>

      <div className="mt-6 flex-1 min-h-0">
        {view === 'month' ? (
          <CalendarMonth
            anchor={anchor}
            range={{ from, to }}
            onSelectDay={jumpToDayView}
            onSelectActivity={openEdit}
          />
        ) : (
          <CalendarWeek
            anchor={anchor}
            mode={view}
            range={{ from, to }}
            onSelectActivity={openEdit}
            onCreateAt={(start) => openCreate({ start })}
          />
        )}
      </div>
    </div>
  )
}

function computeWindow(anchor: Date, view: View): { from: Date; to: Date; label: string } {
  if (view === 'day') {
    return {
      from: startOfDay(anchor),
      to: endOfDay(anchor),
      label: format(anchor, 'EEEE, MMM d'),
    }
  }
  if (view === 'week') {
    const monday = startOfWeek(anchor, { weekStartsOn: 1 })
    const sunday = endOfWeek(anchor, { weekStartsOn: 1 })
    return {
      from: startOfDay(monday),
      to: endOfDay(sunday),
      label: `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d')}`,
    }
  }
  return {
    from: startOfMonth(anchor),
    to: endOfMonth(anchor),
    label: '',
  }
}
