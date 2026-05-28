import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, localDate, type CategoryInput, type DateRange, type EventInput, type SleepInput } from './client'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.listCategories })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => api.createCategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoryInput }) => api.updateCategory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      // Events that referenced this category get categoryId nulled by ON DELETE SET NULL.
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export type EventsRange = { from: Date; to: Date }

export function useEvents(range?: EventsRange) {
  const key = range
    ? ['events', range.from.toISOString(), range.to.toISOString()]
    : ['events']
  return useQuery({
    queryKey: key,
    queryFn: () => api.listEvents(range),
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EventInput) => api.createEvent(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: EventInput }) => api.updateEvent(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

// ── Sleep ────────────────────────────────────────────────────────────

export function useSleep(range?: DateRange) {
  const key = range
    ? ['sleep', localDate(range.from), localDate(range.to)]
    : ['sleep']
  return useQuery({ queryKey: key, queryFn: () => api.listSleep(range) })
}

export function useCreateSleep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SleepInput) => api.createSleep(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sleep'] }),
  })
}

export function useUpdateSleep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SleepInput }) => api.updateSleep(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sleep'] }),
  })
}

export function useDeleteSleep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteSleep(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sleep'] }),
  })
}
