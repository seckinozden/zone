import { useState } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { ActivityModal } from './ActivityModal'
import type { ActivityRow } from '../api/client'
import { ActivityModalContext, type CreateDefaults } from './activityModalContext'

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ActivityRow | null>(null)
  const [defaults, setDefaults] = useState<CreateDefaults | undefined>(undefined)

  const ctx = {
    openCreate: (d?: CreateDefaults) => {
      setEditing(null)
      setDefaults(d)
      setOpen(true)
    },
    openEdit: (row: ActivityRow) => {
      setEditing(row)
      setDefaults(undefined)
      setOpen(true)
    },
  }

  return (
    <ActivityModalContext.Provider value={ctx}>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 min-h-0 px-8 py-6 flex flex-col overflow-hidden">
          <Outlet />
        </main>
        <ActivityModal
          open={open}
          initial={editing}
          defaultDay={defaults?.day}
          defaultStart={defaults?.start}
          onClose={() => setOpen(false)}
        />
      </div>
    </ActivityModalContext.Provider>
  )
}
