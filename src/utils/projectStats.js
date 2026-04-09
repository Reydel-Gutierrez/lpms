import { parseISODate } from './dates'

export function phaseName(project, phaseId) {
  if (!phaseId) return null
  return project.phases?.find((p) => p.id === phaseId)?.name || null
}

export function currentPhaseName(project) {
  const cur = project.phases?.find((p) => p.isCurrent)
  return cur?.name || '—'
}

export function taskStats(project) {
  const tasks = project.tasks || []
  const completed = tasks.filter((t) => t.completed).length
  return { total: tasks.length, completed }
}

export function blockerCount(project) {
  return (project.blockers || []).filter((b) => !b.resolved).length
}

export function upcomingMilestones(project, limit = 5) {
  const ms = [...(project.milestones || [])]
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return ms
    .filter((m) => m.status !== 'Complete')
    .sort((a, b) => {
      const da = parseISODate(a.dueDate)?.getTime() ?? 9e15
      const db = parseISODate(b.dueDate)?.getTime() ?? 9e15
      return da - db
    })
    .slice(0, limit)
}

export function nextActions(project, limit = 8) {
  const tasks = project.tasks || []
  const flagged = tasks.filter((t) => !t.completed && t.isNextAction)
  const rest = tasks.filter((t) => !t.completed && !t.isNextAction)
  const merged = [...flagged, ...rest]
  return merged.slice(0, limit)
}

export function timelineEvents(project) {
  const events = []
  for (const m of project.milestones || []) {
    if (m.dueDate) {
      events.push({
        kind: 'milestone',
        id: m.id,
        title: m.title,
        date: m.dueDate,
        status: m.status,
      })
    }
  }
  for (const t of project.tasks || []) {
    if (t.dueDate && !t.completed) {
      events.push({
        kind: 'task',
        id: t.id,
        title: t.title,
        date: t.dueDate,
        status: t.status,
        priority: t.priority,
      })
    }
  }
  for (const g of project.goals || []) {
    if (g.targetDate) {
      events.push({
        kind: 'goal',
        id: g.id,
        title: g.title,
        date: g.targetDate,
        status: g.status,
      })
    }
  }
  if (project.targetDate) {
    events.push({
      kind: 'target',
      id: 'target',
      title: 'Project target',
      date: project.targetDate,
      status: project.status,
    })
  }
  events.sort((a, b) => {
    const da = parseISODate(a.date)?.getTime() ?? 0
    const db = parseISODate(b.date)?.getTime() ?? 0
    return da - db
  })
  return events
}
