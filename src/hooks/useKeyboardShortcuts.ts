import { useEffect } from 'react'
import type { Tool } from '../types'

const TOOL_KEYS: Record<string, Tool> = {
  v: 'select',
  c: 'crop',
  t: 'text',
  a: 'arrow',
  l: 'line',
  r: 'rectangle',
  o: 'circle',
  h: 'highlight',
  b: 'blur',
}

type ShortcutHandlers = {
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onToolChange: (tool: Tool) => void
  onExport: () => void
  onToggleCompare: () => void
  enabled: boolean
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    if (!handlers.enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handlers.onUndo()
        return
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handlers.onRedo()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        e.preventDefault()
        handlers.onDelete()
        return
      }
      if (mod && e.key === 's') {
        e.preventDefault()
        handlers.onExport()
        return
      }
      if (e.key === '\\' && !mod) {
        e.preventDefault()
        handlers.onToggleCompare()
        return
      }

      const tool = TOOL_KEYS[e.key.toLowerCase()]
      if (tool && !mod && !e.altKey) {
        e.preventDefault()
        handlers.onToolChange(tool)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}
