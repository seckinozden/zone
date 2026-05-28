async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ''}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type Category = { id: number; name: string; color: string; description: string | null }

export type CategoryInput = {
  name: string
  color: string
  description: string | null
}

export type EventRow = {
  id: number
  title: string
  startTime: string
  endTime: string
  categoryId: number | null
  notes: string | null
}

export type EventInput = {
  title: string
  startTime: string
  endTime: string
  categoryId: number | null
  notes: string | null
}

/** Calendar-day range, used by endpoints whose date column is LocalDate (sleep, meals, habits). */
export type DateRange = { from: Date; to: Date }

export type SleepEntry = {
  id: number
  date: string // yyyy-MM-dd
  score: number // 0..100
  durationMin: number | null
  notes: string | null
}

export type SleepInput = {
  date: string // yyyy-MM-dd
  score: number
  durationMin: number | null
  notes: string | null
}

/** Format a JS Date as ISO yyyy-MM-dd, in local time. */
function localDate(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const api = {
  listCategories: () => request<Category[]>('/api/categories'),
  createCategory: (body: CategoryInput) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: number, body: CategoryInput) =>
    request<Category>(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCategory: (id: number) =>
    request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  listEvents: (range?: { from: Date; to: Date }) => {
    const path = range
      ? `/api/events?from=${encodeURIComponent(range.from.toISOString())}&to=${encodeURIComponent(range.to.toISOString())}`
      : '/api/events'
    return request<EventRow[]>(path)
  },
  createEvent: (body: EventInput) =>
    request<EventRow>('/api/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id: number, body: EventInput) =>
    request<EventRow>(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteEvent: (id: number) =>
    request<void>(`/api/events/${id}`, { method: 'DELETE' }),

  // ── Sleep ──────────────────────────────────────────────────────────
  listSleep: (range?: DateRange) => {
    const path = range
      ? `/api/sleep?from=${localDate(range.from)}&to=${localDate(range.to)}`
      : '/api/sleep'
    return request<SleepEntry[]>(path)
  },
  createSleep: (body: SleepInput) =>
    request<SleepEntry>('/api/sleep', { method: 'POST', body: JSON.stringify(body) }),
  updateSleep: (id: number, body: SleepInput) =>
    request<SleepEntry>(`/api/sleep/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteSleep: (id: number) =>
    request<void>(`/api/sleep/${id}`, { method: 'DELETE' }),
}

export { localDate }
