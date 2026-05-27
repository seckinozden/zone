import { useState } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { TaskModal } from './TaskModal'
import type { EventRow } from '../api/client'
import { TaskModalContext, type CreateDefaults } from './taskModalContext'

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventRow | null>(null)
  const [defaults, setDefaults] = useState<CreateDefaults | undefined>(undefined)

  const ctx = {
    openCreate: (d?: CreateDefaults) => {
      setEditing(null)
      setDefaults(d)
      setOpen(true)
    },
    openEdit: (row: EventRow) => {
      setEditing(row)
      setDefaults(undefined)
      setOpen(true)
    },
  }

  return (
    <TaskModalContext.Provider value={ctx}>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 min-h-0 px-8 py-6 flex flex-col overflow-hidden">
          <Outlet />
        </main>
        <TaskModal
          open={open}
          initial={editing}
          defaultDay={defaults?.day}
          defaultStart={defaults?.start}
          onClose={() => setOpen(false)}
        />
      </div>
    </TaskModalContext.Provider>
  )
}
