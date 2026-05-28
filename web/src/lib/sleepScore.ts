export type ScoreBand = 'good' | 'ok' | 'poor'

/** Map a 0–100 sleep score to a band used for badge color and sparkline tint. */
export function scoreBand(score: number): ScoreBand {
  if (score >= 80) return 'good'
  if (score >= 60) return 'ok'
  return 'poor'
}

/** Brand-colored CSS color value per band — uses semantic Tailwind colors via inline style. */
export function scoreBandColor(band: ScoreBand): string {
  switch (band) {
    case 'good':
      return '#22c55e' // green
    case 'ok':
      return '#f59e0b' // amber
    case 'poor':
      return '#ef4444' // red
  }
}
