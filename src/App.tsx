import { useCallback, useRef, useState } from 'react'
import { Header } from './components/Header'
import { UploadPanel } from './components/UploadPanel'
import { Toolbar } from './components/Toolbar'
import { EditorCanvas } from './components/EditorCanvas'
import { SettingsPanel } from './components/SettingsPanel'
import { ExportBar } from './components/ExportBar'
import { useEditorState } from './hooks/useEditorState'
import { renderCanvas } from './utils/canvas'
import { downloadCanvas, generateExportFilename } from './utils/export'
import './styles/global.css'

function App() {
  const editor = useEditorState()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activePreset, setActivePreset] = useState('Original')
  const [toolColor, setToolColor] = useState('#ffffff')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [fontSize, setFontSize] = useState(32)
  const [filled, setFilled] = useState(false)

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

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

    if (scale !== 1) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = editor.canvasWidth
      tempCanvas.height = editor.canvasHeight
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      renderCanvas(
        tempCtx,
        tempCanvas,
        editor.image,
        editor.canvasWidth,
        editor.canvasHeight,
        editor.filters,
        editor.background,
        editor.annotations,
        editor.crop,
        null
      )

      ctx.drawImage(tempCanvas, 0, 0, w, h)
    } else {
      renderCanvas(
        ctx,
        exportCanvas,
        editor.image,
        editor.canvasWidth,
        editor.canvasHeight,
        editor.filters,
        editor.background,
        editor.annotations,
        editor.crop,
        null
      )
    }

    const filename = generateExportFilename(editor.imageInfo.fileName, format)
    downloadCanvas(exportCanvas, filename, format, quality)
  }, [editor])

  const hasImage = !!editor.image

  return (
    <div className="app">
      <Header hasImage={hasImage} onUploadClick={handleUploadClick} />

      <div className="editor-layout">
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
            onSelect={editor.setSelectedId}
            onAddAnnotation={editor.addAnnotation}
            onUpdateAnnotation={editor.updateAnnotation}
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
            onFiltersChange={editor.setFilters}
            canvasWidth={editor.canvasWidth}
            canvasHeight={editor.canvasHeight}
            onDimensionsChange={editor.setCanvasDimensions}
            imageWidth={editor.imageInfo?.width ?? 1080}
            imageHeight={editor.imageInfo?.height ?? 1080}
            background={editor.background}
            onBackgroundChange={editor.setBackground}
            selectedAnnotation={editor.selectedAnnotation}
            onAnnotationChange={editor.updateAnnotation}
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) editor.loadImage(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default App
