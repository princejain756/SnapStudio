type ShortcutsModalProps = {
  open: boolean
  onClose: () => void
}

const SHORTCUTS = [
  ['V', 'Select tool'],
  ['C', 'Crop tool'],
  ['T', 'Text tool'],
  ['A', 'Arrow'],
  ['R', 'Rectangle'],
  ['B', 'Blur / Redact'],
  ['Del', 'Delete selected'],
  ['Ctrl+Z', 'Undo'],
  ['Ctrl+Y', 'Redo'],
  ['Ctrl+S', 'Export'],
  ['Ctrl+V', 'Paste image from clipboard'],
  ['\\', 'Toggle before/after compare'],
]

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Shortcuts</h2>
        <ul className="shortcuts-list">
          {SHORTCUTS.map(([key, desc]) => (
            <li key={key}>
              <kbd>{key}</kbd>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
        <button className="secondary-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
