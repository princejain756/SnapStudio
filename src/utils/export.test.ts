import { describe, expect, it } from 'vitest'
import { generateExportFilename, getMimeType } from './export'

describe('generateExportFilename', () => {
  it('replaces extension with export format', () => {
    expect(generateExportFilename('photo.jpg', 'png')).toBe('photo-edited.png')
  })

  it('sanitizes special characters', () => {
    expect(generateExportFilename('my photo (1).png', 'webp')).toBe(
      'my-photo-1-edited.webp'
    )
  })

  it('uses default name when empty', () => {
    expect(generateExportFilename('', 'jpeg')).toBe('snapstudio-export-edited.jpeg')
  })
})

describe('getMimeType', () => {
  it('returns correct mime types', () => {
    expect(getMimeType('png')).toBe('image/png')
    expect(getMimeType('jpeg')).toBe('image/jpeg')
    expect(getMimeType('webp')).toBe('image/webp')
  })
})
