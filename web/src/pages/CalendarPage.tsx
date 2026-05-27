import { useMemo, useState } from 'react'
import { addDays, addWeeks, endOfDay, format, startOfDay, startOfWeek, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react'
import { CalendarWeek } from '../components/CalendarWeek'
import { useTaskModal } from '../components/taskModalContext'

export function CalendarPage() {
  const [anchor, setAnchor] = useState(new Date())
  const { openCreate, openEdit } = useTaskModal()

  const { from, to } = useMemo(() => {
    const monday = startOfWeek(anchor, { weekStartsOn: 1 })
    const sunday = addDays(monday, 6)
    return { from: startOfDay(monday), to: endOfDay(sunday) }
  }, [anchor])

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{format(anchor, 'MMMM yyyy')}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-on-surface-variant">
            <span className="text-on-surface">
              {format(from, 'MMM d')} – {format(to, 'MMM d')}
            </span>
            <button onClick={() => setAnchor((d) => subWeeks(d, 1))} className="ml-2">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setAnchor(new Date())} title="Today">
              <Calendar size={18} />
            </button>
            <button onClick={() => setAnchor((d) => addWeeks(d, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={() => openCreate(anchor)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-on-brand font-semibold"
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      <div className="mt-6 flex-1 min-h-0">
        <CalendarWeek anchor={anchor} range={{ from, to }} onSelectEvent={openEdit} />
      </div>
    </div>
  )
}
