import { createContext, useContext } from 'react'
import type { EventRow } from '../api/client'

export type CreateDefaults = {
  /** Day to default to (time-of-day ignored). */
  day?: Date
  /** Specific start datetime — modal sets date + start time + end (start + 1h). */
  start?: Date
}

type Ctx = {
  openCreate: (defaults?: CreateDefaults) => void
  openEdit: (row: EventRow) => void
}

export const TaskModalContext = createContext<Ctx | null>(null)

export function useTaskModal() {
  const ctx = useContext(TaskModalContext)
  if (!ctx) throw new Error('useTaskModal must be used inside AppLayout')
  return ctx
}
