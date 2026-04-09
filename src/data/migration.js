import { createId } from './model'
import { SCHEMA_VERSION } from './constants'

/**
 * Migrates a project from v1 (flat goals/tasks) to v2 (goal-linked tasks, milestones, brainstorm).
 */
export function migrateProjectToV2(raw) {
  if (raw.schemaVersion === SCHEMA_VERSION) {
    return normalizeProjectV2(raw)
  }

  const phases = (raw.phases || []).map((ph, idx) => migratePhase(ph, idx, raw.currentPhaseId))
  const goals = (raw.goals || []).map((g) => migrateGoal(g))
  const defaultGoalId = goals[0]?.id || null

  let tasks = (raw.tasks || []).map((t) => migrateTask(t, goals, defaultGoalId))
  let milestones = (raw.milestones || []).map((m) => migrateMilestone(m, goals, defaultGoalId))
  const blockers = (raw.blockers || []).map((b) => migrateBlocker(b))
  const brainstorm = raw.brainstorm || []

  if (!defaultGoalId && (tasks.length > 0 || milestones.length > 0)) {
    const g = {
      id: createId('g'),
      title: 'Execution',
      description: 'Migrated catch-all goal for tasks without a previous parent.',
      status: 'In Progress',
      priority: 'Medium',
      phaseId: null,
      startDate: '',
      targetDate: '',
      tags: [],
    }
    goals.push(g)
    tasks = tasks.map((t) => ({ ...t, goalId: t.goalId || g.id }))
    milestones = milestones.map((m) => ({ ...m, goalId: m.goalId || g.id }))
  }

  return normalizeProjectV2({
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    phases,
    goals,
    tasks,
    milestones,
    blockers,
    brainstorm,
  })
}

function migratePhase(ph, idx, currentPhaseId) {
  const order = ph.order ?? idx
  let status = ph.status
  if (!status) {
    if (ph.completed) status = 'Complete'
    else if (ph.isCurrent || ph.id === currentPhaseId) status = 'In Progress'
    else status = 'Not Started'
  }
  return {
    id: ph.id,
    name: ph.name || 'Phase',
    description: ph.description ?? '',
    order,
    status,
  }
}

function migrateGoal(g) {
  return {
    id: g.id,
    title: g.title || 'Goal',
    description: g.description ?? '',
    status: g.status || 'Not Started',
    priority: g.priority || 'Medium',
    phaseId: g.phaseId ?? null,
    startDate: g.startDate ?? '',
    targetDate: g.targetDate ?? '',
    tags: Array.isArray(g.tags) ? g.tags : [],
  }
}

function pickGoalIdForPhase(phaseId, goals, fallbackId) {
  if (!phaseId) return fallbackId
  const match = goals.filter((g) => g.phaseId === phaseId)
  if (match.length === 1) return match[0].id
  if (match.length > 1) return match[0].id
  return fallbackId
}

function migrateTask(t, goals, defaultGoalId) {
  const gid = t.goalId || pickGoalIdForPhase(t.phaseId, goals, defaultGoalId)
  return {
    id: t.id,
    goalId: gid,
    phaseId: t.phaseId ?? null,
    title: t.title || 'Task',
    description: t.description ?? '',
    status: t.status || 'In Progress',
    priority: t.priority || 'Medium',
    dueDate: t.dueDate ?? '',
    completed: !!t.completed,
    completedAt: t.completedAt ?? (t.completed ? new Date().toISOString() : ''),
    isNextAction: !!t.isNextAction,
    order: typeof t.order === 'number' ? t.order : 0,
  }
}

function migrateMilestone(m, goals, defaultGoalId) {
  const gid = m.goalId || pickGoalIdForPhase(m.phaseId, goals, defaultGoalId)
  return {
    id: m.id,
    goalId: gid,
    phaseId: m.phaseId ?? null,
    title: m.title || 'Milestone',
    description: m.description ?? (m.notes ?? ''),
    status: m.status || 'Not Started',
    dueDate: m.dueDate ?? '',
  }
}

function migrateBlocker(b) {
  const resolved = b.resolved === true || b.status === 'Resolved'
  return {
    id: b.id,
    title: b.title || 'Blocker',
    description: b.description ?? '',
    severity: b.severity || 'Medium',
    owner: b.owner ?? '',
    status: resolved ? 'Resolved' : 'Open',
    createdAt: b.createdAt || new Date().toISOString().slice(0, 10),
    resolvedAt: b.resolvedAt ?? (resolved ? new Date().toISOString().slice(0, 10) : ''),
    goalId: b.goalId ?? null,
  }
}

/**
 * Ensures all v2 fields exist and arrays are safe.
 */
export function normalizeProjectV2(p) {
  const goals = (p.goals || []).map((g) => ({
    id: g.id,
    title: g.title || 'Goal',
    description: g.description ?? '',
    status: g.status || 'Not Started',
    priority: g.priority || 'Medium',
    phaseId: g.phaseId ?? null,
    startDate: g.startDate ?? '',
    targetDate: g.targetDate ?? '',
    tags: Array.isArray(g.tags) ? g.tags : [],
  }))
  const fallbackGoalId = goals[0]?.id ?? null

  return {
    ...p,
    schemaVersion: SCHEMA_VERSION,
    accentColor: p.accentColor ?? p.accent ?? '#5eead4',
    phases: (p.phases || []).map((ph, idx) => ({
      id: ph.id,
      name: ph.name || 'Phase',
      description: ph.description ?? '',
      order: typeof ph.order === 'number' ? ph.order : idx,
      status: ph.status || 'Not Started',
    })),
    goals,
    tasks: (p.tasks || []).map((t, i) => ({
      id: t.id,
      goalId: t.goalId || fallbackGoalId,
      phaseId: t.phaseId ?? null,
      title: t.title || 'Task',
      description: t.description ?? '',
      status: t.status || 'In Progress',
      priority: t.priority || 'Medium',
      dueDate: t.dueDate ?? '',
      completed: !!t.completed,
      completedAt: t.completedAt ?? '',
      isNextAction: !!t.isNextAction,
      order: typeof t.order === 'number' ? t.order : i,
    })),
    milestones: (p.milestones || []).map((m) => ({
      id: m.id,
      goalId: m.goalId || fallbackGoalId,
      phaseId: m.phaseId ?? null,
      title: m.title || 'Milestone',
      description: m.description ?? '',
      status: m.status || 'Not Started',
      dueDate: m.dueDate ?? '',
    })),
    brainstorm: (p.brainstorm || []).map((n) => ({
      id: n.id,
      goalId: n.goalId,
      title: n.title || 'Note',
      body: n.body ?? '',
      createdAt: n.createdAt || new Date().toISOString(),
      updatedAt: n.updatedAt || n.createdAt || new Date().toISOString(),
    })),
    blockers: (p.blockers || []).map((b) => ({
      id: b.id,
      title: b.title || 'Blocker',
      description: b.description ?? '',
      severity: b.severity || 'Medium',
      owner: b.owner ?? '',
      status: b.status === 'Resolved' ? 'Resolved' : 'Open',
      createdAt: b.createdAt || new Date().toISOString().slice(0, 10),
      resolvedAt: b.resolvedAt ?? '',
      goalId: b.goalId ?? null,
    })),
  }
}

export function migrateStoredState(raw) {
  if (!raw || !Array.isArray(raw.projects)) return null
  return {
    ...raw,
    projects: raw.projects.map((p) => migrateProjectToV2(p)),
  }
}
