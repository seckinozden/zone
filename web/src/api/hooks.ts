import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type EventInput } from './client'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.listCategories })
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
