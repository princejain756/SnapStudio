import { useCallback, useEffect, useRef, useState } from 'react'
import { TOOL_DEFAULT_COLORS } from './utils/annotations'
import type { Tool } from './types'
import { Header } from './components/Header'
import { UploadPanel } from './components/UploadPanel'
import { Toolbar } from './components/Toolbar'
import { EditorCanvas } from './components/EditorCanvas'
import { SettingsPanel } from './components/SettingsPanel'
import { ExportBar } from './components/ExportBar'
import { ShortcutsModal } from './components/ShortcutsModal'
import { ToastProvider, useToast } from './components/Toast'
import { useEditorState } from './hooks/useEditorState'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { renderCanvas } from './utils/canvas'
import { downloadCanvas, generateExportFilename } from './utils/export'
import { downloadProject, parseProjectFile } from './utils/project'
import './styles/global.css'

function AppInner() {
  const editor = useEditorState()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const projectInputRef = useRef<HTMLInputElement>(null)
  const [activePreset, setActivePreset] = useState('Original')
  const [toolColor, setToolColor] = useState('#ef4444')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [fontSize, setFontSize] = useState(32)
  const [filled, setFilled] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    const color = TOOL_DEFAULT_COLORS[editor.activeTool as Tool]
    if (color) setToolColor(color)
  }, [editor.activeTool])

  const handleExport = useCallback(() => {
    if (!editor.image || !editor.imageInfo) return
    const { scale, format, quality } = editor.exportSettings
    const w = Math.round(editor.canvasWidth * scale)
    const h = Math.round(editor.canvasHeight * scale)
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = w
    exportCanvas.height = h
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    const renderFull = (target: CanvasRenderingContext2D, c: HTMLCanvasElement) => {
      renderCanvas(target, c, editor.image!, editor.canvasWidth, editor.canvasHeight,
        editor.filters, editor.background, editor.annotations, editor.crop, null)
    }

    if (scale !== 1) {
      const temp = document.createElement('canvas')
      temp.width = editor.canvasWidth
      temp.height = editor.canvasHeight
      const tctx = temp.getContext('2d')
      if (!tctx) return
      renderFull(tctx, temp)
      ctx.drawImage(temp, 0, 0, w, h)
    } else {
      renderFull(ctx, exportCanvas)
    }

    downloadCanvas(exportCanvas, generateExportFilename(editor.imageInfo.fileName, format), format, quality)
    toast('Image exported successfully', 'success')
  }, [editor, toast])

  useKeyboardShortcuts({
    enabled: !!editor.image,
    onUndo: () => { editor.undo(); toast('Undone', 'info') },
    onRedo: () => { editor.redo(); toast('Redone', 'info') },
    onDelete: editor.deleteSelected,
    onToolChange: editor.setActiveTool,
    onExport: handleExport,
    onToggleCompare: () => editor.setCompareMode((v) => !v),
  })

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (blob) {
            editor.loadImageFromBlob(blob)
            toast('Image pasted from clipboard', 'success')
          }
          break
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [editor, toast])

  const handleSaveProject = useCallback(() => {
    const project = editor.getProject()
    if (!project) return
    downloadProject(project)
    toast('Project saved — re-upload same image to restore edits', 'success')
  }, [editor, toast])

  const handleLoadProject = useCallback(() => {
    projectInputRef.current?.click()
  }, [])

  const hasImage = !!editor.image

  return (
    <div className="app">
      <Header
        hasImage={hasImage}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        compareMode={editor.compareMode}
        onUploadClick={() => fileInputRef.current?.click()}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onToggleCompare={() => editor.setCompareMode((v) => !v)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />

      <div className={`editor-layout${hasImage ? '' : ' editor-layout--upload'}`}>
        {hasImage && (
          <Toolbar
            activeTool={editor.activeTool}
            onToolChange={editor.setActiveTool}
            onDelete={editor.deleteSelected}
            hasSelection={!!editor.selectedId}
          />
        )}

        {hasImage && editor.image && editor.imageInfo ? (
          <EditorCanvas
            image={editor.image}
            imageInfo={editor.imageInfo}
            canvasWidth={editor.canvasWidth}
            canvasHeight={editor.canvasHeight}
            filters={editor.filters}
            background={editor.background}
            annotations={editor.annotations}
            crop={editor.crop}
            activeTool={editor.activeTool}
            selectedId={editor.selectedId}
            toolColor={toolColor}
            strokeWidth={strokeWidth}
            fontSize={fontSize}
            filled={filled}
            compareMode={editor.compareMode}
            comparePos={editor.comparePos}
            onComparePosChange={editor.setComparePos}
            onSelect={editor.setSelectedId}
            onCommitAnnotation={editor.commitAnnotation}
            onUpdateAnnotation={editor.updateAnnotation}
            onFinalizeAnnotation={editor.finalizeAnnotation}
            onManualCrop={editor.setManualCrop}
            onReset={editor.resetCanvas}
          />
        ) : (
          <div className="canvas-area">
            <UploadPanel onFileSelect={editor.loadImage} />
          </div>
        )}

        {hasImage && (
          <SettingsPanel
            filters={editor.filters}
            onFilterChange={editor.updateFilter}
            onFilterCommit={editor.commitFilters}
            canvasWidth={editor.canvasWidth}
            canvasHeight={editor.canvasHeight}
            onDimensionsChange={editor.setCanvasDimensions}
            imageWidth={editor.imageInfo?.width ?? 1080}
            imageHeight={editor.imageInfo?.height ?? 1080}
            background={editor.background}
            onBackgroundChange={editor.updateBackground}
            selectedAnnotation={editor.selectedAnnotation}
            onAnnotationChange={(id, u) => { editor.updateAnnotation(id, u); editor.pushHistory() }}
            toolColor={toolColor}
            onToolColorChange={setToolColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            filled={filled}
            onFilledChange={setFilled}
            activePreset={activePreset}
            onPresetChange={setActivePreset}
          />
        )}

        <ExportBar
          exportSettings={editor.exportSettings}
          onExportSettingsChange={editor.setExportSettings}
          onExport={handleExport}
          hasImage={hasImage}
          canvasWidth={editor.canvasWidth}
          canvasHeight={editor.canvasHeight}
        />
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) editor.loadImage(f); e.target.value = '' }} />

      <input ref={projectInputRef} type="file" accept=".json,.snapstudio.json" hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          const text = await file.text()
          const project = parseProjectFile(text)
          if (!project) { toast('Invalid project file', 'error'); return }
          toast('Upload the original image to restore this project', 'info')
          const imgFile = await new Promise<File | null>((resolve) => {
            const inp = document.createElement('input')
            inp.type = 'file'
            inp.accept = 'image/*'
            inp.onchange = () => resolve(inp.files?.[0] ?? null)
            inp.click()
          })
          if (!imgFile) return
          const url = URL.createObjectURL(imgFile)
          const img = new Image()
          img.onload = () => {
            editor.loadProject(project, img)
            toast('Project loaded', 'success')
          }
          img.src = url
        }} />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
