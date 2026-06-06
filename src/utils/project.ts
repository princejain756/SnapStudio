import type { EditorSnapshot, ExportSettings, ProjectFile } from '../types'

export function createProjectFile(
  fileName: string,
  imageWidth: number,
  imageHeight: number,
  snapshot: EditorSnapshot,
  exportSettings: ExportSettings
): ProjectFile {
  return {
    version: 1,
    fileName,
    imageWidth,
    imageHeight,
    snapshot,
    exportSettings,
  }
}

export function downloadProject(project: ProjectFile): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const base = project.fileName.replace(/\.[^.]+$/, '') || 'snapstudio-project'
  const link = document.createElement('a')
  link.href = url
  link.download = `${base}.snapstudio.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function parseProjectFile(text: string): ProjectFile | null {
  try {
    const data = JSON.parse(text) as ProjectFile
    if (data.version !== 1 || !data.snapshot) return null
    return data
  } catch {
    return null
  }
}

export function applySnapshot(snapshot: EditorSnapshot): EditorSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as EditorSnapshot
}
