import { parseISODate, daysUntil as daysUntilDate, isThisWeek as dateIsThisWeek } from './dates'

export function phaseName(project, phaseId) {
  if (!phaseId) return null
  return project.phases?.find((p) => p.id === phaseId)?.name ?? null
}

export function currentPhase(project) {
  if (!project?.phases?.length) return null
  const byId = project.currentPhaseId
    ? project.phases.find((p) => p.id === project.currentPhaseId)
    : null
  if (byId) return byId
  return project.phases.find((p) => p.status === 'In Progress') || project.phases[0]
}

export function currentPhaseName(project) {
  return currentPhase(project)?.name ?? '—'
}

export function tasksForGoal(project, goalId) {
  return (project.tasks || []).filter((t) => t.goalId === goalId)
}

export function milestonesForGoal(project, goalId) {
  return (project.milestones || []).filter((m) => m.goalId === goalId)
}

export function brainstormForGoal(project, goalId) {
  return (project.brainstorm || []).filter((n) => n.goalId === goalId)
}

export function openBlockers(project) {
  return (project.blockers || []).filter((b) => b.status !== 'Resolved')
}

export function blockerCount(project) {
  return openBlockers(project).length
}

/** Task-based fraction + light milestone weight (max +15 points blended). */
export function projectProgressPercent(project) {
  const tasks = project.tasks || []
  const totalT = tasks.length
  const doneT = tasks.filter((t) => t.completed).length
  let taskPart = totalT ? (doneT / totalT) * 85 : 0

  const ms = project.milestones || []
  const totalM = ms.length
  const doneM = ms.filter((m) => m.status === 'Complete').length
  const milePart = totalM ? (doneM / totalM) * 15 : 0

  if (!totalT && !totalM) return project.progressPercent || 0

  if (!totalT && totalM) return Math.round((doneM / totalM) * 100)

  return Math.min(100, Math.round(taskPart + milePart))
}

export function goalProgressPercent(project, goalId) {
  const tasks = tasksForGoal(project, goalId)
  const totalT = tasks.length
  const doneT = tasks.filter((t) => t.completed).length
  let base = totalT ? (doneT / totalT) * 90 : 0

  const ms = milestonesForGoal(project, goalId)
  const totalM = ms.length
  const doneM = ms.filter((m) => m.status === 'Complete').length
  const milePart = totalM ? (doneM / totalM) * 10 : 0

  if (!totalT && !totalM) {
    const g = (project.goals || []).find((x) => x.id === goalId)
    if (g?.status === 'Complete') return 100
    return 0
  }
  if (!totalT && totalM) return Math.round((doneM / totalM) * 100)

  return Math.min(100, Math.round(base + milePart))
}

export function goalById(project, goalId) {
  return (project.goals || []).find((g) => g.id === goalId) || null
}

export function nextTaskForGoal(project, goalId) {
  const tasks = tasksForGoal(project, goalId).filter((t) => !t.completed)
  const next = tasks.filter((t) => t.isNextAction)
  const pool = next.length ? next : tasks
  return pool.sort((a, b) => {
    const da = parseISODate(a.dueDate)?.getTime() ?? 9e15
    const db = parseISODate(b.dueDate)?.getTime() ?? 9e15
    return da - db
  })[0] || null
}

export function projectExecutionStats(project) {
  const goals = project.goals || []
  const tasks = project.tasks || []
  const completedGoals = goals.filter((g) => g.status === 'Complete').length
  const activeGoals = goals.filter((g) => g.status !== 'Complete').length
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const overdueTasks = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false
    const d = parseISODate(t.dueDate)
    return d && d < now
  })

  const nextActionCount = tasks.filter((t) => !t.completed && t.isNextAction).length

  const ms = project.milestones || []
  const in7 = ms.filter((m) => {
    if (m.status === 'Complete' || !m.dueDate) return false
    const d = daysUntilDate(m.dueDate)
    return d !== null && d >= 0 && d <= 7
  })

  const targetDays = project.targetDate ? daysUntilDate(project.targetDate) : null

  return {
    totalGoals: goals.length,
    activeGoals,
    completedGoals,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.completed).length,
    overdueCount: overdueTasks.length,
    nextActionCount,
    openBlockers: blockerCount(project),
    milestonesNext7: in7.length,
    daysUntilTarget: targetDays,
  }
}

export function isTaskOverdue(task) {
  if (task.completed || !task.dueDate) return false
  const d = parseISODate(task.dueDate)
  if (!d) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d < now
}

export function isDueToday(isoDate) {
  if (!isoDate) return false
  const d = parseISODate(isoDate)
  if (!d) return false
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function isThisWeekDate(isoDate) {
  return dateIsThisWeek(isoDate)
}

/**
 * Build prioritized "do next" queue: overdue, today, next-flagged, week, then by priority.
 */
export function doNextQueue(project, limit = 40) {
  const tasks = (project.tasks || []).filter((t) => !t.completed)
  const score = (t) => {
    let s = 0
    if (isTaskOverdue(t)) s += 1000
    else if (isDueToday(t.dueDate)) s += 800
    else if (dateIsThisWeek(t.dueDate)) s += 500
    if (t.isNextAction) s += 300
    const pr = { Critical: 40, High: 30, Medium: 20, Low: 10 }
    s += pr[t.priority] || 15
    const d = parseISODate(t.dueDate)?.getTime() ?? 9e15
    return { t, s, d }
  }
  return tasks
    .map(score)
    .sort((a, b) => b.s - a.s || a.d - b.d)
    .slice(0, limit)
    .map((x) => x.t)
}

export function urgencyBucket(isoDate) {
  if (!isoDate) return 'later'
  if (isTaskOverdue({ dueDate: isoDate, completed: false })) return 'overdue'
  if (isDueToday(isoDate)) return 'today'
  if (dateIsThisWeek(isoDate)) return 'week'
  return 'later'
}

/**
 * Timeline items: tasks (with due) + milestones + goal targets.
 */
export function timelineItems(project) {
  const items = []
  const gmap = Object.fromEntries((project.goals || []).map((g) => [g.id, g]))

  for (const m of project.milestones || []) {
    if (!m.dueDate) continue
    items.push({
      kind: 'milestone',
      id: m.id,
      title: m.title,
      date: m.dueDate,
      status: m.status,
      goalId: m.goalId,
      goalTitle: m.goalId ? gmap[m.goalId]?.title : null,
      phaseId: m.phaseId,
    })
  }
  for (const t of project.tasks || []) {
    if (!t.dueDate || t.completed) continue
    items.push({
      kind: 'task',
      id: t.id,
      title: t.title,
      date: t.dueDate,
      status: t.status,
      priority: t.priority,
      goalId: t.goalId,
      goalTitle: t.goalId ? gmap[t.goalId]?.title : null,
      phaseId: t.phaseId,
    })
  }
  for (const g of project.goals || []) {
    if (!g.targetDate) continue
    items.push({
      kind: 'goal',
      id: g.id,
      title: g.title,
      date: g.targetDate,
      status: g.status,
      goalId: g.id,
      goalTitle: g.title,
      phaseId: g.phaseId,
    })
  }
  if (project.targetDate) {
    items.push({
      kind: 'target',
      id: 'target',
      title: 'Project target',
      date: project.targetDate,
      status: project.status,
      goalId: null,
      goalTitle: null,
      phaseId: null,
    })
  }
  items.sort((a, b) => {
    const da = parseISODate(a.date)?.getTime() ?? 0
    const db = parseISODate(b.date)?.getTime() ?? 0
    return da - db
  })
  return items
}

export function groupTimelineByUrgency(project) {
  const items = timelineItems(project)
  const groups = { overdue: [], today: [], week: [], later: [] }
  for (const it of items) {
    if (it.status === 'Complete' && it.kind === 'milestone') continue
    if (it.kind === 'goal' && it.status === 'Complete') continue
    const b = urgencyBucket(it.date)
    groups[b].push(it)
  }
  return groups
}

export function upcomingMilestones(project, limit = 8) {
  const ms = [...(project.milestones || [])]
  return ms
    .filter((m) => m.status !== 'Complete')
    .sort((a, b) => {
      const da = parseISODate(a.dueDate)?.getTime() ?? 9e15
      const db = parseISODate(b.dueDate)?.getTime() ?? 9e15
      return da - db
    })
    .slice(0, limit)
}
