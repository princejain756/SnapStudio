import { useCallback, useRef, useState } from 'react'
import { ImagePlus, ShieldCheck, WifiOff, UserX } from 'lucide-react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

type UploadPanelProps = {
  onFileSelect: (file: File) => void
}

export function UploadPanel({ onFileSelect }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragging(false), [])

  return (
    <div className="upload-panel">
      <div
        className={`upload-dropzone ${isDragging ? 'upload-dropzone--dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload image by clicking or dragging"
      >
        <div className="upload-dropzone__icon">
          <ImagePlus />
        </div>
        <h2>Drop your image here</h2>
        <p>or click to browse · paste with Ctrl+V</p>
        <div className="upload-formats">
          <span className="format-tag">PNG</span>
          <span className="format-tag">JPEG</span>
          <span className="format-tag">WebP</span>
        </div>
      </div>

      <div className="upload-privacy">
        <div className="upload-privacy__item">
          <ShieldCheck />
          <span>All editing happens locally in your browser</span>
        </div>
        <div className="upload-privacy__item">
          <WifiOff />
          <span>Your images never leave your device</span>
        </div>
        <div className="upload-privacy__item">
          <UserX />
          <span>No account required</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
