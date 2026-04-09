import { STORAGE_KEY } from '../data/constants'
import { getSeedProjects } from '../data/seedDemo'
import { recomputeProjectProgress } from '../data/model'

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveRaw(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('LPMS save failed', e)
  }
}

export function loadState() {
  const raw = loadRaw()
  if (raw && Array.isArray(raw.projects) && raw.projects.length) {
    return {
      projects: raw.projects.map((p) => recomputeProjectProgress(p)),
      activeProjectId: raw.activeProjectId || raw.projects[0].id,
      presentationMode: !!raw.presentationMode,
    }
  }
  const projects = getSeedProjects().map(recomputeProjectProgress)
  const state = {
    projects,
    activeProjectId: projects[0]?.id || null,
    presentationMode: false,
  }
  saveRaw(state)
  return state
}

export function persistState(state) {
  saveRaw(state)
}
