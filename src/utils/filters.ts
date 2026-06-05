import type { FilterState } from '../types'

export function buildFilterString(filters: FilterState): string {
  const parts: string[] = []

  if (filters.brightness !== 100) {
    parts.push(`brightness(${filters.brightness}%)`)
  }
  if (filters.contrast !== 100) {
    parts.push(`contrast(${filters.contrast}%)`)
  }
  if (filters.saturation !== 100) {
    parts.push(`saturate(${filters.saturation}%)`)
  }
  if (filters.grayscale > 0) {
    parts.push(`grayscale(${filters.grayscale}%)`)
  }
  if (filters.blur > 0) {
    parts.push(`blur(${filters.blur}px)`)
  }
  if (filters.sepia > 0) {
    parts.push(`sepia(${filters.sepia}%)`)
  }

  return parts.length > 0 ? parts.join(' ') : 'none'
}
