/**
 * Backwards-compatible facade; prefer `deriveStats.js` for new code.
 */
import { doNextQueue } from './deriveStats'

export {
  phaseName,
  currentPhaseName,
  blockerCount,
  upcomingMilestones,
  timelineItems as timelineEvents,
  doNextQueue,
  groupTimelineByUrgency,
  projectExecutionStats,
  goalProgressPercent,
  nextTaskForGoal,
  tasksForGoal,
  milestonesForGoal,
  brainstormForGoal,
} from './deriveStats'

export function taskStats(project) {
  const tasks = project.tasks || []
  const completed = tasks.filter((t) => t.completed).length
  return { total: tasks.length, completed }
}

export function nextActions(project, limit = 8) {
  return doNextQueue(project, limit)
}
