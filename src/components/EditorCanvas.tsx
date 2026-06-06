import { useCallback, useEffect, useRef, useState } from 'react'
import { Columns2, Maximize2, RotateCcw } from 'lucide-react'
import type {
  Annotation,
  BackgroundState,
  CropState,
  FilterState,
  ImageInfo,
  Tool,
} from '../types'
import { generateAnnotationId, isPointInAnnotation } from '../utils/annotations'
import { canvasPointToImageCrop } from '../utils/coords'
import { useImperativeCanvas } from '../hooks/useImperativeCanvas'
import { renderCanvas } from '../utils/canvas'
import { DEFAULT_FILTERS, DEFAULT_BACKGROUND } from '../types'

type EditorCanvasProps = {
  image: HTMLImageElement
  imageInfo: ImageInfo
  canvasWidth: number
  canvasHeight: number
  filters: FilterState
  background: BackgroundState
  annotations: Annotation[]
  crop: CropState | null
  activeTool: Tool
  selectedId: string | null
  toolColor: string
  strokeWidth: number
  fontSize: number
  filled: boolean
  compareMode: boolean
  comparePos: number
  onComparePosChange: (pos: number) => void
  onSelect: (id: string | null) => void
  onCommitAnnotation: (annotation: Annotation) => void
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void
  onFinalizeAnnotation: (id: string, updates: Partial<Annotation>) => void
  onManualCrop: (crop: CropState | null) => void
  onReset: () => void
}

type Session =
  | { kind: 'draw'; startX: number; startY: number; annotation: Annotation }
  | { kind: 'move'; id: string; startX: number; startY: number; orig: Annotation }
  | { kind: 'crop'; startX: number; startY: number; startImg: { x: number; y: number } }

export function EditorCanvas({
  image,
  imageInfo,
  canvasWidth,
  canvasHeight,
  filters,
  background,
  annotations,
  crop,
  activeTool,
  selectedId,
  toolColor,
  strokeWidth,
  fontSize,
  filled,
  compareMode,
  comparePos,
  onComparePosChange,
  onSelect,
  onCommitAnnotation,
  onUpdateAnnotation,
  onFinalizeAnnotation,
  onManualCrop,
  onReset,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const compareRef = useRef<HTMLCanvasElement>(null)
  const [displayScale, setDisplayScale] = useState(1)
  const [textInput, setTextInput] = useState<{
    x: number; y: number; canvasX: number; canvasY: number
  } | null>(null)
  const [cropPreview, setCropPreview] = useState<CropState | null>(null)
  const session = useRef<Session | null>(null)
  const draggingCompare = useRef(false)

  const { canvasRef, renderNow, setDraftAnnotation } = useImperativeCanvas({
    image,
    canvasWidth,
    canvasHeight,
    filters,
    background,
    annotations,
    crop: cropPreview ?? crop,
    selectedId,
  })

  const computeScale = useCallback(() => {
    if (!containerRef.current) return 1
    const rect = containerRef.current.getBoundingClientRect()
    const padding = 40
    const maxW = Math.max(0, rect.width - padding)
    const maxH = Math.max(0, rect.height - padding)
    const scale = Math.min(maxW / canvasWidth, maxH / canvasHeight, 1)
    return Number.isFinite(scale) && scale > 0 ? scale : 1
  }, [canvasWidth, canvasHeight])

  const getCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((clientX - rect.left) / rect.width) * canvasWidth,
        y: ((clientY - rect.top) / rect.height) * canvasHeight,
      }
    },
    [canvasRef, canvasWidth, canvasHeight]
  )

  const toImagePoint = useCallback(
    (cx: number, cy: number) =>
      canvasPointToImageCrop(
        cx, cy,
        image.naturalWidth, image.naturalHeight,
        canvasWidth, canvasHeight,
        background.padding, crop
      ),
    [image, canvasWidth, canvasHeight, background.padding, crop]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setDisplayScale(computeScale())
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [computeScale])

  useEffect(() => {
    if (!compareMode || !compareRef.current || !image.complete) return
    const c = compareRef.current
    c.width = canvasWidth
    c.height = canvasHeight
    const ctx = c.getContext('2d')
    if (!ctx) return
    renderCanvas(ctx, c, image, canvasWidth, canvasHeight, DEFAULT_FILTERS, DEFAULT_BACKGROUND, [], crop, null)
  }, [compareMode, image, canvasWidth, canvasHeight, crop])

  const finishSession = useCallback(
    (clientX: number, clientY: number) => {
      const s = session.current
      if (!s) return
      const { x, y } = getCoords(clientX, clientY)

      if (s.kind === 'draw') {
        const { startX, startY, annotation } = s
        if (annotation.type === 'arrow' || annotation.type === 'line') {
          if (Math.hypot(x - startX, y - startY) >= 6) {
            onCommitAnnotation({ ...annotation, x2: x, y2: y })
          }
        } else {
          const nw = Math.abs(x - startX)
          const nh = Math.abs(y - startY)
          if (nw >= 4 && nh >= 4) {
            onCommitAnnotation({
              ...annotation,
              x: Math.min(startX, x),
              y: Math.min(startY, y),
              width: nw,
              height: nh,
            })
          }
        }
      } else if (s.kind === 'move') {
        onFinalizeAnnotation(s.id, {})
      } else if (s.kind === 'crop') {
        const end = toImagePoint(x, y)
        const ix = Math.min(s.startImg.x, end.x)
        const iy = Math.min(s.startImg.y, end.y)
        const iw = Math.abs(end.x - s.startImg.x)
        const ih = Math.abs(end.y - s.startImg.y)
        if (iw >= 4 && ih >= 4) {
          onManualCrop({
            x: Math.max(0, Math.min(ix, image.naturalWidth)),
            y: Math.max(0, Math.min(iy, image.naturalHeight)),
            width: Math.min(iw, image.naturalWidth),
            height: Math.min(ih, image.naturalHeight),
          })
        }
        setCropPreview(null)
      }

      session.current = null
      setDraftAnnotation(null)
    },
    [getCoords, image, onCommitAnnotation, onFinalizeAnnotation, onManualCrop, setDraftAnnotation, toImagePoint]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      const { x, y } = getCoords(e.clientX, e.clientY)

      if (activeTool === 'select') {
        const hit = [...annotations].reverse().find((a) => isPointInAnnotation(a, x, y))
        if (hit) {
          onSelect(hit.id)
          session.current = { kind: 'move', id: hit.id, startX: x, startY: y, orig: { ...hit } }
        } else {
          onSelect(null)
        }
        return
      }

      if (activeTool === 'crop') {
        const imgPt = toImagePoint(x, y)
        session.current = { kind: 'crop', startX: x, startY: y, startImg: imgPt }
        return
      }

      if (activeTool === 'text') {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        setTextInput({ x: e.clientX - rect.left, y: e.clientY - rect.top, canvasX: x, canvasY: y })
        return
      }

      const id = generateAnnotationId()
      const annotation: Annotation = {
        id,
        type: activeTool,
        x, y, x2: x, y2: y, width: 0, height: 0,
        color: toolColor,
        strokeWidth,
        fontSize,
        filled: activeTool === 'rectangle' || activeTool === 'circle' ? filled : undefined,
        blurRadius: activeTool === 'blur' ? 24 : undefined,
      }
      session.current = { kind: 'draw', startX: x, startY: y, annotation }
      setDraftAnnotation(annotation)
    },
    [activeTool, annotations, canvasRef, filled, fontSize, getCoords, onSelect, setDraftAnnotation, strokeWidth, toImagePoint, toolColor]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const s = session.current
      if (!s) return
      const { x, y } = getCoords(e.clientX, e.clientY)

      if (s.kind === 'move') {
        const dx = x - s.startX
        const dy = y - s.startY
        const o = s.orig
        if (o.type === 'arrow' || o.type === 'line') {
          onUpdateAnnotation(s.id, {
            x: o.x + dx, y: o.y + dy,
            x2: (o.x2 ?? o.x) + dx, y2: (o.y2 ?? o.y) + dy,
          })
        } else if (o.type === 'text') {
          onUpdateAnnotation(s.id, { x: o.x + dx, y: o.y + dy })
        } else {
          onUpdateAnnotation(s.id, { x: o.x + dx, y: o.y + dy })
        }
        renderNow()
      } else if (s.kind === 'draw') {
        const { startX, startY, annotation } = s
        let updated: Annotation
        if (annotation.type === 'arrow' || annotation.type === 'line') {
          updated = { ...annotation, x2: x, y2: y }
        } else {
          updated = {
            ...annotation,
            x: Math.min(startX, x), y: Math.min(startY, y),
            width: Math.abs(x - startX), height: Math.abs(y - startY),
          }
        }
        session.current = { ...s, annotation: updated }
        setDraftAnnotation(updated)
      } else if (s.kind === 'crop') {
        const end = toImagePoint(x, y)
        const ix = Math.min(s.startImg.x, end.x)
        const iy = Math.min(s.startImg.y, end.y)
        setCropPreview({
          x: ix, y: iy,
          width: Math.abs(end.x - s.startImg.x),
          height: Math.abs(end.y - s.startImg.y),
        })
        renderNow()
      }
    },
    [getCoords, onUpdateAnnotation, renderNow, setDraftAnnotation, toImagePoint]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId)
      finishSession(e.clientX, e.clientY)
    },
    [finishSession]
  )

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!textInput || !text.trim()) { setTextInput(null); return }
      onCommitAnnotation({
        id: generateAnnotationId(),
        type: 'text',
        x: textInput.canvasX, y: textInput.canvasY,
        text: text.trim(), color: toolColor, strokeWidth: 1, fontSize,
      })
      setTextInput(null)
    },
    [fontSize, onCommitAnnotation, textInput, toolColor]
  )

  const canvasStyle = {
    width: `${canvasWidth * displayScale}px`,
    height: `${canvasHeight * displayScale}px`,
  }

  return (
    <div className="canvas-area">
      <div className="canvas-stage" ref={containerRef}>
        <div className="canvas-stage__checker" aria-hidden="true" />
        <div className="canvas-controls">
          <button className="icon-btn" onClick={() => setDisplayScale(computeScale())} title="Zoom to fit" aria-label="Zoom to fit">
            <Maximize2 />
          </button>
          <button className="icon-btn" onClick={onReset} title="Reset (R)" aria-label="Reset canvas">
            <RotateCcw />
          </button>
        </div>

        <div className="canvas-wrapper" style={canvasStyle}>
          {compareMode && (
            <canvas
              ref={compareRef}
              className="compare-canvas"
              style={{ ...canvasStyle, clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
              aria-hidden="true"
            />
          )}
          <canvas
            ref={canvasRef}
            className={activeTool === 'select' ? 'tool-select' : ''}
            style={{
              ...canvasStyle,
              ...(compareMode ? { clipPath: `inset(0 0 0 ${comparePos}%)` } : {}),
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Image editor canvas"
          />
          {compareMode && (
            <div
              className="compare-divider"
              style={{ left: `${comparePos}%` }}
              onPointerDown={(e) => { draggingCompare.current = true; e.currentTarget.setPointerCapture(e.pointerId) }}
              onPointerMove={(e) => {
                if (!draggingCompare.current || !containerRef.current) return
                const wrap = e.currentTarget.parentElement!.getBoundingClientRect()
                const pct = ((e.clientX - wrap.left) / wrap.width) * 100
                onComparePosChange(Math.max(2, Math.min(98, pct)))
              }}
              onPointerUp={(e) => { draggingCompare.current = false; e.currentTarget.releasePointerCapture(e.pointerId) }}
            >
              <Columns2 size={14} />
            </div>
          )}
          {textInput && (
            <input
              className="text-input-overlay"
              style={{ left: textInput.x, top: textInput.y, fontSize: fontSize * displayScale, color: toolColor }}
              autoFocus
              placeholder="Type text..."
              onBlur={(ev) => handleTextSubmit(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') handleTextSubmit(ev.currentTarget.value)
                if (ev.key === 'Escape') setTextInput(null)
              }}
            />
          )}
        </div>

        <div className="canvas-info">
          <span className="info-chip">{imageInfo.fileName}</span>
          <span className="info-chip">{canvasWidth} × {canvasHeight}</span>
          <span className="info-chip">{Math.round(displayScale * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
