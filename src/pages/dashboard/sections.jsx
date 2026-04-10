import { StatusChip } from '../../components/ui/StatusChip'
import { PriorityChip } from '../../components/ui/PriorityChip'
import { STATUSES, PRIORITIES } from '../../data/constants'
import { formatShortDate, daysUntil } from '../../utils/dates'

function timelineKindLabel(kind) {
  switch (kind) {
    case 'task':
      return 'Task'
    case 'milestone':
      return 'Milestone'
    case 'goal':
      return 'Goal'
    case 'target':
      return 'Project target'
    default:
      return 'Item'
  }
}
import {
  currentPhaseName,
  phaseName,
  goalProgressPercent,
  tasksForGoal,
  milestonesForGoal,
  brainstormForGoal,
  nextTaskForGoal,
  isTaskOverdue,
  isDueToday,
  doNextQueue,
  groupTimelineByUrgency,
} from '../../utils/deriveStats'
import * as M from '../../utils/mutations'
import { taskStats } from '../../utils/projectStats'

export function MissionHero({ project, stats, presentation }) {
  const { total, completed } = taskStats(project)
  const daysLeft = project.targetDate ? daysUntil(project.targetDate) : null

  return (
    <section
      className={`mission-hero${presentation ? ' mission-hero--pres' : ''}`}
      style={{ ['--hero-accent']: project.accentColor || 'var(--accent)' }}
    >
      <div className="mission-hero-top">
        <div>
          <p className="mission-hero-eyebrow">Active mission</p>
          <h1 className="mission-hero-title">{project.name}</h1>
          <p className="mission-hero-desc">{project.description || 'No description yet.'}</p>
          <div className="mission-hero-chips">
            <StatusChip status={project.status} />
            <PriorityChip priority={project.priority} />
            <span className="chip chip-meta">{project.type}</span>
          </div>
        </div>
        <div className="mission-hero-ring">
          <div className="mission-hero-pct">
            <span className="mission-hero-pct-value">{project.progressPercent}</span>
            <span className="mission-hero-pct-label">%</span>
          </div>
          <span className="mission-hero-ring-caption">execution</span>
        </div>
      </div>

      <div className={`mission-stats${presentation ? ' mission-stats--pres' : ''}`}>
        <div className="mission-stat">
          <span className="mission-stat-label">Phase</span>
          <span className="mission-stat-value">{currentPhaseName(project)}</span>
        </div>
        <div className="mission-stat">
          <span className="mission-stat-label">Target</span>
          <span className="mission-stat-value">{formatShortDate(project.targetDate)}</span>
          {daysLeft !== null && (
            <span className="mission-stat-sub">{daysLeft < 0 ? `${Math.abs(daysLeft)}d over` : `${daysLeft}d left`}</span>
          )}
        </div>
        <div className="mission-stat">
          <span className="mission-stat-label">Goals</span>
          <span className="mission-stat-value">
            {stats.activeGoals}/{stats.totalGoals}
          </span>
          <span className="mission-stat-sub">active</span>
        </div>
        <div className="mission-stat">
          <span className="mission-stat-label">Tasks</span>
          <span className="mission-stat-value">
            {completed}/{total}
          </span>
          {stats.overdueCount > 0 && <span className="mission-stat-sub mission-stat-sub--risk">{stats.overdueCount} overdue</span>}
        </div>
        <div className="mission-stat">
          <span className="mission-stat-label">Next actions</span>
          <span className="mission-stat-value">{stats.nextActionCount}</span>
        </div>
        <div className="mission-stat">
          <span className="mission-stat-label">Blockers</span>
          <span className="mission-stat-value">{stats.openBlockers}</span>
        </div>
        <div className="mission-stat">
          <span className="mission-stat-label">Milestones (7d)</span>
          <span className="mission-stat-value">{stats.milestonesNext7}</span>
        </div>
      </div>

      <div className="mission-hero-bar">
        <div className="progress-bar progress-bar--hero">
          <span style={{ width: `${project.progressPercent}%` }} />
        </div>
      </div>
    </section>
  )
}

export function GoalsExecutionGrid({ project, onOpenGoal, onAddGoal, presentation, maxGoals }) {
  const goals = project.goals || []
  const shown = maxGoals ? goals.slice(0, maxGoals) : goals

  return (
    <section className={`dash-section${presentation ? ' dash-section--pres' : ''}`}>
      <div className="dash-section-head">
        <h2 className="dash-section-title">Goals</h2>
        {!presentation && (
          <button type="button" className="lpms-btn sm primary" onClick={onAddGoal}>
            + Goal
          </button>
        )}
      </div>
      <div className={`goals-grid${presentation ? ' goals-grid--pres' : ''}`}>
        {shown.length === 0 && (
          <div className="dash-empty goals-grid-empty">
            <p className="dash-empty-title">No goals defined</p>
            <p className="dash-empty-hint">Goals anchor tasks, milestones, and notes — add one to drive execution.</p>
          </div>
        )}
        {shown.map((g) => {
          const pct = goalProgressPercent(project, g.id)
          const tks = tasksForGoal(project, g.id)
          const done = tks.filter((t) => t.completed).length
          const ms = milestonesForGoal(project, g.id)
          const nb = brainstormForGoal(project, g.id)
          const next = nextTaskForGoal(project, g.id)
          return (
            <button
              key={g.id}
              type="button"
              className="goal-exec-card"
              onClick={() => onOpenGoal(g.id)}
            >
              <div className="goal-exec-card-top">
                <h3 className="goal-exec-card-title">{g.title}</h3>
                <div className="goal-exec-card-chips">
                  <StatusChip status={g.status} />
                </div>
              </div>
              {g.description && <p className="goal-exec-card-desc">{g.description}</p>}
              <div className="goal-exec-card-meta">
                <span>{phaseName(project, g.phaseId) || 'Any phase'}</span>
                <span>Due {formatShortDate(g.targetDate)}</span>
              </div>
              <div className="progress-bar progress-bar--card">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="goal-exec-card-stats">
                <span>
                  Tasks {done}/{tks.length}
                </span>
                <span>Milestones {ms.length}</span>
                <span>Notes {nb.length}</span>
              </div>
              {next && (
                <div className="goal-exec-card-next">
                  <span className="label">Next</span>
                  <span className="val">{next.title}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function DoNextPanel({ project, updateProject, filters, presentation }) {
  const { taskFilterStatus, taskFilterPriority, setTaskFilterStatus, setTaskFilterPriority } = filters
  const queue = doNextQueue(project, presentation ? 12 : 24)
  let list = queue
  if (taskFilterStatus !== 'all') list = list.filter((t) => t.status === taskFilterStatus)
  if (taskFilterPriority !== 'all') list = list.filter((t) => t.priority === taskFilterPriority)

  const rowClass = (t) => {
    let c = 'donext-row'
    if (isTaskOverdue(t)) c += ' donext-row--overdue'
    else if (isDueToday(t.dueDate)) c += ' donext-row--today'
    return c
  }

  return (
    <section className={`dash-section dash-section--donext${presentation ? ' dash-section--pres' : ''}`}>
      <div className="dash-section-head">
        <h2 className="dash-section-title">Do next</h2>
        {!presentation && (
          <div className="donext-filters">
            <select className="lpms-select lpms-select--inline" value={taskFilterStatus} onChange={(e) => setTaskFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select className="lpms-select lpms-select--inline" value={taskFilterPriority} onChange={(e) => setTaskFilterPriority(e.target.value)}>
              <option value="all">All priorities</option>
              {PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="donext-list">
        {list.length === 0 && (
          <div className="dash-empty dash-empty--compact">
            <p className="dash-empty-title">Queue clear</p>
            <p className="dash-empty-hint">Add tasks under goals or mark items as next actions.</p>
          </div>
        )}
        {list.slice(0, presentation ? 10 : 16).map((t) => {
          const g = (project.goals || []).find((x) => x.id === t.goalId)
          return (
            <div key={t.id} className={rowClass(t)}>
              <label className="donext-check">
                <input
                  type="checkbox"
                  className="donext-checkbox"
                  checked={t.completed}
                  onChange={(e) =>
                    updateProject(project.id, (proj) => M.updateTask(proj, t.id, { completed: e.target.checked }))
                  }
                />
              </label>
              <div className="donext-main">
                <div className="donext-title">
                  {t.title}
                  {t.isNextAction && <span className="donext-flag">NEXT</span>}
                </div>
                <div className="donext-sub">
                  <span className="donext-goal">{g?.title || 'Unassigned goal'}</span>
                  {t.dueDate && <span className="donext-due">{formatShortDate(t.dueDate)}</span>}
                </div>
              </div>
              <div className="donext-priority">
                <PriorityChip priority={t.priority} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const URGENCY_BUCKET_LIST = [
  {
    key: 'overdue',
    label: 'Overdue',
    subtitle: 'Past due — needs attention',
    tone: 'overdue',
  },
  {
    key: 'today',
    label: 'Today',
    subtitle: 'Due before midnight',
    tone: 'today',
  },
  {
    key: 'week',
    label: 'This week',
    subtitle: 'Next seven days',
    tone: 'week',
  },
  {
    key: 'later',
    label: 'Later',
    subtitle: 'Scheduled ahead',
    tone: 'later',
  },
]

const URGENCY_BUCKET_META = Object.fromEntries(URGENCY_BUCKET_LIST.map((b) => [b.key, b]))

export function UpcomingUrgencyPanel({ project, presentation }) {
  const groups = groupTimelineByUrgency(project)
  const keys = ['overdue', 'today', 'week', 'later']

  return (
    <section className={`dash-section dash-section--upcoming${presentation ? ' dash-section--pres' : ''}`}>
      <div className="dash-section-head dash-section-head--stack">
        <div>
          <h2 className="dash-section-title">Upcoming &amp; at risk</h2>
          <p className="dash-section-subtitle">
            Deadlines and targets by time window — scan from a distance, drill in on Timeline.
          </p>
        </div>
      </div>

      <div className="urgency-buckets">
        {keys.map((key) => {
          const meta = URGENCY_BUCKET_META[key]
          const items = (groups[key] || []).slice(0, presentation ? 10 : 14)
          const total = (groups[key] || []).length

          return (
            <div key={key} className={`urgency-bucket urgency-bucket--${meta?.tone || 'later'}`}>
              <header className="urgency-bucket-head">
                <div className="urgency-bucket-titles">
                  <h3 className="urgency-bucket-label">{meta?.label}</h3>
                  <p className="urgency-bucket-sub">{meta?.subtitle}</p>
                </div>
                <span className="urgency-bucket-count" aria-label={`${total} items`}>
                  {total}
                </span>
              </header>

              <div className="urgency-bucket-body">
                {items.length === 0 ? (
                  <div className="urgency-bucket-empty">
                    <span className="urgency-bucket-empty-line" aria-hidden />
                    <p>Nothing in this window</p>
                  </div>
                ) : (
                  items.map((it) => (
                    <article key={`${it.kind}-${it.id}`} className="urgency-card">
                      <div className="urgency-card-top">
                        <time className="urgency-card-date" dateTime={it.date}>
                          {formatShortDate(it.date)}
                        </time>
                        <span className="urgency-type-pill">{timelineKindLabel(it.kind)}</span>
                      </div>
                      <h4 className="urgency-card-title">{it.title}</h4>
                      {it.goalTitle && <p className="urgency-card-goal">{it.goalTitle}</p>}
                      <div className="urgency-card-foot">
                        {it.status && <StatusChip status={it.status} />}
                        {it.kind === 'task' && it.priority && (
                          <PriorityChip priority={it.priority} />
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function BlockersStrip({ project, updateProject, onEditBlocker, presentation }) {
  const list = (project.blockers || []).filter((b) => b.status !== 'Resolved')

  return (
    <section className={`dash-section dash-section--blockers${presentation ? ' dash-section--pres' : ''}`}>
      <div className="dash-section-head">
        <h2 className="dash-section-title">Blockers</h2>
        {!presentation && (
          <button type="button" className="lpms-btn sm primary" onClick={() => onEditBlocker({})}>
            + Blocker
          </button>
        )}
      </div>
      <div className="blockers-strip">
        {list.length === 0 && (
          <div className="dash-empty dash-empty--compact">
            <p className="dash-empty-title">No open blockers</p>
            <p className="dash-empty-hint">Surface risks here when execution stalls.</p>
          </div>
        )}
        {list.map((b) => {
          const g = b.goalId ? project.goals?.find((x) => x.id === b.goalId) : null
          return (
            <div key={b.id} className="blocker-card">
              <div className="blocker-card-top">
                <strong>{b.title}</strong>
                <PriorityChip priority={b.severity} />
              </div>
              {g && <div className="muted small">Goal: {g.title}</div>}
              {b.owner && <div className="muted small">Owner: {b.owner}</div>}
              {!presentation && (
                <div className="blocker-card-actions">
                  <button type="button" className="lpms-btn sm" onClick={() => onEditBlocker({ ...b })}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="lpms-btn sm"
                    onClick={() => updateProject(project.id, (proj) => M.updateBlocker(proj, b.id, { status: 'Resolved' }))}
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
