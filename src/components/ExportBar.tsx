import { Download } from 'lucide-react'
import type { ExportFormat, ExportSettings } from '../types'

type ExportBarProps = {
  exportSettings: ExportSettings
  onExportSettingsChange: (settings: ExportSettings) => void
  onExport: () => void
  hasImage: boolean
  canvasWidth: number
  canvasHeight: number
}

export function ExportBar({
  exportSettings,
  onExportSettingsChange,
  onExport,
  hasImage,
  canvasWidth,
  canvasHeight,
}: ExportBarProps) {
  const outputW = Math.round(canvasWidth * exportSettings.scale)
  const outputH = Math.round(canvasHeight * exportSettings.scale)

  return (
    <footer className="export-bar">
      <div className="export-bar__controls">
        <div className="export-bar__group">
          <label htmlFor="format-select">Format</label>
          <select
            id="format-select"
            value={exportSettings.format}
            onChange={(e) =>
              onExportSettingsChange({
                ...exportSettings,
                format: e.target.value as ExportFormat,
              })
            }
            disabled={!hasImage}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        {exportSettings.format !== 'png' && (
          <div className="export-bar__group">
            <label htmlFor="quality-range">Quality</label>
            <input
              id="quality-range"
              type="range"
              min={10}
              max={100}
              value={Math.round(exportSettings.quality * 100)}
              onChange={(e) =>
                onExportSettingsChange({
                  ...exportSettings,
                  quality: Number(e.target.value) / 100,
                })
              }
              disabled={!hasImage}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {Math.round(exportSettings.quality * 100)}%
            </span>
          </div>
        )}

        <div className="export-bar__group">
          <label htmlFor="scale-select">Scale</label>
          <select
            id="scale-select"
            value={exportSettings.scale}
            onChange={(e) =>
              onExportSettingsChange({
                ...exportSettings,
                scale: Number(e.target.value),
              })
            }
            disabled={!hasImage}
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
            <option value={3}>3×</option>
          </select>
        </div>

        {hasImage && (
          <span className="info-chip" style={{ marginLeft: 8 }}>
            Output: {outputW} × {outputH}
          </span>
        )}
      </div>

      <button
        className="export-btn"
        onClick={onExport}
        disabled={!hasImage}
        aria-label={`Export as ${exportSettings.format.toUpperCase()}`}
      >
        <Download />
        Export {exportSettings.format.toUpperCase()}
      </button>
    </footer>
  )
}
