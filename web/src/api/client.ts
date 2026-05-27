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

export type Category = { id: number; name: string; color: string }

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

export const api = {
  listCategories: () => request<Category[]>('/api/categories'),
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
}
