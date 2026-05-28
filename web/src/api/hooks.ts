import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  localDate,
  type CategoryInput,
  type DateRange,
  type EventInput,
  type ExerciseInput,
  type HabitInput,
  type MealInput,
  type SettingsInput,
  type SleepInput,
} from './client'

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

// ── Exercise ─────────────────────────────────────────────────────────

export function useExercise(range?: EventsRange) {
  const key = range
    ? ['exercise', range.from.toISOString(), range.to.toISOString()]
    : ['exercise']
  return useQuery({ queryKey: key, queryFn: () => api.listExercise(range) })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ExerciseInput) => api.createExercise(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise'] }),
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ExerciseInput }) => api.updateExercise(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise'] }),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteExercise(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise'] }),
  })
}

// ── Settings ─────────────────────────────────────────────────────────

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: api.getSettings })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SettingsInput) => api.updateSettings(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}

// ── Meals ────────────────────────────────────────────────────────────

export function useMeals(range?: DateRange) {
  const key = range
    ? ['meals', localDate(range.from), localDate(range.to)]
    : ['meals']
  return useQuery({ queryKey: key, queryFn: () => api.listMeals(range) })
}

export function useCreateMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MealInput) => api.createMeal(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  })
}

export function useUpdateMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MealInput }) => api.updateMeal(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  })
}

export function useDeleteMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteMeal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  })
}

// ── Habits ───────────────────────────────────────────────────────────

export function useHabits() {
  return useQuery({ queryKey: ['habits'], queryFn: api.listHabits })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: HabitInput) => api.createHabit(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: HabitInput }) => api.updateHabit(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteHabit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['habit-completions'] })
    },
  })
}

export function useHabitCompletions(range: DateRange) {
  return useQuery({
    queryKey: ['habit-completions', localDate(range.from), localDate(range.to)],
    queryFn: () => api.listHabitCompletions(range),
  })
}

export function useCompleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) => api.completeHabit(id, date),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit-completions'] }),
  })
}

export function useUncompleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) => api.uncompleteHabit(id, date),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit-completions'] }),
  })
}
