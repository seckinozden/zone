import { useState } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { TaskModal } from './TaskModal'
import type { EventRow } from '../api/client'
import { TaskModalContext } from './taskModalContext'

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventRow | null>(null)
  const [defaultDay, setDefaultDay] = useState<Date | undefined>(undefined)

  const ctx = {
    openCreate: (day?: Date) => {
      setEditing(null)
      setDefaultDay(day)
      setOpen(true)
    },
    openEdit: (row: EventRow) => {
      setEditing(row)
      setDefaultDay(undefined)
      setOpen(true)
    },
  }

  return (
    <TaskModalContext.Provider value={ctx}>
      <div className="flex h-full">
        <Sidebar onCreateTask={() => ctx.openCreate()} />
        <main className="flex-1 min-h-0 px-8 py-6 flex flex-col overflow-hidden">
          <Outlet />
        </main>
        <TaskModal
          open={open}
          initial={editing}
          defaultDay={defaultDay}
          onClose={() => setOpen(false)}
        />
      </div>
    </TaskModalContext.Provider>
  )
}
