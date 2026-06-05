import {
  MousePointer2,
  Type,
  ArrowUpRight,
  Minus,
  Square,
  Circle,
  Highlighter,
  EyeOff,
  Trash2,
} from 'lucide-react'
import type { Tool } from '../types'

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer2 />, label: 'Select' },
  { id: 'text', icon: <Type />, label: 'Text' },
  { id: 'arrow', icon: <ArrowUpRight />, label: 'Arrow' },
  { id: 'line', icon: <Minus />, label: 'Line' },
  { id: 'rectangle', icon: <Square />, label: 'Rectangle' },
  { id: 'circle', icon: <Circle />, label: 'Circle' },
  { id: 'highlight', icon: <Highlighter />, label: 'Highlight' },
  { id: 'blur', icon: <EyeOff />, label: 'Blur / Redact' },
]

type ToolbarProps = {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  onDelete: () => void
  hasSelection: boolean
}

export function Toolbar({ activeTool, onToolChange, onDelete, hasSelection }: ToolbarProps) {
  return (
    <aside className="toolbar" aria-label="Drawing tools">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          className={`tool-btn ${activeTool === tool.id ? 'tool-btn--active' : ''}`}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          aria-label={tool.label}
          aria-pressed={activeTool === tool.id}
        >
          {tool.icon}
        </button>
      ))}

      <div className="toolbar__divider" />

      <button
        className="tool-btn"
        onClick={onDelete}
        disabled={!hasSelection}
        title="Delete selected"
        aria-label="Delete selected annotation"
        style={{ opacity: hasSelection ? 1 : 0.35 }}
      >
        <Trash2 />
      </button>
    </aside>
  )
}
