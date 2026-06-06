import { useCallback, useRef, useState } from 'react'
import type {
  Annotation,
  BackgroundState,
  CropState,
  EditorSnapshot,
  ExportSettings,
  FilterState,
  ImageInfo,
  ProjectFile,
  Tool,
} from '../types'
import {
  DEFAULT_BACKGROUND,
  DEFAULT_EXPORT,
  DEFAULT_FILTERS,
} from '../types'
import { calculateCropFit } from '../utils/presets'
import { applySnapshot, createProjectFile } from '../utils/project'
import { useHistory } from './useHistory'

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
  const [compareMode, setCompareMode] = useState(false)
  const [comparePos, setComparePos] = useState(50)

  const stateRef = useRef({
    filters,
    background,
    annotations,
    canvasWidth,
    canvasHeight,
    crop,
  })
  stateRef.current = { filters, background, annotations, canvasWidth, canvasHeight, crop }

  const getSnapshot = useCallback(
    (): EditorSnapshot => ({
      filters: { ...stateRef.current.filters },
      background: { ...stateRef.current.background },
      annotations: stateRef.current.annotations.map((a) => ({ ...a })),
      canvasWidth: stateRef.current.canvasWidth,
      canvasHeight: stateRef.current.canvasHeight,
      crop: stateRef.current.crop ? { ...stateRef.current.crop } : null,
    }),
    []
  )

  const history = useHistory(getSnapshot)

  const applySnapshotState = useCallback((snap: EditorSnapshot) => {
    const s = applySnapshot(snap)
    setFilters(s.filters)
    setBackground(s.background)
    setAnnotations(s.annotations)
    setCanvasWidth(s.canvasWidth)
    setCanvasHeight(s.canvasHeight)
    setCrop(s.crop)
    setSelectedId(null)
  }, [])

  const withHistory = useCallback(
    (fn: () => void) => {
      history.pushHistory()
      fn()
    },
    [history]
  )

  const loadImage = useCallback(
    (file: File) => {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        if (imageInfo?.objectUrl) URL.revokeObjectURL(imageInfo.objectUrl)
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
        setBackground(DEFAULT_BACKGROUND)
        setActiveTool('select')
        history.clearHistory()
      }
      img.src = objectUrl
    },
    [history, imageInfo]
  )

  const loadImageFromBlob = useCallback(
    (blob: Blob, name = 'pasted-image.png') => {
      const file = new File([blob], name, { type: blob.type || 'image/png' })
      loadImage(file)
    },
    [loadImage]
  )

  const setCanvasDimensions = useCallback(
    (width: number, height: number, recordHistory = true) => {
      if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return
      const apply = () => {
        setCanvasWidth(width)
        setCanvasHeight(height)
        if (image) {
          setCrop(calculateCropFit(image.naturalWidth, image.naturalHeight, width, height))
        }
      }
      if (recordHistory) withHistory(apply)
      else apply()
    },
    [image, withHistory]
  )

  const setManualCrop = useCallback(
    (newCrop: CropState | null) => {
      withHistory(() => setCrop(newCrop))
    },
    [withHistory]
  )

  const commitAnnotation = useCallback(
    (annotation: Annotation) => {
      withHistory(() => {
        setAnnotations((prev) => {
          const exists = prev.some((a) => a.id === annotation.id)
          if (exists) return prev.map((a) => (a.id === annotation.id ? annotation : a))
          return [...prev, annotation]
        })
        setSelectedId(annotation.id)
      })
    },
    [withHistory]
  )

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }, [])

  const finalizeAnnotation = useCallback(
    (id: string, updates: Partial<Annotation>) => {
      withHistory(() => {
        setAnnotations((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        )
      })
    },
    [withHistory]
  )

  const removeAnnotation = useCallback(
    (id: string) => {
      withHistory(() => {
        setAnnotations((prev) => prev.filter((a) => a.id !== id))
        setSelectedId((prev) => (prev === id ? null : prev))
      })
    },
    [withHistory]
  )

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    removeAnnotation(selectedId)
  }, [removeAnnotation, selectedId])

  const resetCanvas = useCallback(() => {
    if (!image || !imageInfo) return
    withHistory(() => {
      setCanvasWidth(imageInfo.width)
      setCanvasHeight(imageInfo.height)
      setCrop(null)
      setAnnotations([])
      setSelectedId(null)
      setFilters(DEFAULT_FILTERS)
      setBackground(DEFAULT_BACKGROUND)
    })
  }, [image, imageInfo, withHistory])

  const updateFilter = useCallback((key: keyof FilterState, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const commitFilters = useCallback(() => {
    history.pushHistory()
  }, [history])

  const updateBackground = useCallback((updates: Partial<BackgroundState>) => {
    withHistory(() => setBackground((prev) => ({ ...prev, ...updates })))
  }, [withHistory])

  const undo = useCallback(() => {
    const snap = history.undo()
    if (snap) applySnapshotState(snap)
  }, [applySnapshotState, history])

  const redo = useCallback(() => {
    const snap = history.redo()
    if (snap) applySnapshotState(snap)
  }, [applySnapshotState, history])

  const getProject = useCallback((): ProjectFile | null => {
    if (!imageInfo) return null
    return createProjectFile(
      imageInfo.fileName,
      imageInfo.width,
      imageInfo.height,
      getSnapshot(),
      exportSettings
    )
  }, [exportSettings, getSnapshot, imageInfo])

  const loadProject = useCallback(
    (project: ProjectFile, img: HTMLImageElement) => {
      setImage(img)
      setImageInfo({
        fileName: project.fileName,
        width: project.imageWidth,
        height: project.imageHeight,
        mimeType: 'image/png',
        objectUrl: img.src,
      })
      applySnapshotState(project.snapshot)
      setExportSettings(project.exportSettings)
      history.clearHistory()
    },
    [applySnapshotState, history]
  )

  const selectedAnnotation = annotations.find((a) => a.id === selectedId) ?? null

  return {
    image,
    imageInfo,
    activeTool,
    setActiveTool,
    annotations,
    selectedId,
    setSelectedId,
    filters,
    updateFilter,
    commitFilters,
    canvasWidth,
    canvasHeight,
    crop,
    setManualCrop,
    background,
    updateBackground,
    exportSettings,
    setExportSettings,
    compareMode,
    setCompareMode,
    comparePos,
    setComparePos,
    loadImage,
    loadImageFromBlob,
    setCanvasDimensions,
    commitAnnotation,
    updateAnnotation,
    finalizeAnnotation,
    removeAnnotation,
    deleteSelected,
    resetCanvas,
    selectedAnnotation,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    getProject,
    loadProject,
    pushHistory: history.pushHistory,
  }
}
