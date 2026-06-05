import { Shield, Upload } from 'lucide-react'

type HeaderProps = {
  hasImage: boolean
  onUploadClick: () => void
}

export function Header({ hasImage, onUploadClick }: HeaderProps) {
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
        <div className="privacy-badge">
          <Shield />
          <span>100% local · No uploads</span>
        </div>
        {hasImage && (
          <button className="secondary-btn" onClick={onUploadClick} aria-label="Upload new image">
            <Upload size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            New Image
          </button>
        )}
      </div>
    </header>
  )
}
