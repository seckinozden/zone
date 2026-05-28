import { describe, expect, it } from 'vitest'
import { scoreBand, scoreBandColor } from './sleepScore'

describe('scoreBand', () => {
  it('returns good for scores ≥ 80', () => {
    expect(scoreBand(100)).toBe('good')
    expect(scoreBand(85)).toBe('good')
    expect(scoreBand(80)).toBe('good')
  })

  it('returns ok for scores 60..79', () => {
    expect(scoreBand(79)).toBe('ok')
    expect(scoreBand(72)).toBe('ok')
    expect(scoreBand(60)).toBe('ok')
  })

  it('returns poor for scores < 60', () => {
    expect(scoreBand(59)).toBe('poor')
    expect(scoreBand(0)).toBe('poor')
  })
})

describe('scoreBandColor', () => {
  it('maps each band to a distinct color', () => {
    const good = scoreBandColor('good')
    const ok = scoreBandColor('ok')
    const poor = scoreBandColor('poor')
    expect(good).not.toBe(ok)
    expect(ok).not.toBe(poor)
    expect(good).not.toBe(poor)
  })
})
