import type { ExportFormat } from '../types'

export function generateExportFilename(
  originalName: string,
  format: ExportFormat
): string {
  const baseName = originalName.replace(/\.[^.]+$/, '') || 'snapstudio-export'
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${sanitized}-edited.${format}`
}

export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/png'
  }
}

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: ExportFormat,
  quality: number
): void {
  const mimeType = getMimeType(format)
  const dataUrl =
    format === 'png'
      ? canvas.toDataURL(mimeType)
      : canvas.toDataURL(mimeType, quality)

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
