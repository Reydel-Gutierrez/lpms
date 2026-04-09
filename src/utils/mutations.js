import { createId } from '../data/model'

export function addGoal(project, goal) {
  const g = {
    id: createId('g'),
    title: goal.title || 'Untitled goal',
    description: goal.description ?? '',
    status: goal.status || 'Not Started',
    priority: goal.priority || 'Medium',
    phaseId: goal.phaseId || null,
    startDate: goal.startDate ?? '',
    targetDate: goal.targetDate ?? '',
    tags: Array.isArray(goal.tags) ? goal.tags : [],
  }
  return { ...project, goals: [...(project.goals || []), g] }
}

export function updateGoal(project, goalId, patch) {
  return {
    ...project,
    goals: (project.goals || []).map((g) => (g.id === goalId ? { ...g, ...patch } : g)),
  }
}

export function deleteGoal(project, goalId) {
  return {
    ...project,
    goals: (project.goals || []).filter((g) => g.id !== goalId),
    tasks: (project.tasks || []).filter((t) => t.goalId !== goalId),
    milestones: (project.milestones || []).filter((m) => m.goalId !== goalId),
    brainstorm: (project.brainstorm || []).filter((n) => n.goalId !== goalId),
    blockers: (project.blockers || []).map((b) =>
      b.goalId === goalId ? { ...b, goalId: null } : b
    ),
  }
}

export function addPhase(project, name, description = '') {
  const orders = (project.phases || []).map((p) => p.order)
  const order = (orders.length ? Math.max(...orders) : -1) + 1
  const ph = {
    id: createId('ph'),
    name: name || 'Phase',
    description: description || '',
    order,
    status: 'Not Started',
  }
  return { ...project, phases: [...(project.phases || []), ph] }
}

export function updatePhase(project, phaseId, patch) {
  return {
    ...project,
    phases: (project.phases || []).map((p) => (p.id === phaseId ? { ...p, ...patch } : p)),
  }
}

export function deletePhase(project, phaseId) {
  return {
    ...project,
    phases: (project.phases || []).filter((p) => p.id !== phaseId),
    goals: (project.goals || []).map((g) => (g.phaseId === phaseId ? { ...g, phaseId: null } : g)),
    tasks: (project.tasks || []).map((t) => (t.phaseId === phaseId ? { ...t, phaseId: null } : t)),
    milestones: (project.milestones || []).map((m) =>
      m.phaseId === phaseId ? { ...m, phaseId: null } : m
    ),
    currentPhaseId: project.currentPhaseId === phaseId ? null : project.currentPhaseId,
  }
}

export function setCurrentPhase(project, phaseId) {
  return {
    ...project,
    currentPhaseId: phaseId,
    phases: (project.phases || []).map((p) => ({
      ...p,
      status:
        p.id === phaseId
          ? 'In Progress'
          : p.status === 'Complete'
            ? 'Complete'
            : 'Not Started',
    })),
  }
}

export function reorderPhases(project, orderedIds) {
  const map = new Map((project.phases || []).map((p) => [p.id, p]))
  const next = orderedIds
    .map((id, i) => {
      const p = map.get(id)
      return p ? { ...p, order: i } : null
    })
    .filter(Boolean)
  return { ...project, phases: next }
}

function withTaskCompletion(patch, previous) {
  const next = { ...patch }
  if (next.completed === true && !previous.completed) {
    next.completedAt = new Date().toISOString()
  }
  if (next.completed === false) {
    next.completedAt = ''
  }
  return next
}

export function addTask(project, task) {
  const orders = (project.tasks || []).filter((t) => t.goalId === task.goalId).map((t) => t.order)
  const order = (orders.length ? Math.max(...orders) : -1) + 1
  const t = {
    id: createId('t'),
    goalId: task.goalId || (project.goals || [])[0]?.id || null,
    phaseId: task.phaseId ?? null,
    title: task.title || 'Task',
    description: task.description ?? '',
    status: task.status || 'In Progress',
    priority: task.priority || 'Medium',
    dueDate: task.dueDate ?? '',
    completed: !!task.completed,
    completedAt: task.completed ? new Date().toISOString() : '',
    isNextAction: !!task.isNextAction,
    order,
  }
  return { ...project, tasks: [...(project.tasks || []), t] }
}

export function updateTask(project, taskId, patch) {
  return {
    ...project,
    tasks: (project.tasks || []).map((t) => {
      if (t.id !== taskId) return t
      return { ...t, ...withTaskCompletion(patch, t) }
    }),
  }
}

export function deleteTask(project, taskId) {
  return { ...project, tasks: (project.tasks || []).filter((t) => t.id !== taskId) }
}

export function addMilestone(project, m) {
  const row = {
    id: createId('m'),
    goalId: m.goalId || (project.goals || [])[0]?.id || null,
    phaseId: m.phaseId ?? null,
    title: m.title || 'Milestone',
    description: m.description ?? '',
    status: m.status || 'Not Started',
    dueDate: m.dueDate ?? '',
  }
  return { ...project, milestones: [...(project.milestones || []), row] }
}

export function updateMilestone(project, id, patch) {
  return {
    ...project,
    milestones: (project.milestones || []).map((x) => (x.id === id ? { ...x, ...patch } : x)),
  }
}

export function deleteMilestone(project, id) {
  return { ...project, milestones: (project.milestones || []).filter((x) => x.id !== id) }
}

export function addBrainstorm(project, note) {
  const now = new Date().toISOString()
  const row = {
    id: createId('n'),
    goalId: note.goalId || (project.goals || [])[0]?.id || null,
    title: note.title || 'Note',
    body: note.body ?? '',
    createdAt: now,
    updatedAt: now,
  }
  return { ...project, brainstorm: [...(project.brainstorm || []), row] }
}

export function updateBrainstorm(project, id, patch) {
  const now = new Date().toISOString()
  return {
    ...project,
    brainstorm: (project.brainstorm || []).map((n) =>
      n.id === id ? { ...n, ...patch, updatedAt: now } : n
    ),
  }
}

export function deleteBrainstorm(project, id) {
  return { ...project, brainstorm: (project.brainstorm || []).filter((n) => n.id !== id) }
}

export function addBlocker(project, b) {
  const row = {
    id: createId('b'),
    title: b.title || 'Blocker',
    description: b.description ?? '',
    severity: b.severity || 'Medium',
    owner: b.owner ?? '',
    status: b.status === 'Resolved' ? 'Resolved' : 'Open',
    createdAt: b.createdAt || new Date().toISOString().slice(0, 10),
    resolvedAt: b.resolvedAt ?? '',
    goalId: b.goalId ?? null,
  }
  return { ...project, blockers: [...(project.blockers || []), row] }
}

export function updateBlocker(project, id, patch) {
  const extra = {}
  if (patch.status === 'Resolved' && !patch.resolvedAt) {
    extra.resolvedAt = new Date().toISOString().slice(0, 10)
  }
  if (patch.status === 'Open') {
    extra.resolvedAt = ''
  }
  return {
    ...project,
    blockers: (project.blockers || []).map((x) => (x.id === id ? { ...x, ...patch, ...extra } : x)),
  }
}

export function deleteBlocker(project, id) {
  return { ...project, blockers: (project.blockers || []).filter((x) => x.id !== id) }
}
