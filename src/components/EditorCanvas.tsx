import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, RotateCcw } from 'lucide-react'
import type {
  Annotation,
  BackgroundState,
  CropState,
  FilterState,
  ImageInfo,
  Tool,
} from '../types'
import { renderCanvas } from '../utils/canvas'
import { isPointInAnnotation } from '../utils/annotations'

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
  onSelect: (id: string | null) => void
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => string
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void
  onReset: () => void
}

type DrawState = {
  isDrawing: boolean
  startX: number
  startY: number
  currentId: string | null
}

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
  onSelect,
  onAddAnnotation,
  onUpdateAnnotation,
  onReset,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [displayScale, setDisplayScale] = useState(1)
  const [textInput, setTextInput] = useState<{
    x: number
    y: number
    canvasX: number
    canvasY: number
  } | null>(null)
  const drawState = useRef<DrawState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentId: null,
  })

  const computeScale = useCallback(() => {
    if (!containerRef.current) return 1
    const rect = containerRef.current.getBoundingClientRect()
    const padding = 40
    const maxW = rect.width - padding
    const maxH = rect.height - padding
    return Math.min(maxW / canvasWidth, maxH / canvasHeight, 1)
  }, [canvasWidth, canvasHeight])

  useEffect(() => {
    const update = () => setDisplayScale(computeScale())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [computeScale])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    renderCanvas(
      ctx,
      canvas,
      image,
      canvasWidth,
      canvasHeight,
      filters,
      background,
      annotations,
      crop,
      selectedId
    )
  }, [
    image,
    canvasWidth,
    canvasHeight,
    filters,
    background,
    annotations,
    crop,
    selectedId,
  ])

  useEffect(() => {
    paint()
  }, [paint])

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvasWidth
      const y = ((e.clientY - rect.top) / rect.height) * canvasHeight
      return { x, y }
    },
    [canvasWidth, canvasHeight]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e)

      if (activeTool === 'select') {
        const hit = [...annotations].reverse().find((a) => isPointInAnnotation(a, x, y))
        onSelect(hit?.id ?? null)
        return
      }

      if (activeTool === 'text') {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        setTextInput({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          canvasX: x,
          canvasY: y,
        })
        return
      }

      drawState.current = {
        isDrawing: true,
        startX: x,
        startY: y,
        currentId: null,
      }

      const id = onAddAnnotation({
        type: activeTool,
        x,
        y,
        x2: x,
        y2: y,
        width: 0,
        height: 0,
        color: toolColor,
        strokeWidth,
        fontSize,
        filled: activeTool === 'rectangle' || activeTool === 'circle' ? filled : undefined,
        blurRadius: activeTool === 'blur' ? 16 : undefined,
      })

      drawState.current.currentId = id
    },
    [
      activeTool,
      annotations,
      filled,
      fontSize,
      getCanvasCoords,
      onAddAnnotation,
      onSelect,
      strokeWidth,
      toolColor,
    ]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawState.current.isDrawing || !drawState.current.currentId) return
      const { x, y } = getCanvasCoords(e)
      const { startX, startY, currentId } = drawState.current

      if (activeTool === 'arrow' || activeTool === 'line') {
        onUpdateAnnotation(currentId, { x2: x, y2: y })
      } else {
        onUpdateAnnotation(currentId, {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: x - startX,
          height: y - startY,
        })
      }
    },
    [activeTool, getCanvasCoords, onUpdateAnnotation]
  )

  const handleMouseUp = useCallback(() => {
    drawState.current.isDrawing = false
    drawState.current.currentId = null
  }, [])

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!textInput || !text.trim()) {
        setTextInput(null)
        return
      }
      onAddAnnotation({
        type: 'text',
        x: textInput.canvasX,
        y: textInput.canvasY,
        text: text.trim(),
        color: toolColor,
        strokeWidth: 1,
        fontSize,
      })
      setTextInput(null)
    },
    [fontSize, onAddAnnotation, textInput, toolColor]
  )

  const zoomToFit = useCallback(() => {
    setDisplayScale(computeScale())
  }, [computeScale])

  return (
    <div className="canvas-area">
      <div className="canvas-stage" ref={containerRef}>
        <div className="canvas-stage__checker" />
        <div className="canvas-controls">
          <button className="icon-btn" onClick={zoomToFit} title="Zoom to fit" aria-label="Zoom to fit">
            <Maximize2 />
          </button>
          <button className="icon-btn" onClick={onReset} title="Reset canvas" aria-label="Reset canvas">
            <RotateCcw />
          </button>
        </div>

        <div
          className="canvas-wrapper"
          style={{
            transform: `scale(${displayScale})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            className={activeTool === 'select' ? 'tool-select' : ''}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            aria-label="Image editor canvas"
          />
          {textInput && (
            <input
              className="text-input-overlay"
              style={{
                left: textInput.x,
                top: textInput.y,
                fontSize,
                color: toolColor,
              }}
              autoFocus
              placeholder="Type text..."
              onBlur={(e) => handleTextSubmit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit(e.currentTarget.value)
                if (e.key === 'Escape') setTextInput(null)
              }}
            />
          )}
        </div>

        <div className="canvas-info">
          <span className="info-chip">{imageInfo.fileName}</span>
          <span className="info-chip">
            {canvasWidth} × {canvasHeight}
          </span>
          <span className="info-chip">{Math.round(displayScale * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
