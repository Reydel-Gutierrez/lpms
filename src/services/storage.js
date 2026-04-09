import { STORAGE_KEY, STORAGE_KEY_V1 } from '../data/constants'
import { getSeedProjects } from '../data/seedDemo'
import { recomputeProjectProgress } from '../data/model'
import { migrateStoredState } from '../data/migration'

function loadRaw(key) {
  try {
    const raw = localStorage.getItem(key)
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

function normalizeLoadedState(raw) {
  const migrated = migrateStoredState(raw)
  if (!migrated?.projects?.length) return null
  return {
    projects: migrated.projects.map((p) => recomputeProjectProgress(p)),
    activeProjectId: migrated.activeProjectId || migrated.projects[0].id,
    presentationMode: !!migrated.presentationMode,
  }
}

export function loadState() {
  const v2 = loadRaw(STORAGE_KEY)
  if (v2?.projects?.length) {
    const n = normalizeLoadedState(v2)
    if (n) return n
  }

  const v1 = loadRaw(STORAGE_KEY_V1)
  if (v1?.projects?.length) {
    const n = normalizeLoadedState(v1)
    if (n) {
      saveRaw({
        projects: n.projects.map((p) => recomputeProjectProgress(p)),
        activeProjectId: n.activeProjectId,
        presentationMode: n.presentationMode,
      })
      return n
    }
  }

  const projects = getSeedProjects().map((p) => recomputeProjectProgress(p))
  const state = {
    projects,
    activeProjectId: projects[0]?.id || null,
    presentationMode: false,
  }
  saveRaw({
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    presentationMode: state.presentationMode,
  })
  return state
}

export function persistState(state) {
  saveRaw(state)
}
