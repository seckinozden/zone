import { describe, expect, it } from 'vitest'
import { dragStartFor, slotToDate, snapAt } from './slot'
import { HOUR_ROW_PX } from './time'

describe('snapAt', () => {
  it('returns midnight at y=0', () => {
    const s = snapAt(0)
    expect(s).toEqual({ top: 0, hours: 0, minutes: 0, label: '12:00 AM' })
  })

  it('floor-snaps 10:14 down to 10:00', () => {
    const s = snapAt((10 + 14 / 60) * HOUR_ROW_PX)
    expect(s.hours).toBe(10)
    expect(s.minutes).toBe(0)
    expect(s.label).toBe('10:00 AM')
  })

  it('floor-snaps 10:16 down to 10:15', () => {
    const s = snapAt((10 + 16 / 60) * HOUR_ROW_PX)
    expect(s.hours).toBe(10)
    expect(s.minutes).toBe(15)
    expect(s.label).toBe('10:15 AM')
  })

  it('formats noon as 12:00 PM', () => {
    expect(snapAt(12 * HOUR_ROW_PX).label).toBe('12:00 PM')
  })

  it('formats 1 PM correctly (not 13:00 PM)', () => {
    const s = snapAt(13 * HOUR_ROW_PX)
    expect(s.hours).toBe(13)
    expect(s.label).toBe('1:00 PM')
  })

  it('formats midnight as 12:00 AM (not 0:00)', () => {
    expect(snapAt(0).label).toBe('12:00 AM')
  })

  it('clamps below 0 to the first slot', () => {
    const s = snapAt(-1000)
    expect(s.hours).toBe(0)
    expect(s.minutes).toBe(0)
    expect(s.top).toBe(0)
  })

  it('clamps past the end of day to the last slot (23:45)', () => {
    const s = snapAt(10_000)
    expect(s.hours).toBe(23)
    expect(s.minutes).toBe(45)
    expect(s.label).toBe('11:45 PM')
  })

  it('produces a top consistent with the snapped time', () => {
    const s = snapAt((14 + 23 / 60) * HOUR_ROW_PX) // 14:23
    expect(s.hours).toBe(14)
    expect(s.minutes).toBe(15)
    // 14h15m * 64px/hr = 912px
    expect(s.top).toBe(14.25 * HOUR_ROW_PX)
  })
})

describe('slotToDate', () => {
  it('applies a slot to the given day, zeroing seconds/ms', () => {
    const day = new Date(2026, 4, 27) // May 27, 2026 (month is 0-indexed)
    const d = slotToDate(day, { top: 0, hours: 14, minutes: 30, label: '2:30 PM' })
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(4)
    expect(d.getDate()).toBe(27)
    expect(d.getHours()).toBe(14)
    expect(d.getMinutes()).toBe(30)
    expect(d.getSeconds()).toBe(0)
    expect(d.getMilliseconds()).toBe(0)
  })

  it('does not mutate the input day', () => {
    const day = new Date(2026, 4, 27, 9, 0, 0)
    const before = day.getTime()
    slotToDate(day, { top: 0, hours: 14, minutes: 30, label: '' })
    expect(day.getTime()).toBe(before)
  })
})

describe('dragStartFor', () => {
  const day = new Date(2026, 4, 27) // May 27, 2026

  it('preserves grab offset — grab at +30min, drop at 14:00 → start 13:30', () => {
    const d = dragStartFor({
      day,
      pointerYInColumn: 14 * HOUR_ROW_PX, // cursor at 14:00
      grabOffsetMin: 30,
    })
    expect(d.getHours()).toBe(13)
    expect(d.getMinutes()).toBe(30)
  })

  it('grab at 0 (top edge) drops the start at the cursor time', () => {
    const d = dragStartFor({
      day,
      pointerYInColumn: 9 * HOUR_ROW_PX,
      grabOffsetMin: 0,
    })
    expect(d.getHours()).toBe(9)
    expect(d.getMinutes()).toBe(0)
  })

  it('snaps to 15-min slots', () => {
    const d = dragStartFor({
      day,
      pointerYInColumn: (10 + 22 / 60) * HOUR_ROW_PX, // cursor at 10:22, no grab offset
      grabOffsetMin: 0,
    })
    expect(d.getHours()).toBe(10)
    expect(d.getMinutes()).toBe(15)
  })

  it('clamps below 0 (cursor 0:30 with grab offset 60 → start 00:00)', () => {
    const d = dragStartFor({
      day,
      pointerYInColumn: 0.5 * HOUR_ROW_PX, // 0:30
      grabOffsetMin: 60,
    })
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
  })

  it('lands on the given day (not the cursor calendar day)', () => {
    const d = dragStartFor({
      day: new Date(2026, 11, 31), // Dec 31, 2026
      pointerYInColumn: 9 * HOUR_ROW_PX,
      grabOffsetMin: 0,
    })
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(11)
    expect(d.getDate()).toBe(31)
  })
})
