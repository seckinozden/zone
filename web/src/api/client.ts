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

export type ActivityRow = {
  id: number
  title: string
  startTime: string
  endTime: string
  categoryId: number | null
  notes: string | null
}

export type ActivityInput = {
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

export type ExerciseEntry = {
  id: number
  performedAt: string
  type: string
  durationMin: number | null
  caloriesBurned: number
  notes: string | null
}

export type ExerciseInput = {
  performedAt: string
  type: string
  durationMin: number | null
  caloriesBurned: number
  notes: string | null
}

export type Settings = {
  weeklyCalorieBudget: number
}

export type SettingsInput = {
  weeklyCalorieBudget: number
}

export type Meal = {
  id: number
  date: string
  mealType: string
  description: string
  calories: number
}

export type MealInput = {
  date: string
  mealType: string
  description: string
  calories: number
}

export type Habit = {
  id: number
  name: string
  color: string
  targetKind: 'daily' | 'weekly'
  targetCount: number
}

export type HabitInput = {
  name: string
  color: string
  targetKind: 'daily' | 'weekly'
  targetCount: number
}

export type HabitCompletion = {
  id: number
  habitId: number
  date: string
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
  listActivities: (range?: { from: Date; to: Date }) => {
    const path = range
      ? `/api/activities?from=${encodeURIComponent(range.from.toISOString())}&to=${encodeURIComponent(range.to.toISOString())}`
      : '/api/activities'
    return request<ActivityRow[]>(path)
  },
  createActivity: (body: ActivityInput) =>
    request<ActivityRow>('/api/activities', { method: 'POST', body: JSON.stringify(body) }),
  updateActivity: (id: number, body: ActivityInput) =>
    request<ActivityRow>(`/api/activities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteActivity: (id: number) =>
    request<void>(`/api/activities/${id}`, { method: 'DELETE' }),

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

  // ── Exercise ───────────────────────────────────────────────────────
  listExercise: (range?: { from: Date; to: Date }) => {
    const path = range
      ? `/api/exercise?from=${encodeURIComponent(range.from.toISOString())}&to=${encodeURIComponent(range.to.toISOString())}`
      : '/api/exercise'
    return request<ExerciseEntry[]>(path)
  },
  createExercise: (body: ExerciseInput) =>
    request<ExerciseEntry>('/api/exercise', { method: 'POST', body: JSON.stringify(body) }),
  updateExercise: (id: number, body: ExerciseInput) =>
    request<ExerciseEntry>(`/api/exercise/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteExercise: (id: number) =>
    request<void>(`/api/exercise/${id}`, { method: 'DELETE' }),

  // ── Settings ───────────────────────────────────────────────────────
  getSettings: () => request<Settings>('/api/settings'),
  updateSettings: (body: SettingsInput) =>
    request<Settings>('/api/settings', { method: 'PATCH', body: JSON.stringify(body) }),

  // ── Meals ──────────────────────────────────────────────────────────
  listMeals: (range?: DateRange) => {
    const path = range
      ? `/api/meals?from=${localDate(range.from)}&to=${localDate(range.to)}`
      : '/api/meals'
    return request<Meal[]>(path)
  },
  createMeal: (body: MealInput) =>
    request<Meal>('/api/meals', { method: 'POST', body: JSON.stringify(body) }),
  updateMeal: (id: number, body: MealInput) =>
    request<Meal>(`/api/meals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMeal: (id: number) =>
    request<void>(`/api/meals/${id}`, { method: 'DELETE' }),

  // ── Habits ─────────────────────────────────────────────────────────
  listHabits: () => request<Habit[]>('/api/habits'),
  createHabit: (body: HabitInput) =>
    request<Habit>('/api/habits', { method: 'POST', body: JSON.stringify(body) }),
  updateHabit: (id: number, body: HabitInput) =>
    request<Habit>(`/api/habits/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteHabit: (id: number) =>
    request<void>(`/api/habits/${id}`, { method: 'DELETE' }),
  listHabitCompletions: (range: DateRange) =>
    request<HabitCompletion[]>(`/api/habits/completions?from=${localDate(range.from)}&to=${localDate(range.to)}`),
  completeHabit: (id: number, date: string) =>
    request<HabitCompletion>(`/api/habits/${id}/completions/${date}`, { method: 'PUT' }),
  uncompleteHabit: (id: number, date: string) =>
    request<void>(`/api/habits/${id}/completions/${date}`, { method: 'DELETE' }),
}

export { localDate }
