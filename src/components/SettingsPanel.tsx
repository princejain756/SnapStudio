import type { Annotation, BackgroundState, BackgroundType, FilterState } from '../types'
import { CANVAS_PRESETS, getPresetDimensions } from '../utils/presets'

type SettingsPanelProps = {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: number) => void
  onFilterCommit: () => void
  canvasWidth: number
  canvasHeight: number
  onDimensionsChange: (width: number, height: number) => void
  imageWidth: number
  imageHeight: number
  background: BackgroundState
  onBackgroundChange: (updates: Partial<BackgroundState>) => void
  selectedAnnotation: Annotation | null
  onAnnotationChange: (id: string, updates: Partial<Annotation>) => void
  toolColor: string
  onToolColorChange: (color: string) => void
  strokeWidth: number
  onStrokeWidthChange: (width: number) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  filled: boolean
  onFilledChange: (filled: boolean) => void
  activePreset: string
  onPresetChange: (label: string) => void
}

export function SettingsPanel({
  filters,
  onFilterChange,
  onFilterCommit,
  canvasWidth,
  canvasHeight,
  onDimensionsChange,
  imageWidth,
  imageHeight,
  background,
  onBackgroundChange,
  selectedAnnotation,
  onAnnotationChange,
  toolColor,
  onToolColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fontSize,
  onFontSizeChange,
  filled,
  onFilledChange,
  activePreset,
  onPresetChange,
}: SettingsPanelProps) {
  const handlePreset = (label: string) => {
    onPresetChange(label)
    const preset = CANVAS_PRESETS.find((p) => p.label === label)!
    const dims = getPresetDimensions(preset, imageWidth, imageHeight)
    onDimensionsChange(dims.width, dims.height)
  }

  return (
    <aside className="settings-panel" aria-label="Editor settings">
      <section className="settings-section">
        <h3 className="settings-section__title">Dimensions</h3>
        <div className="preset-grid">
          {CANVAS_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`preset-btn ${activePreset === preset.label ? 'preset-btn--active' : ''}`}
              onClick={() => handlePreset(preset.label)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="dimension-inputs">
          <div className="input-group">
            <label htmlFor="width-input">Width</label>
            <input
              id="width-input"
              type="number"
              min={1}
              max={8192}
              value={canvasWidth}
              onChange={(e) =>
                onDimensionsChange(Number(e.target.value), canvasHeight)
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="height-input">Height</label>
            <input
              id="height-input"
              type="number"
              min={1}
              max={8192}
              value={canvasHeight}
              onChange={(e) =>
                onDimensionsChange(canvasWidth, Number(e.target.value))
              }
            />
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Filters</h3>
        {(
          [
            ['brightness', 'Brightness', 0, 200, 100],
            ['contrast', 'Contrast', 0, 200, 100],
            ['saturation', 'Saturation', 0, 200, 100],
            ['grayscale', 'Grayscale', 0, 100, 0],
            ['blur', 'Blur', 0, 20, 0],
            ['sepia', 'Sepia', 0, 100, 0],
          ] as const
        ).map(([key, label, min, max, def]) => (
          <div className="slider-group" key={key}>
            <div className="slider-group__header">
              <span className="slider-group__label">{label}</span>
              <span className="slider-group__value">{filters[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={filters[key]}
              onChange={(e) => onFilterChange(key, Number(e.target.value))}
              onMouseUp={onFilterCommit}
              onTouchEnd={onFilterCommit}
              aria-label={label}
            />
            {filters[key] !== def && (
              <button
                className="secondary-btn"
                style={{ marginTop: 4, fontSize: '0.65rem', padding: '2px 8px' }}
                onClick={() => onFilterChange(key, def)}
              >
                Reset
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Background</h3>
        <div className="bg-type-btns">
          {(['transparent', 'solid', 'gradient'] as BackgroundType[]).map((type) => (
            <button
              key={type}
              className={`bg-type-btn ${background.type === type ? 'bg-type-btn--active' : ''}`}
              onClick={() => onBackgroundChange({ type })}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {background.type === 'solid' && (
          <div className="color-row">
            <label>Color</label>
            <input
              type="color"
              value={background.color}
              onChange={(e) => onBackgroundChange({ color: e.target.value })}
            />
          </div>
        )}

        {background.type === 'gradient' && (
          <>
            <div className="color-row">
              <label>Start</label>
              <input
                type="color"
                value={background.gradientStart}
                onChange={(e) => onBackgroundChange({ gradientStart: e.target.value })}
              />
            </div>
            <div className="color-row">
              <label>End</label>
              <input
                type="color"
                value={background.gradientEnd}
                onChange={(e) => onBackgroundChange({ gradientEnd: e.target.value })}
              />
            </div>
            <div className="slider-group">
              <div className="slider-group__header">
                <span className="slider-group__label">Angle</span>
                <span className="slider-group__value">{background.gradientAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={background.gradientAngle}
                onChange={(e) =>
                  onBackgroundChange({ gradientAngle: Number(e.target.value) })
                }
              />
            </div>
          </>
        )}

        <div className="slider-group">
          <div className="slider-group__header">
            <span className="slider-group__label">Padding</span>
            <span className="slider-group__value">{background.padding}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={background.padding}
            onChange={(e) => onBackgroundChange({ padding: Number(e.target.value) })}
          />
        </div>

        <div className="slider-group">
          <div className="slider-group__header">
            <span className="slider-group__label">Corner Radius</span>
            <span className="slider-group__value">{background.borderRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            value={background.borderRadius}
            onChange={(e) => onBackgroundChange({ borderRadius: Number(e.target.value) })}
          />
        </div>

        <div className="toggle-row">
          <label>Drop Shadow</label>
          <button
            className={`toggle ${background.shadow ? 'toggle--on' : ''}`}
            onClick={() => onBackgroundChange({ shadow: !background.shadow })}
            aria-pressed={background.shadow}
            aria-label="Toggle drop shadow"
          />
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Tool Settings</h3>
        <div className="color-row">
          <label>Color</label>
          <input type="color" value={toolColor} onChange={(e) => onToolColorChange(e.target.value)} />
        </div>
        <div className="slider-group">
          <div className="slider-group__header">
            <span className="slider-group__label">Stroke Width</span>
            <span className="slider-group__value">{strokeWidth}px</span>
          </div>
          <input type="range" min={1} max={20} value={strokeWidth} onChange={(e) => onStrokeWidthChange(Number(e.target.value))} />
        </div>
        <div className="slider-group">
          <div className="slider-group__header">
            <span className="slider-group__label">Font Size</span>
            <span className="slider-group__value">{fontSize}px</span>
          </div>
          <input type="range" min={12} max={120} value={fontSize} onChange={(e) => onFontSizeChange(Number(e.target.value))} />
        </div>
        <div className="toggle-row">
          <label>Fill Shape</label>
          <button className={`toggle ${filled ? 'toggle--on' : ''}`} onClick={() => onFilledChange(!filled)} aria-pressed={filled} aria-label="Toggle shape fill" />
        </div>
      </section>

      {selectedAnnotation && (
        <section className="settings-section">
          <h3 className="settings-section__title">Selected Object</h3>
          <div className="color-row">
            <label>Color</label>
            <input type="color" value={selectedAnnotation.color} onChange={(e) => onAnnotationChange(selectedAnnotation.id, { color: e.target.value })} />
          </div>
          {selectedAnnotation.type === 'text' && (
            <div className="input-group">
              <label>Text</label>
              <input type="text" value={selectedAnnotation.text ?? ''} onChange={(e) => onAnnotationChange(selectedAnnotation.id, { text: e.target.value })} />
            </div>
          )}
          {selectedAnnotation.type === 'blur' && (
            <div className="slider-group">
              <div className="slider-group__header">
                <span className="slider-group__label">Blur Strength</span>
                <span className="slider-group__value">{selectedAnnotation.blurRadius ?? 24}px</span>
              </div>
              <input type="range" min={8} max={48} value={selectedAnnotation.blurRadius ?? 24} onChange={(e) => onAnnotationChange(selectedAnnotation.id, { blurRadius: Number(e.target.value) })} />
            </div>
          )}
        </section>
      )}
    </aside>
  )
}
