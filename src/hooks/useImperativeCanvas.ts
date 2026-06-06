import { useCallback, useEffect, useRef } from 'react'
import type {
  Annotation,
  BackgroundState,
  CropState,
  FilterState,
} from '../types'
import { renderCanvas } from '../utils/canvas'

export type CanvasRenderState = {
  image: HTMLImageElement
  canvasWidth: number
  canvasHeight: number
  filters: FilterState
  background: BackgroundState
  annotations: Annotation[]
  crop: CropState | null
  selectedId: string | null
}

export function useImperativeCanvas(state: CanvasRenderState | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draftAnnotationRef = useRef<Annotation | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const renderNow = useCallback(() => {
    const canvas = canvasRef.current
    const current = stateRef.current
    if (!canvas || !current?.image?.complete) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = current.canvasWidth
    canvas.height = current.canvasHeight

    const draft = draftAnnotationRef.current
    let annotations = current.annotations
    if (draft) {
      const without = annotations.filter((a) => a.id !== draft.id)
      annotations = [...without, draft]
    }

    renderCanvas(
      ctx,
      canvas,
      current.image,
      current.canvasWidth,
      current.canvasHeight,
      current.filters,
      current.background,
      annotations,
      current.crop,
      current.selectedId
    )
  }, [])

  const setDraftAnnotation = useCallback(
    (annotation: Annotation | null) => {
      draftAnnotationRef.current = annotation
      renderNow()
    },
    [renderNow]
  )

  useEffect(() => {
    renderNow()
  }, [state, renderNow])

  return { canvasRef, renderNow, setDraftAnnotation }
}
