import type { CanvasPreset } from '../types'

export const CANVAS_PRESETS: CanvasPreset[] = [
  { label: 'Original', width: 0, height: 0 },
  { label: 'Square 1:1', width: 1080, height: 1080, aspectRatio: 1 },
  { label: 'YouTube 16:9', width: 1280, height: 720, aspectRatio: 16 / 9 },
  { label: 'X Post 16:9', width: 1200, height: 675, aspectRatio: 16 / 9 },
  { label: 'LinkedIn 1.91:1', width: 1200, height: 628, aspectRatio: 1.91 },
  { label: 'Instagram 4:5', width: 1080, height: 1350, aspectRatio: 4 / 5 },
  { label: 'Story 9:16', width: 1080, height: 1920, aspectRatio: 9 / 16 },
]

export function getPresetDimensions(
  preset: CanvasPreset,
  imageWidth: number,
  imageHeight: number
): { width: number; height: number } {
  if (preset.width === 0 && preset.height === 0) {
    return { width: imageWidth, height: imageHeight }
  }
  return { width: preset.width, height: preset.height }
}

export function calculateAspectFit(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): { x: number; y: number; width: number; height: number } {
  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = targetWidth / targetHeight

  let width: number
  let height: number

  if (sourceRatio > targetRatio) {
    width = targetWidth
    height = targetWidth / sourceRatio
  } else {
    height = targetHeight
    width = targetHeight * sourceRatio
  }

  const x = (targetWidth - width) / 2
  const y = (targetHeight - height) / 2

  return { x, y, width, height }
}

export function calculateCropFit(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; width: number; height: number } {
  const imageRatio = imageWidth / imageHeight
  const canvasRatio = canvasWidth / canvasHeight

  let cropWidth: number
  let cropHeight: number

  if (imageRatio > canvasRatio) {
    cropHeight = imageHeight
    cropWidth = imageHeight * canvasRatio
  } else {
    cropWidth = imageWidth
    cropHeight = imageWidth / canvasRatio
  }

  const x = (imageWidth - cropWidth) / 2
  const y = (imageHeight - cropHeight) / 2

  return { x, y, width: cropWidth, height: cropHeight }
}
