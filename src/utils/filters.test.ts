import { describe, expect, it } from 'vitest'
import { buildFilterString } from './filters'
import { DEFAULT_FILTERS } from '../types'

describe('buildFilterString', () => {
  it('returns none for default filters', () => {
    expect(buildFilterString(DEFAULT_FILTERS)).toBe('none')
  })

  it('builds brightness filter', () => {
    expect(buildFilterString({ ...DEFAULT_FILTERS, brightness: 120 })).toBe(
      'brightness(120%)'
    )
  })

  it('combines multiple filters', () => {
    const result = buildFilterString({
      ...DEFAULT_FILTERS,
      brightness: 110,
      contrast: 90,
      grayscale: 50,
    })
    expect(result).toBe('brightness(110%) contrast(90%) grayscale(50%)')
  })

  it('includes blur and sepia', () => {
    const result = buildFilterString({
      ...DEFAULT_FILTERS,
      blur: 5,
      sepia: 80,
    })
    expect(result).toBe('blur(5px) sepia(80%)')
  })
})
