import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { STATUSES, PRIORITIES } from '../data/constants'
import { StatusChip } from '../components/ui/StatusChip'
import { PriorityChip } from '../components/ui/PriorityChip'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { formatShortDate, daysUntil, isThisWeek } from '../utils/dates'
import {
  currentPhaseName,
  taskStats,
  blockerCount,
  upcomingMilestones,
  nextActions,
  timelineEvents,
  phaseName,
} from '../utils/projectStats'
import * as M from '../utils/mutations'

function Collapsible({ title, defaultOpen = true, right, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="lpms-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="lpms-card-header">
        <button type="button" className="collapsible-head" onClick={() => setOpen((o) => !o)}>
          <h3 className="lpms-card-title" style={{ margin: 0 }}>
            {title}
          </h3>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{open ? '▼' : '▶'}</span>
        </button>
        {right}
      </div>
      {open && <div className="lpms-card-body collapsible-body" style={{ flex: 1 }}>{children}</div>}
    </div>
  )
}

export function Dashboard() {
  const { activeProject, updateProject } = useAppState()
  const [taskFilterStatus, setTaskFilterStatus] = useState('all')
  const [taskFilterPriority, setTaskFilterPriority] = useState('all')

  const [goalModal, setGoalModal] = useState(null)
  const [taskModal, setTaskModal] = useState(null)
  const [milestoneModal, setMilestoneModal] = useState(null)
  const [blockerModal, setBlockerModal] = useState(null)

  const p = activeProject

  const filteredNext = useMemo(() => {
    if (!p) return []
    let list = nextActions(p, 50)
    if (taskFilterStatus !== 'all') list = list.filter((t) => t.status === taskFilterStatus)
    if (taskFilterPriority !== 'all') list = list.filter((t) => t.priority === taskFilterPriority)
    return list.slice(0, 10)
  }, [p, taskFilterStatus, taskFilterPriority])

  if (!p) {
    return (
      <div className="lpms-page">
        <EmptyState
          title="No active workspace"
          hint="Pick a project from the rail or open Projects to create one."
          action={
            <Link to="/projects" className="lpms-btn primary">
              Open projects
            </Link>
          }
        />
      </div>
    )
  }

  const { total, completed } = taskStats(p)
  const openBlockers = blockerCount(p)
  const milestonesUp = upcomingMilestones(p, 6)
  const events = timelineEvents(p)
  const thisWeek = events.filter((e) => isThisWeek(e.date))

  const saveGoal = (draft) => {
    if (goalModal?.id) {
      updateProject(p.id, (proj) => M.updateGoal(proj, goalModal.id, draft))
    } else {
      updateProject(p.id, (proj) => M.addGoal(proj, draft))
    }
    setGoalModal(null)
  }

  const saveTask = (draft) => {
    if (taskModal?.id) {
      updateProject(p.id, (proj) => M.updateTask(proj, taskModal.id, draft))
    } else {
      updateProject(p.id, (proj) => M.addTask(proj, draft))
    }
    setTaskModal(null)
  }

  const saveMilestone = (draft) => {
    if (milestoneModal?.id) {
      updateProject(p.id, (proj) => M.updateMilestone(proj, milestoneModal.id, draft))
    } else {
      updateProject(p.id, (proj) => M.addMilestone(proj, draft))
    }
    setMilestoneModal(null)
  }

  const saveBlocker = (draft) => {
    if (blockerModal?.id) {
      updateProject(p.id, (proj) => M.updateBlocker(proj, blockerModal.id, draft))
    } else {
      updateProject(p.id, (proj) => M.addBlocker(proj, draft))
    }
    setBlockerModal(null)
  }

  return (
    <div className="lpms-page">
      <section
        className="presentation-hero"
        style={{ ['--hero-accent']: p.accentColor || 'var(--accent)' }}
      >
        <h1>{p.name}</h1>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', maxWidth: '52rem', fontSize: '1.05rem' }}>
          {p.description || 'No description.'}
        </p>
        <div className="meta">
          <StatusChip status={p.status} />
          <PriorityChip priority={p.priority} />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{p.type}</span>
          {p.owner && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Owner: <strong style={{ color: 'var(--text)' }}>{p.owner}</strong>
            </span>
          )}
        </div>
        <div style={{ marginTop: '1.25rem', maxWidth: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <span>Execution progress</span>
            <span>{p.progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${p.progressPercent}%` }} />
          </div>
        </div>
      </section>

      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-tile">
          <div className="label">Current phase</div>
          <div className="value" style={{ fontSize: '1.15rem' }}>
            {currentPhaseName(p)}
          </div>
        </div>
        <div className="kpi-tile">
          <div className="label">Target date</div>
          <div className="value" style={{ fontSize: '1.15rem' }}>
            {formatShortDate(p.targetDate)}
          </div>
          {p.targetDate && (
            <div className="sub">
              {(() => {
                const d = daysUntil(p.targetDate)
                if (d === null) return null
                if (d < 0) return `${Math.abs(d)}d past`
                return `${d}d remaining`
              })()}
            </div>
          )}
        </div>
        <div className="kpi-tile">
          <div className="label">Tasks</div>
          <div className="value">
            {completed}/{total}
          </div>
          <div className="sub">completed</div>
        </div>
        <div className="kpi-tile">
          <div className="label">Open blockers</div>
          <div className="value">{openBlockers}</div>
        </div>
        <div className="kpi-tile">
          <div className="label">Upcoming milestones</div>
          <div className="value">{milestonesUp.length}</div>
          <div className="sub">next in pipeline</div>
        </div>
      </div>

      <div className="dashboard-cols">
        <div className="span-6">
          <Collapsible
            title="Goals"
            right={
              <button type="button" className="lpms-btn sm primary" onClick={() => setGoalModal({})}>
                + Add
              </button>
            }
          >
            {(p.goals || []).length === 0 && <EmptyState title="No goals" hint="Define outcomes for this mission." />}
            {(p.goals || []).map((g) => (
              <div key={g.id} className="phase-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{g.title}</strong>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button type="button" className="lpms-btn ghost sm" onClick={() => setGoalModal({ id: g.id, ...g })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="lpms-btn ghost sm danger"
                      onClick={() => updateProject(p.id, (proj) => M.deleteGoal(proj, g.id))}
                    >
                      Del
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusChip status={g.status} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target {formatShortDate(g.targetDate)}</span>
                  {g.phaseId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Phase: {phaseName(p, g.phaseId)}</span>
                  )}
                </div>
                <div className="progress-bar" style={{ marginTop: '0.25rem' }}>
                  <span style={{ width: `${g.progressPercent}%` }} />
                </div>
              </div>
            ))}
          </Collapsible>
        </div>

        <div className="span-6">
          <Collapsible
            title="Phases"
            right={
              <Link to="/goals" className="lpms-btn sm">
                Manage
              </Link>
            }
          >
            {[...(p.phases || [])]
              .sort((a, b) => a.order - b.order)
              .map((ph) => (
                <div key={ph.id} className="phase-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{ph.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ph.completed ? 'Complete' : ph.isCurrent ? 'Current' : 'Pending'}
                    </div>
                  </div>
                  {ph.isCurrent && <StatusChip status="In Progress" />}
                </div>
              ))}
            {(p.phases || []).length === 0 && <EmptyState title="No phases" hint="Add phases on Goals & Phases." />}
          </Collapsible>
        </div>

        <div className="span-7">
          <Collapsible
            title="Next actions"
            right={
              <button type="button" className="lpms-btn sm primary" onClick={() => setTaskModal({})}>
                + Task
              </button>
            }
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <select className="lpms-select" style={{ width: 'auto', minWidth: '140px' }} value={taskFilterStatus} onChange={(e) => setTaskFilterStatus(e.target.value)}>
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select className="lpms-select" style={{ width: 'auto', minWidth: '130px' }} value={taskFilterPriority} onChange={(e) => setTaskFilterPriority(e.target.value)}>
                <option value="all">All priorities</option>
                {PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>
            {filteredNext.length === 0 && <EmptyState title="No tasks match filters" hint="Clear filters or add tasks." />}
            {filteredNext.map((t) => (
              <div key={t.id} className="task-row">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={(e) => updateProject(p.id, (proj) => M.updateTask(proj, t.id, { completed: e.target.checked }))}
                  aria-label="Complete task"
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.55 : 1 }}>
                    {t.title}
                    {t.isNextAction && (
                      <span style={{ marginLeft: '0.35rem', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800 }}>NEXT</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Due {formatShortDate(t.dueDate)} · {phaseName(p, t.phaseId) || 'Unassigned phase'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                  <PriorityChip priority={t.priority} />
                  <button type="button" className="lpms-btn ghost sm" onClick={() => setTaskModal({ id: t.id, ...t })}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </Collapsible>
        </div>

        <div className="span-5">
          <Collapsible
            title="Blockers"
            defaultOpen
            right={
              <button type="button" className="lpms-btn sm primary" onClick={() => setBlockerModal({})}>
                + Blocker
              </button>
            }
          >
            {(p.blockers || []).filter((b) => !b.resolved).length === 0 && (
              <EmptyState title="No open blockers" hint="Surface risks before they slip." />
            )}
            {(p.blockers || [])
              .filter((b) => !b.resolved)
              .map((b) => (
                <div key={b.id} className="lpms-card" style={{ marginBottom: '0.65rem', boxShadow: 'none' }}>
                  <div className="lpms-card-body" style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <strong>{b.title}</strong>
                      <PriorityChip priority={b.severity} />
                    </div>
                    {b.owner && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Owner: {b.owner}</div>}
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button type="button" className="lpms-btn sm" onClick={() => setBlockerModal({ id: b.id, ...b })}>
                        Edit
                      </button>
                      <button type="button" className="lpms-btn sm" onClick={() => updateProject(p.id, (proj) => M.updateBlocker(proj, b.id, { resolved: true }))}>
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </Collapsible>
        </div>

        <div>
          <Collapsible
            title="Milestones & dates"
            right={
              <button type="button" className="lpms-btn sm primary" onClick={() => setMilestoneModal({})}>
                + Milestone
              </button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {milestonesUp.map((m) => (
                <div key={m.id} className="kpi-tile" style={{ minHeight: 'auto' }}>
                  <div className="label">{formatShortDate(m.dueDate)}</div>
                  <div className="value" style={{ fontSize: '1rem' }}>
                    {m.title}
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    <StatusChip status={m.status} />
                    <button type="button" className="lpms-btn ghost sm" onClick={() => setMilestoneModal({ id: m.id, ...m })}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {milestonesUp.length === 0 && <EmptyState title="No upcoming milestones" />}
          </Collapsible>
        </div>

        <div>
          <Collapsible title="Timeline pulse" right={<Link to="/timeline" className="lpms-btn sm">Full timeline</Link>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  This week
                </h4>
                {thisWeek.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nothing due this week.</p>}
                {thisWeek.map((e) => (
                  <div key={`${e.kind}-${e.id}`} className="phase-row">
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>{e.date}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{e.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.kind}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  Upcoming stream
                </h4>
                <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '0.35rem' }}>
                  {events.slice(0, 14).map((e) => (
                    <div key={`${e.kind}-${e.id}-${e.date}`} style={{ display: 'flex', gap: '0.75rem', padding: '0.45rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: '88px', flexShrink: 0, fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.date}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.kind}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Collapsible>
        </div>
      </div>

      {goalModal && (
        <GoalModal initial={goalModal} phases={p.phases || []} onSave={saveGoal} onClose={() => setGoalModal(null)} />
      )}
      {taskModal && (
        <TaskModal initial={taskModal} phases={p.phases || []} onSave={saveTask} onClose={() => setTaskModal(null)} />
      )}
      {milestoneModal && (
        <MilestoneModal initial={milestoneModal} phases={p.phases || []} onSave={saveMilestone} onClose={() => setMilestoneModal(null)} />
      )}
      {blockerModal && (
        <BlockerModal initial={blockerModal} onSave={saveBlocker} onClose={() => setBlockerModal(null)} />
      )}
    </div>
  )
}

function GoalModal({ initial, phases, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [status, setStatus] = useState(initial.status || 'In Progress')
  const [targetDate, setTargetDate] = useState(initial.targetDate || '')
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const [progressPercent, setProgressPercent] = useState(initial.progressPercent ?? 0)

  return (
    <Modal
      title={initial.id ? 'Edit goal' : 'New goal'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lpms-btn primary" onClick={() => onSave({ title, status, targetDate, phaseId: phaseId || null, progressPercent: Number(progressPercent) })}>
            Save
          </button>
        </>
      }
    >
      <div className="lpms-field">
        <label className="lpms-label">Title</label>
        <input className="lpms-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Status</label>
        <select className="lpms-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Target date</label>
        <input className="lpms-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Phase (optional)</label>
        <select className="lpms-select" value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
          <option value="">—</option>
          {phases.map((ph) => (
            <option key={ph.id} value={ph.id}>
              {ph.name}
            </option>
          ))}
        </select>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Progress %</label>
        <input className="lpms-input" type="number" min={0} max={100} value={progressPercent} onChange={(e) => setProgressPercent(e.target.value)} />
      </div>
    </Modal>
  )
}

function TaskModal({ initial, phases, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate || '')
  const [status, setStatus] = useState(initial.status || 'In Progress')
  const [priority, setPriority] = useState(initial.priority || 'Medium')
  const [isNextAction, setIsNextAction] = useState(!!initial.isNextAction)
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const [completed, setCompleted] = useState(!!initial.completed)

  return (
    <Modal
      title={initial.id ? 'Edit task' : 'New task'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="lpms-btn primary"
            onClick={() =>
              onSave({
                title,
                description,
                dueDate,
                status,
                priority,
                isNextAction,
                phaseId: phaseId || null,
                completed,
              })
            }
          >
            Save
          </button>
        </>
      }
    >
      <div className="lpms-field">
        <label className="lpms-label">Title</label>
        <input className="lpms-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Description</label>
        <textarea className="lpms-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Due date</label>
          <input className="lpms-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Phase</label>
          <select className="lpms-select" value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
            <option value="">—</option>
            {phases.map((ph) => (
              <option key={ph.id} value={ph.id}>
                {ph.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Status</label>
          <select className="lpms-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Priority</label>
          <select className="lpms-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="lpms-field" style={{ marginTop: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={isNextAction} onChange={(e) => setIsNextAction(e.target.checked)} />
          <span>Mark as next action</span>
        </label>
      </div>
      <div className="lpms-field">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
          <span>Completed</span>
        </label>
      </div>
    </Modal>
  )
}

function MilestoneModal({ initial, phases, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [dueDate, setDueDate] = useState(initial.dueDate || '')
  const [status, setStatus] = useState(initial.status || 'Not Started')
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const [notes, setNotes] = useState(initial.notes || '')

  return (
    <Modal
      title={initial.id ? 'Edit milestone' : 'New milestone'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lpms-btn primary" onClick={() => onSave({ title, dueDate, status, phaseId: phaseId || null, notes })}>
            Save
          </button>
        </>
      }
    >
      <div className="lpms-field">
        <label className="lpms-label">Title</label>
        <input className="lpms-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Due date</label>
        <input className="lpms-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Status</label>
        <select className="lpms-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Phase</label>
        <select className="lpms-select" value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
          <option value="">—</option>
          {phases.map((ph) => (
            <option key={ph.id} value={ph.id}>
              {ph.name}
            </option>
          ))}
        </select>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Notes</label>
        <textarea className="lpms-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  )
}

function BlockerModal({ initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [severity, setSeverity] = useState(initial.severity || 'Medium')
  const [owner, setOwner] = useState(initial.owner || '')
  const [resolved, setResolved] = useState(!!initial.resolved)

  return (
    <Modal
      title={initial.id ? 'Edit blocker' : 'New blocker'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lpms-btn primary" onClick={() => onSave({ title, description, severity, owner, resolved })}>
            Save
          </button>
        </>
      }
    >
      <div className="lpms-field">
        <label className="lpms-label">Title</label>
        <input className="lpms-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Description</label>
        <textarea className="lpms-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Severity</label>
          <select className="lpms-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {['Low', 'Medium', 'High', 'Critical'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Owner</label>
          <input className="lpms-input" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
      </div>
      <div className="lpms-field">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={resolved} onChange={(e) => setResolved(e.target.checked)} />
          <span>Resolved</span>
        </label>
      </div>
    </Modal>
  )
}
