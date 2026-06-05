import type {
  Annotation,
  BackgroundState,
  CropState,
  FilterState,
} from '../types'
import { buildFilterString } from './filters'
import { calculateAspectFit } from './presets'

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: BackgroundState
): void {
  ctx.save()
  ctx.clearRect(0, 0, width, height)

  if (bg.type === 'transparent') {
    ctx.restore()
    return
  }

  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color
    ctx.fillRect(0, 0, width, height)
  } else if (bg.type === 'gradient') {
    const angleRad = (bg.gradientAngle * Math.PI) / 180
    const cx = width / 2
    const cy = height / 2
    const len = Math.max(width, height)
    const x1 = cx - (Math.cos(angleRad) * len) / 2
    const y1 = cy - (Math.sin(angleRad) * len) / 2
    const x2 = cx + (Math.cos(angleRad) * len) / 2
    const y2 = cy + (Math.sin(angleRad) * len) / 2
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    gradient.addColorStop(0, bg.gradientStart)
    gradient.addColorStop(1, bg.gradientEnd)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  ctx.restore()
}

export function getImageDrawRect(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  crop: CropState | null
): { destX: number; destY: number; destW: number; destH: number; srcX: number; srcY: number; srcW: number; srcH: number } {
  const innerW = canvasWidth - padding * 2
  const innerH = canvasHeight - padding * 2

  const srcX = crop?.x ?? 0
  const srcY = crop?.y ?? 0
  const srcW = crop?.width ?? imageWidth
  const srcH = crop?.height ?? imageHeight

  const fit = calculateAspectFit(srcW, srcH, innerW, innerH)

  return {
    destX: padding + fit.x,
    destY: padding + fit.y,
    destW: fit.width,
    destH: fit.height,
    srcX,
    srcY,
    srcW,
    srcH,
  }
}

export function drawImageWithFilters(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rect: ReturnType<typeof getImageDrawRect>,
  filters: FilterState,
  borderRadius: number,
  shadow: boolean,
  shadowBlur: number,
  shadowOpacity: number
): void {
  ctx.save()

  const filterStr = buildFilterString(filters)
  if (filterStr !== 'none') {
    ctx.filter = filterStr
  }

  const { destX, destY, destW, destH, srcX, srcY, srcW, srcH } = rect

  if (shadow && borderRadius > 0) {
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`
    ctx.shadowBlur = shadowBlur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 8
  }

  if (borderRadius > 0) {
    roundRect(ctx, destX, destY, destW, destH, borderRadius)
    ctx.clip()
  }

  ctx.drawImage(image, srcX, srcY, srcW, srcH, destX, destY, destW, destH)
  ctx.restore()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  ctx.save()
  ctx.strokeStyle = annotation.color
  ctx.fillStyle = annotation.color
  ctx.lineWidth = annotation.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (annotation.type) {
    case 'text': {
      const fontSize = annotation.fontSize ?? 24
      ctx.font = `600 ${fontSize}px "DM Sans", sans-serif`
      ctx.fillStyle = annotation.color
      ctx.fillText(annotation.text ?? 'Text', annotation.x, annotation.y)
      break
    }
    case 'rectangle': {
      const w = annotation.width ?? 0
      const h = annotation.height ?? 0
      if (annotation.filled) {
        ctx.globalAlpha = 0.3
        ctx.fillRect(annotation.x, annotation.y, w, h)
        ctx.globalAlpha = 1
      }
      ctx.strokeRect(annotation.x, annotation.y, w, h)
      break
    }
    case 'circle': {
      const w = annotation.width ?? 0
      const h = annotation.height ?? 0
      const cx = annotation.x + w / 2
      const cy = annotation.y + h / 2
      const rx = Math.abs(w) / 2
      const ry = Math.abs(h) / 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      if (annotation.filled) {
        ctx.globalAlpha = 0.3
        ctx.fill()
        ctx.globalAlpha = 1
      }
      ctx.stroke()
      break
    }
    case 'highlight': {
      const w = annotation.width ?? 0
      const h = annotation.height ?? 0
      ctx.globalAlpha = 0.35
      ctx.fillStyle = annotation.color
      ctx.fillRect(annotation.x, annotation.y, w, h)
      ctx.globalAlpha = 1
      break
    }
    case 'line': {
      ctx.beginPath()
      ctx.moveTo(annotation.x, annotation.y)
      ctx.lineTo(annotation.x2 ?? annotation.x, annotation.y2 ?? annotation.y)
      ctx.stroke()
      break
    }
    case 'arrow': {
      drawArrow(
        ctx,
        annotation.x,
        annotation.y,
        annotation.x2 ?? annotation.x + 50,
        annotation.y2 ?? annotation.y,
        annotation.strokeWidth
      )
      break
    }
    case 'blur':
      break
  }

  if (isSelected) {
    const bounds = getSimpleBounds(annotation)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8)
    ctx.setLineDash([])
  }

  ctx.restore()
}

function getSimpleBounds(annotation: Annotation) {
  if (annotation.type === 'text') {
    const fontSize = annotation.fontSize ?? 24
    return {
      x: annotation.x,
      y: annotation.y - fontSize,
      width: (annotation.text?.length ?? 4) * fontSize * 0.55,
      height: fontSize * 1.4,
    }
  }
  if (annotation.type === 'arrow' || annotation.type === 'line') {
    const minX = Math.min(annotation.x, annotation.x2 ?? annotation.x)
    const minY = Math.min(annotation.y, annotation.y2 ?? annotation.y)
    const maxX = Math.max(annotation.x, annotation.x2 ?? annotation.x)
    const maxY = Math.max(annotation.y, annotation.y2 ?? annotation.y)
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }
  return {
    x: annotation.x,
    y: annotation.y,
    width: Math.abs(annotation.width ?? 0),
    height: Math.abs(annotation.height ?? 0),
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  lineWidth: number
): void {
  const headLength = Math.max(12, lineWidth * 4)
  const angle = Math.atan2(toY - fromY, toX - fromX)

  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()
}

export function applyBlurRegions(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  annotations: Annotation[]
): void {
  const blurBoxes = annotations.filter((a) => a.type === 'blur')
  if (blurBoxes.length === 0) return

  blurBoxes.forEach((ann) => {
    const x = Math.min(ann.x, ann.x + (ann.width ?? 0))
    const y = Math.min(ann.y, ann.y + (ann.height ?? 0))
    const w = Math.abs(ann.width ?? 0)
    const h = Math.abs(ann.height ?? 0)
    if (w < 2 || h < 2) return

    const radius = ann.blurRadius ?? 12
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = w
    tempCanvas.height = h
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h)
    tempCtx.filter = `blur(${radius}px)`
    tempCtx.drawImage(tempCanvas, 0, 0)

    ctx.save()
    ctx.filter = 'none'
    ctx.drawImage(tempCanvas, x, y)
    ctx.restore()
  })
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  filters: FilterState,
  background: BackgroundState,
  annotations: Annotation[],
  crop: CropState | null,
  selectedId: string | null
): void {
  drawBackground(ctx, canvasWidth, canvasHeight, background)

  const rect = getImageDrawRect(
    image.naturalWidth,
    image.naturalHeight,
    canvasWidth,
    canvasHeight,
    background.padding,
    crop
  )

  drawImageWithFilters(
    ctx,
    image,
    rect,
    filters,
    background.borderRadius,
    background.shadow,
    background.shadowBlur,
    background.shadowOpacity
  )

  applyBlurRegions(ctx, canvas, annotations)

  annotations
    .filter((a) => a.type !== 'blur')
    .forEach((ann) => {
      drawAnnotation(ctx, ann, ann.id === selectedId)
    })
}
