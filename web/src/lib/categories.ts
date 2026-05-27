import type { Category } from '../api/client'

export function categoryColor(c: Category | null | undefined): string {
  if (!c) return '#c1c1ff'
  if (c.color?.startsWith('#')) return c.color
  return '#c1c1ff'
}

export function categoryById(list: Category[] | undefined, id: number | null) {
  if (!list || id == null) return null
  return list.find((c) => c.id === id) ?? null
}
