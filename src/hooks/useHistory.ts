import { useCallback, useRef, useState } from 'react'
import type { EditorSnapshot } from '../types'

const MAX_HISTORY = 50

export function useHistory(getSnapshot: () => EditorSnapshot) {
  const pastRef = useRef<EditorSnapshot[]>([])
  const [future, setFuture] = useState<EditorSnapshot[]>([])
  const [revision, setRevision] = useState(0)

  const pushHistory = useCallback(() => {
    const snap = getSnapshot()
    const serialized = JSON.stringify(snap)
    const last = pastRef.current[pastRef.current.length - 1]
    if (last && JSON.stringify(last) === serialized) return
    pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), snap]
    setFuture([])
    setRevision((r) => r + 1)
  }, [getSnapshot])

  const undo = useCallback((): EditorSnapshot | null => {
    if (pastRef.current.length === 0) return null
    const current = getSnapshot()
    const previous = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    setFuture((f) => [current, ...f])
    setRevision((r) => r + 1)
    return previous
  }, [getSnapshot])

  const redo = useCallback((): EditorSnapshot | null => {
    if (future.length === 0) return null
    const current = getSnapshot()
    const next = future[0]
    pastRef.current = [...pastRef.current, current]
    setFuture((f) => f.slice(1))
    setRevision((r) => r + 1)
    return next
  }, [future, getSnapshot])

  const clearHistory = useCallback(() => {
    pastRef.current = []
    setFuture([])
    setRevision((r) => r + 1)
  }, [])

  const canUndo = pastRef.current.length > 0
  const canRedo = future.length > 0

  return {
    pushHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    revision,
  }
}
