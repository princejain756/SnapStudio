import {
  MousePointer2, Crop, Type, ArrowUpRight, Minus, Square, Circle,
  Highlighter, EyeOff, Trash2,
} from 'lucide-react'
import type { Tool } from '../types'

const TOOLS: { id: Tool; icon: React.ReactNode; label: string; key: string }[] = [
  { id: 'select', icon: <MousePointer2 />, label: 'Select', key: 'V' },
  { id: 'crop', icon: <Crop />, label: 'Crop', key: 'C' },
  { id: 'text', icon: <Type />, label: 'Text', key: 'T' },
  { id: 'arrow', icon: <ArrowUpRight />, label: 'Arrow', key: 'A' },
  { id: 'line', icon: <Minus />, label: 'Line', key: 'L' },
  { id: 'rectangle', icon: <Square />, label: 'Rectangle', key: 'R' },
  { id: 'circle', icon: <Circle />, label: 'Circle', key: 'O' },
  { id: 'highlight', icon: <Highlighter />, label: 'Highlight', key: 'H' },
  { id: 'blur', icon: <EyeOff />, label: 'Blur / Redact', key: 'B' },
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
          title={`${tool.label} (${tool.key})`}
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
        title="Delete (Del)"
        aria-label="Delete selected"
        style={{ opacity: hasSelection ? 1 : 0.35 }}
      >
        <Trash2 />
      </button>
    </aside>
  )
}
