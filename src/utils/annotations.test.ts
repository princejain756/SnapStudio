import { describe, expect, it } from 'vitest'
import { getAnnotationBounds, isPointInAnnotation } from './annotations'
import type { Annotation } from '../types'

describe('getAnnotationBounds', () => {
  it('calculates rectangle bounds', () => {
    const ann: Annotation = {
      id: '1',
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      color: '#fff',
      strokeWidth: 2,
    }
    expect(getAnnotationBounds(ann)).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    })
  })

  it('calculates arrow bounds with padding', () => {
    const ann: Annotation = {
      id: '2',
      type: 'arrow',
      x: 0,
      y: 0,
      x2: 100,
      y2: 50,
      color: '#fff',
      strokeWidth: 3,
    }
    const bounds = getAnnotationBounds(ann)
    expect(bounds.x).toBeLessThan(0)
    expect(bounds.width).toBeGreaterThan(100)
  })

  it('calculates text bounds', () => {
    const ann: Annotation = {
      id: '3',
      type: 'text',
      x: 50,
      y: 100,
      text: 'Hello',
      fontSize: 24,
      color: '#fff',
      strokeWidth: 1,
    }
    const bounds = getAnnotationBounds(ann)
    expect(bounds.y).toBe(76)
    expect(bounds.height).toBeCloseTo(33.6)
  })
})

describe('isPointInAnnotation', () => {
  it('detects point inside rectangle', () => {
    const ann: Annotation = {
      id: '1',
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      color: '#fff',
      strokeWidth: 2,
    }
    expect(isPointInAnnotation(ann, 50, 50)).toBe(true)
    expect(isPointInAnnotation(ann, 5, 5)).toBe(false)
  })
})
