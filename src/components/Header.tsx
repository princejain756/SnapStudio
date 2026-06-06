import {
  Shield, Upload, Undo2, Redo2, Columns2, Save, FolderOpen, Keyboard,
} from 'lucide-react'

type HeaderProps = {
  hasImage: boolean
  canUndo: boolean
  canRedo: boolean
  compareMode: boolean
  onUploadClick: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleCompare: () => void
  onSaveProject: () => void
  onLoadProject: () => void
  onShowShortcuts: () => void
}

export function Header({
  hasImage, canUndo, canRedo, compareMode,
  onUploadClick, onUndo, onRedo, onToggleCompare,
  onSaveProject, onLoadProject, onShowShortcuts,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div>
          <span className="header__title">SnapStudio</span>
          <span className="header__tagline"> — Fast image editing, right in your browser</span>
        </div>
      </div>

      <div className="header__actions">
        {hasImage && (
          <div className="header__tool-group">
            <button className="icon-btn" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" aria-label="Undo">
              <Undo2 size={16} />
            </button>
            <button className="icon-btn" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" aria-label="Redo">
              <Redo2 size={16} />
            </button>
            <button
              className={`icon-btn ${compareMode ? 'icon-btn--active' : ''}`}
              onClick={onToggleCompare}
              title="Compare before/after (\)"
              aria-label="Toggle compare"
              aria-pressed={compareMode}
            >
              <Columns2 size={16} />
            </button>
            <button className="icon-btn" onClick={onSaveProject} title="Save project" aria-label="Save project">
              <Save size={16} />
            </button>
            <button className="icon-btn" onClick={onLoadProject} title="Load project" aria-label="Load project">
              <FolderOpen size={16} />
            </button>
          </div>
        )}
        <button className="icon-btn" onClick={onShowShortcuts} title="Keyboard shortcuts" aria-label="Shortcuts">
          <Keyboard size={16} />
        </button>
        <div className="privacy-badge">
          <Shield />
          <span>100% local · No uploads</span>
        </div>
        {hasImage && (
          <button className="secondary-btn" onClick={onUploadClick} aria-label="Upload new image">
            <Upload size={14} />
            New Image
          </button>
        )}
      </div>
    </header>
  )
}
