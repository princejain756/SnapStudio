import type { Annotation } from '../types'

export function getAnnotationBounds(annotation: Annotation): {
  x: number
  y: number
  width: number
  height: number
} {
  switch (annotation.type) {
    case 'text': {
      const fontSize = annotation.fontSize ?? 24
      const textWidth = (annotation.text?.length ?? 4) * fontSize * 0.55
      return {
        x: annotation.x,
        y: annotation.y - fontSize,
        width: textWidth,
        height: fontSize * 1.4,
      }
    }
    case 'arrow':
    case 'line': {
      const x2 = annotation.x2 ?? annotation.x
      const y2 = annotation.y2 ?? annotation.y
      const minX = Math.min(annotation.x, x2)
      const minY = Math.min(annotation.y, y2)
      const maxX = Math.max(annotation.x, x2)
      const maxY = Math.max(annotation.y, y2)
      const padding = annotation.strokeWidth + 10
      return {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      }
    }
    default: {
      const w = annotation.width ?? 0
      const h = annotation.height ?? 0
      return {
        x: Math.min(annotation.x, annotation.x + w),
        y: Math.min(annotation.y, annotation.y + h),
        width: Math.abs(w),
        height: Math.abs(h),
      }
    }
  }
}

export function isPointInAnnotation(
  annotation: Annotation,
  px: number,
  py: number
): boolean {
  const bounds = getAnnotationBounds(annotation)
  return (
    px >= bounds.x &&
    px <= bounds.x + bounds.width &&
    py >= bounds.y &&
    py <= bounds.y + bounds.height
  )
}

export function generateAnnotationId(): string {
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
