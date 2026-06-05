import { describe, expect, it } from 'vitest'
import {
  calculateAspectFit,
  calculateCropFit,
  getPresetDimensions,
  CANVAS_PRESETS,
} from './presets'

describe('getPresetDimensions', () => {
  it('returns original image dimensions for Original preset', () => {
    const original = CANVAS_PRESETS[0]
    expect(getPresetDimensions(original, 1920, 1080)).toEqual({
      width: 1920,
      height: 1080,
    })
  })

  it('returns preset dimensions for social presets', () => {
    const youtube = CANVAS_PRESETS.find((p) => p.label === 'YouTube 16:9')!
    expect(getPresetDimensions(youtube, 1920, 1080)).toEqual({
      width: 1280,
      height: 720,
    })
  })
})

describe('calculateAspectFit', () => {
  it('fits wide image into tall container', () => {
    const result = calculateAspectFit(1600, 900, 400, 800)
    expect(result.width).toBe(400)
    expect(result.height).toBe(225)
    expect(result.x).toBe(0)
    expect(result.y).toBe(287.5)
  })

  it('fits tall image into wide container', () => {
    const result = calculateAspectFit(900, 1600, 800, 400)
    expect(result.height).toBe(400)
    expect(result.width).toBe(225)
    expect(result.x).toBe(287.5)
    expect(result.y).toBe(0)
  })
})

describe('calculateCropFit', () => {
  it('crops wide image to square', () => {
    const result = calculateCropFit(1920, 1080, 1080, 1080)
    expect(result.width).toBe(1080)
    expect(result.height).toBe(1080)
    expect(result.x).toBe(420)
    expect(result.y).toBe(0)
  })

  it('crops tall image to 16:9', () => {
    const result = calculateCropFit(1080, 1920, 1280, 720)
    expect(result.width).toBe(1080)
    expect(result.height).toBeCloseTo(607.5, 0)
    expect(result.x).toBe(0)
    expect(result.y).toBeCloseTo(656.25, 0)
  })
})
