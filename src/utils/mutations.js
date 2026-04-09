import { createId } from '../data/model'

export function addGoal(project, goal) {
  const g = {
    id: createId('g'),
    title: goal.title || 'Untitled',
    targetDate: goal.targetDate || '',
    status: goal.status || 'Not Started',
    phaseId: goal.phaseId || null,
    progressPercent: Number(goal.progressPercent) || 0,
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
  return { ...project, goals: (project.goals || []).filter((g) => g.id !== goalId) }
}

export function addPhase(project, name) {
  const orders = (project.phases || []).map((p) => p.order)
  const order = (orders.length ? Math.max(...orders) : -1) + 1
  const ph = {
    id: createId('ph'),
    name: name || 'Phase',
    order,
    isCurrent: !(project.phases || []).length,
    completed: false,
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
    milestones: (project.milestones || []).map((m) => (m.phaseId === phaseId ? { ...m, phaseId: null } : m)),
    currentPhaseId: project.currentPhaseId === phaseId ? null : project.currentPhaseId,
  }
}

export function setCurrentPhase(project, phaseId) {
  return {
    ...project,
    phases: (project.phases || []).map((p) => ({
      ...p,
      isCurrent: p.id === phaseId,
    })),
    currentPhaseId: phaseId,
  }
}

export function reorderPhases(project, orderedIds) {
  const map = new Map((project.phases || []).map((p) => [p.id, p]))
  const next = orderedIds.map((id, i) => {
    const p = map.get(id)
    return p ? { ...p, order: i } : null
  }).filter(Boolean)
  return { ...project, phases: next }
}

export function addTask(project, task) {
  const t = {
    id: createId('t'),
    title: task.title || 'Untitled task',
    description: task.description || '',
    dueDate: task.dueDate || '',
    status: task.status || 'In Progress',
    priority: task.priority || 'Medium',
    isNextAction: !!task.isNextAction,
    phaseId: task.phaseId || null,
    completed: !!task.completed,
  }
  return { ...project, tasks: [...(project.tasks || []), t] }
}

export function updateTask(project, taskId, patch) {
  return {
    ...project,
    tasks: (project.tasks || []).map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
  }
}

export function deleteTask(project, taskId) {
  return { ...project, tasks: (project.tasks || []).filter((t) => t.id !== taskId) }
}

export function addMilestone(project, m) {
  const row = {
    id: createId('m'),
    title: m.title || 'Milestone',
    dueDate: m.dueDate || '',
    status: m.status || 'Not Started',
    phaseId: m.phaseId || null,
    notes: m.notes || '',
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

export function addBlocker(project, b) {
  const row = {
    id: createId('b'),
    title: b.title || 'Blocker',
    description: b.description || '',
    severity: b.severity || 'Medium',
    owner: b.owner || '',
    createdAt: b.createdAt || new Date().toISOString().slice(0, 10),
    resolved: !!b.resolved,
  }
  return { ...project, blockers: [...(project.blockers || []), row] }
}

export function updateBlocker(project, id, patch) {
  return {
    ...project,
    blockers: (project.blockers || []).map((x) => (x.id === id ? { ...x, ...patch } : x)),
  }
}

export function deleteBlocker(project, id) {
  return { ...project, blockers: (project.blockers || []).filter((x) => x.id !== id) }
}
