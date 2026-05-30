import { createContext, useContext } from 'react'
import type { ActivityRow } from '../api/client'

export type CreateDefaults = {
  /** Day to default to (time-of-day ignored). */
  day?: Date
  /** Specific start datetime — modal sets date + start time + end (start + 1h). */
  start?: Date
}

type Ctx = {
  openCreate: (defaults?: CreateDefaults) => void
  openEdit: (row: ActivityRow) => void
}

export const ActivityModalContext = createContext<Ctx | null>(null)

export function useActivityModal() {
  const ctx = useContext(ActivityModalContext)
  if (!ctx) throw new Error('useActivityModal must be used inside AppLayout')
  return ctx
}
