export type Tool =
  | 'select'
  | 'text'
  | 'arrow'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'highlight'
  | 'blur'

export type Annotation = {
  id: string
  type: Tool
  x: number
  y: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  text?: string
  color: string
  strokeWidth: number
  fontSize?: number
  filled?: boolean
  blurRadius?: number
}

export type FilterState = {
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  blur: number
  sepia: number
}

export type CanvasPreset = {
  label: string
  width: number
  height: number
  aspectRatio?: number
}

export type BackgroundType = 'transparent' | 'solid' | 'gradient'

export type BackgroundState = {
  type: BackgroundType
  color: string
  gradientStart: string
  gradientEnd: string
  gradientAngle: number
  padding: number
  borderRadius: number
  shadow: boolean
  shadowBlur: number
  shadowOpacity: number
}

export type ExportFormat = 'png' | 'jpeg' | 'webp'

export type ExportSettings = {
  format: ExportFormat
  quality: number
  scale: number
}

export type ImageInfo = {
  fileName: string
  width: number
  height: number
  mimeType: string
  objectUrl: string
}

export type CropState = {
  x: number
  y: number
  width: number
  height: number
}

export type EditorState = {
  image: HTMLImageElement | null
  imageInfo: ImageInfo | null
  activeTool: Tool
  annotations: Annotation[]
  selectedId: string | null
  filters: FilterState
  canvasWidth: number
  canvasHeight: number
  crop: CropState | null
  background: BackgroundState
  exportSettings: ExportSettings
}

export const DEFAULT_FILTERS: FilterState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  blur: 0,
  sepia: 0,
}

export const DEFAULT_BACKGROUND: BackgroundState = {
  type: 'transparent',
  color: '#1a1f2e',
  gradientStart: '#3b82f6',
  gradientEnd: '#8b5cf6',
  gradientAngle: 135,
  padding: 0,
  borderRadius: 0,
  shadow: false,
  shadowBlur: 24,
  shadowOpacity: 0.4,
}

export const DEFAULT_EXPORT: ExportSettings = {
  format: 'png',
  quality: 0.92,
  scale: 1,
}
