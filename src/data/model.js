/** @typedef {import('./modelTypes').Project} Project */

import { SCHEMA_VERSION } from './constants'
import { goalProgressPercent, projectProgressPercent } from '../utils/deriveStats'

export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function emptyProject(overrides = {}) {
  const id = createId('proj')
  return {
    id,
    schemaVersion: SCHEMA_VERSION,
    name: 'New project',
    type: 'General',
    owner: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: null,
    progressPercent: 0,
    accentColor: '#5eead4',
    archived: false,
    phases: [],
    goals: [],
    tasks: [],
    milestones: [],
    brainstorm: [],
    blockers: [],
    ...overrides,
  }
}

/**
 * Recomputes cached project.progressPercent from tasks + milestones.
 */
export function recomputeProjectProgress(project) {
  const pct = projectProgressPercent(project)
  return { ...project, progressPercent: pct }
}

/**
 * Returns goals with optional derived progress attached (does not mutate project).
 */
export function goalsWithDerivedProgress(project) {
  const goals = project.goals || []
  return goals.map((g) => ({
    ...g,
    _derivedProgress: goalProgressPercent(project, g.id),
  }))
}
