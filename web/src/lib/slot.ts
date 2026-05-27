import { DAY_END_HOUR, DAY_START_HOUR, HOUR_ROW_PX } from './time'

/** Quarter-hour grid that the calendar snaps to. */
export const SNAP_MINUTES = 15

export type Slot = {
  /** y-offset inside the schedule grid (px). */
  top: number
  /** 0–23 in 24-hour time. */
  hours: number
  /** 0/15/30/45. */
  minutes: number
  /** Display label, e.g. "1:15 PM". */
  label: string
}

/** Floor-snap a click y-position to the nearest 15-minute slot. */
export function snapAt(y: number): Slot {
  const dayStartMin = DAY_START_HOUR * 60
  const dayEndMin = (DAY_END_HOUR + 1) * 60 - SNAP_MINUTES
  const raw = (y / HOUR_ROW_PX) * 60 + dayStartMin
  const clamped = Math.max(dayStartMin, Math.min(dayEndMin, raw))
  const snapped = Math.floor(clamped / SNAP_MINUTES) * SNAP_MINUTES
  const hours = Math.floor(snapped / 60)
  const minutes = snapped % 60
  const top = ((snapped - dayStartMin) / 60) * HOUR_ROW_PX
  const period = hours < 12 ? 'AM' : 'PM'
  const hh = ((hours + 11) % 12) + 1
  const label = `${hh}:${minutes.toString().padStart(2, '0')} ${period}`
  return { top, hours, minutes, label }
}

/** Project a slot's time-of-day onto a given calendar day. */
export function slotToDate(day: Date, slot: Slot): Date {
  const d = new Date(day)
  d.setHours(slot.hours, slot.minutes, 0, 0)
  return d
}

/**
 * Compute the new event start during a drag, preserving the user's "grab point"
 * relative to the event. Snaps to 15-min slots and clamps to start-of-day.
 *
 * - `day` — the calendar day the cursor is currently over.
 * - `pointerYInColumn` — cursor Y relative to that column's top edge.
 * - `grabOffsetMin` — minutes from the dragged event's start where the user
 *   initially grabbed it (so the cursor stays at the same relative spot).
 */
export function dragStartFor(opts: {
  day: Date
  pointerYInColumn: number
  grabOffsetMin: number
}): Date {
  const slot = snapAt(opts.pointerYInColumn)
  const cursorMin = slot.hours * 60 + slot.minutes
  const rawStartMin = cursorMin - opts.grabOffsetMin
  const clampedMin = Math.max(0, rawStartMin)
  const snappedMin = Math.floor(clampedMin / SNAP_MINUTES) * SNAP_MINUTES
  const d = new Date(opts.day)
  d.setHours(Math.floor(snappedMin / 60), snappedMin % 60, 0, 0)
  return d
}
