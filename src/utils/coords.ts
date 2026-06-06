import type { CropState } from '../types'
import { getImageDrawRect } from './canvas'

export function canvasPointToImageCrop(
  canvasX: number,
  canvasY: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  existingCrop: CropState | null
): { x: number; y: number } {
  const rect = getImageDrawRect(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    padding,
    existingCrop
  )
  const relX = (canvasX - rect.destX) / rect.destW
  const relY = (canvasY - rect.destY) / rect.destH
  return {
    x: rect.srcX + relX * rect.srcW,
    y: rect.srcY + relY * rect.srcH,
  }
}

export function imageCropToCanvasRect(
  crop: CropState,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  fullCrop: CropState | null
): { x: number; y: number; width: number; height: number } {
  const rect = getImageDrawRect(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    padding,
    fullCrop
  )
  const relX = (crop.x - rect.srcX) / rect.srcW
  const relY = (crop.y - rect.srcY) / rect.srcH
  const relW = crop.width / rect.srcW
  const relH = crop.height / rect.srcH
  return {
    x: rect.destX + relX * rect.destW,
    y: rect.destY + relY * rect.destH,
    width: relW * rect.destW,
    height: relH * rect.destH,
  }
}
