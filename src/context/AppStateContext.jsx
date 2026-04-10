import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { createId, emptyProject, recomputeProjectProgress } from '../data/model'
import { migrateStoredState } from '../data/migration'
import { loadState, persistState } from '../services/storage'
import { getSeedProjects, DEFAULT_SEED_ACTIVE_PROJECT_ID } from '../data/seedDemo'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [presentationMode, setPresentationMode] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const s = loadState()
    setProjects(s.projects)
    setActiveProjectId(s.activeProjectId)
    setPresentationMode(s.presentationMode)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    persistState({ projects, activeProjectId, presentationMode })
  }, [projects, activeProjectId, presentationMode, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (activeProjectId && !projects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(projects[0]?.id ?? null)
    }
  }, [projects, activeProjectId, hydrated])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [projects, activeProjectId]
  )

  const updateProject = useCallback((projectId, updater) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const next = typeof updater === 'function' ? updater(p) : { ...p, ...updater }
        return recomputeProjectProgress(next)
      })
    )
  }, [])

  const addProject = useCallback((partial) => {
    const p = emptyProject(partial)
    setProjects((prev) => [...prev, recomputeProjectProgress(p)])
    setActiveProjectId(p.id)
    return p.id
  }, [])

  const removeProject = useCallback((projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }, [])

  const archiveProject = useCallback((projectId) => {
    updateProject(projectId, (p) => ({ ...p, archived: true }))
  }, [updateProject])

  const resetDemoData = useCallback(() => {
    const seeded = getSeedProjects().map(recomputeProjectProgress)
    setProjects(seeded)
    setActiveProjectId(
      seeded.find((p) => p.id === DEFAULT_SEED_ACTIVE_PROJECT_ID)?.id || seeded[0]?.id || null
    )
  }, [])

  const importState = useCallback((json) => {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    const migrated = migrateStoredState(data)
    if (!migrated?.projects || !Array.isArray(migrated.projects)) throw new Error('Invalid backup')
    const next = migrated.projects.map((p) => recomputeProjectProgress(p))
    setProjects(next)
    if (migrated.activeProjectId && next.some((p) => p.id === migrated.activeProjectId)) {
      setActiveProjectId(migrated.activeProjectId)
    } else {
      setActiveProjectId(next[0]?.id || null)
    }
  }, [])

  const exportState = useCallback(() => {
    return JSON.stringify(
      { projects, activeProjectId, presentationMode, exportedAt: new Date().toISOString() },
      null,
      2
    )
  }, [projects, activeProjectId, presentationMode])

  const value = useMemo(
    () => ({
      hydrated,
      projects,
      activeProjectId,
      setActiveProjectId,
      activeProject,
      presentationMode,
      setPresentationMode,
      updateProject,
      addProject,
      removeProject,
      archiveProject,
      resetDemoData,
      importState,
      exportState,
      createId,
    }),
    [
      hydrated,
      projects,
      activeProjectId,
      activeProject,
      presentationMode,
      updateProject,
      addProject,
      removeProject,
      archiveProject,
      resetDemoData,
      importState,
      exportState,
    ]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState outside provider')
  return ctx
}
