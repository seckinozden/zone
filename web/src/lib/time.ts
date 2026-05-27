import { addDays, format, parseISO, startOfWeek } from 'date-fns'

export const DAY_START_HOUR = 0
export const DAY_END_HOUR = 23
export const HOUR_ROW_PX = 64
export const SCROLL_ANCHOR_HOUR = 6

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function monthLabel(d: Date) {
  return format(d, 'MMMM')
}

export function isoLocal(d: Date) {
  return format(d, "yyyy-MM-dd'T'HH:mm:ssxxx")
}

export function parse(s: string) {
  return parseISO(s)
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function hourLabel(h: number) {
  const hh24 = h % 24
  const period = hh24 < 12 ? 'AM' : 'PM'
  const hh = ((hh24 + 11) % 12) + 1
  return `${hh.toString().padStart(2, '0')} ${period}`
}

export function timeRange(start: Date, end: Date) {
  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
}

export function hourFraction(d: Date) {
  return d.getHours() + d.getMinutes() / 60
}
