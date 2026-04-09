/** @typedef {import('./modelTypes').Project} Project */

export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function emptyProject(overrides = {}) {
  const id = createId('proj')
  return {
    id,
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
    goals: [],
    phases: [],
    tasks: [],
    milestones: [],
    blockers: [],
    ...overrides,
  }
}

export function recomputeProjectProgress(project) {
  const tasks = project.tasks || []
  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const pct = total ? Math.round((completed / total) * 100) : project.progressPercent || 0
  return { ...project, progressPercent: pct }
}
