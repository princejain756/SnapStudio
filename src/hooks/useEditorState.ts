import { useCallback, useState } from 'react'
import type {
  Annotation,
  BackgroundState,
  CropState,
  ExportSettings,
  FilterState,
  ImageInfo,
  Tool,
} from '../types'
import {
  DEFAULT_BACKGROUND,
  DEFAULT_EXPORT,
  DEFAULT_FILTERS,
} from '../types'
import { calculateCropFit } from '../utils/presets'
import { generateAnnotationId } from '../utils/annotations'

export function useEditorState() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [canvasWidth, setCanvasWidth] = useState(1080)
  const [canvasHeight, setCanvasHeight] = useState(1080)
  const [crop, setCrop] = useState<CropState | null>(null)
  const [background, setBackground] = useState<BackgroundState>(DEFAULT_BACKGROUND)
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT)

  const loadImage = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      setImage(img)
      setImageInfo({
        fileName: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        mimeType: file.type,
        objectUrl,
      })
      setCanvasWidth(img.naturalWidth)
      setCanvasHeight(img.naturalHeight)
      setCrop(null)
      setAnnotations([])
      setSelectedId(null)
      setFilters(DEFAULT_FILTERS)
    }

    img.src = objectUrl
  }, [])

  const clearImage = useCallback(() => {
    if (imageInfo?.objectUrl) {
      URL.revokeObjectURL(imageInfo.objectUrl)
    }
    setImage(null)
    setImageInfo(null)
    setAnnotations([])
    setSelectedId(null)
    setCrop(null)
    setFilters(DEFAULT_FILTERS)
    setBackground(DEFAULT_BACKGROUND)
  }, [imageInfo])

  const setCanvasDimensions = useCallback(
    (width: number, height: number) => {
      setCanvasWidth(width)
      setCanvasHeight(height)
      if (image) {
        const newCrop = calculateCropFit(
          image.naturalWidth,
          image.naturalHeight,
          width,
          height
        )
        setCrop(newCrop)
      }
    },
    [image]
  )

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id'>) => {
    const id = generateAnnotationId()
    setAnnotations((prev) => [...prev, { ...annotation, id }])
    setSelectedId(id)
    return id
  }, [])

  const updateAnnotation = useCallback(
    (id: string, updates: Partial<Annotation>) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      )
    },
    []
  )

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const resetCanvas = useCallback(() => {
    if (!image || !imageInfo) return
    setCanvasWidth(imageInfo.width)
    setCanvasHeight(imageInfo.height)
    setCrop(null)
    setAnnotations([])
    setSelectedId(null)
    setFilters(DEFAULT_FILTERS)
    setBackground(DEFAULT_BACKGROUND)
  }, [image, imageInfo])

  const selectedAnnotation = annotations.find((a) => a.id === selectedId) ?? null

  return {
    image,
    imageInfo,
    activeTool,
    setActiveTool,
    annotations,
    setAnnotations,
    selectedId,
    setSelectedId,
    filters,
    setFilters,
    canvasWidth,
    canvasHeight,
    crop,
    setCrop,
    background,
    setBackground,
    exportSettings,
    setExportSettings,
    loadImage,
    clearImage,
    setCanvasDimensions,
    addAnnotation,
    updateAnnotation,
    deleteSelected,
    resetCanvas,
    selectedAnnotation,
  }
}
