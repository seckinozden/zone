import { createContext, useContext } from 'react'
import type { EventRow } from '../api/client'

type Ctx = {
  openCreate: (day?: Date) => void
  openEdit: (row: EventRow) => void
}

export const TaskModalContext = createContext<Ctx | null>(null)

export function useTaskModal() {
  const ctx = useContext(TaskModalContext)
  if (!ctx) throw new Error('useTaskModal must be used inside AppLayout')
  return ctx
}
