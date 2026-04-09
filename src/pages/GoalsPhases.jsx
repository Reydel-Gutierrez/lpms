import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { STATUSES, PRIORITIES, PHASE_STATUSES } from '../data/constants'
import { StatusChip } from '../components/ui/StatusChip'
import { PriorityChip } from '../components/ui/PriorityChip'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { GoalDetailDrawer } from '../components/goals/GoalDetailDrawer'
import { formatShortDate } from '../utils/dates'
import { goalProgressPercent, tasksForGoal } from '../utils/deriveStats'
import * as M from '../utils/mutations'

export function GoalsPhases() {
  const { activeProject, updateProject } = useAppState()
  const [phaseName, setPhaseName] = useState('')
  const [goalModal, setGoalModal] = useState(null)
  const [msModal, setMsModal] = useState(null)
  const [phaseEdit, setPhaseEdit] = useState(null)
  const [drawerGoalId, setDrawerGoalId] = useState(null)

  const phases = useMemo(() => {
    if (!activeProject) return []
    return [...(activeProject.phases || [])].sort((a, b) => a.order - b.order)
  }, [activeProject])

  const goalsByPhase = useMemo(() => {
    const map = new Map()
    map.set('__none__', [])
    if (!activeProject) return map
    for (const ph of phases) map.set(ph.id, [])
    for (const g of activeProject.goals || []) {
      const k = g.phaseId || '__none__'
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(g)
    }
    return map
  }, [activeProject, phases])

  if (!activeProject) {
    return (
      <div className="lpms-page">
        <EmptyState
          title="Select a project"
          hint="Choose a workspace from the rail."
          action={
            <Link to="/projects" className="lpms-btn primary">
              Projects
            </Link>
          }
        />
      </div>
    )
  }

  const p = activeProject

  const move = (index, dir) => {
    const next = [...phases.map((x) => x.id)]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    updateProject(p.id, (proj) => M.reorderPhases(proj, next))
  }

  const addPhase = () => {
    const name = phaseName.trim()
    if (!name) return
    updateProject(p.id, (proj) => M.addPhase(proj, name))
    setPhaseName('')
  }

  const deleteGoal = (goal) => {
    if (window.confirm(`Delete goal "${goal.title}" and all tasks, milestones, and notes under it?`)) {
      updateProject(p.id, (proj) => M.deleteGoal(proj, goal.id))
    }
  }

  return (
    <div className="lpms-page goals-plan-page">
      <header className="page-header-block">
        <h1>Goals &amp; phases</h1>
        <p className="muted">
          Planning structure for <strong className="text-bright">{p.name}</strong> — align phases, goals, and checkpoints.
        </p>
      </header>

      <section className="lpms-card plan-card">
        <div className="lpms-card-header">
          <h3 className="lpms-card-title">Phases</h3>
        </div>
        <div className="lpms-card-body">
          <div className="phase-add-row">
            <input
              className="lpms-input"
              placeholder="New phase name"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPhase()}
            />
            <button type="button" className="lpms-btn primary" onClick={addPhase}>
              Add phase
            </button>
          </div>
          {phases.length === 0 && (
            <EmptyState title="No phases yet" hint="Model your delivery sequence (build, certify, launch, etc.)." />
          )}
          {phases.map((ph, i) => {
            const tasksInPhase = (p.tasks || []).filter((t) => t.phaseId === ph.id)
            const done = tasksInPhase.filter((t) => t.completed).length
            const pct = tasksInPhase.length ? Math.round((done / tasksInPhase.length) * 100) : 0
            const phaseGoals = goalsByPhase.get(ph.id) || []
            return (
              <div key={ph.id} className="phase-plan-row">
                <div className="phase-plan-head">
                  <div>
                    <h4>{ph.name}</h4>
                    {ph.description && <p className="muted small">{ph.description}</p>}
                    <div className="phase-plan-chips">
                      <StatusChip status={ph.status} />
                      {p.currentPhaseId === ph.id && <span className="chip chip-priority-high">Current</span>}
                    </div>
                  </div>
                  <div className="phase-plan-actions">
                    <button type="button" className="lpms-btn sm" onClick={() => move(i, -1)} disabled={i === 0}>
                      Up
                    </button>
                    <button type="button" className="lpms-btn sm" onClick={() => move(i, 1)} disabled={i === phases.length - 1}>
                      Down
                    </button>
                    <button type="button" className="lpms-btn sm primary" onClick={() => updateProject(p.id, (proj) => M.setCurrentPhase(proj, ph.id))}>
                      Set current
                    </button>
                    <button type="button" className="lpms-btn sm" onClick={() => setPhaseEdit({ ...ph })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="lpms-btn sm danger"
                      onClick={() => {
                        if (window.confirm(`Delete phase "${ph.name}"?`)) updateProject(p.id, (proj) => M.deletePhase(proj, ph.id))
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <p className="muted small">
                  {done}/{tasksInPhase.length} tasks in phase · {phaseGoals.length} goal{phaseGoals.length !== 1 ? 's' : ''}
                </p>

                <div className="phase-goals-list">
                  {phaseGoals.length === 0 && <p className="muted small">No goals in this phase.</p>}
                  {phaseGoals.map((g) => (
                    <GoalPlanningRow
                      key={g.id}
                      project={p}
                      goal={g}
                      onOpen={() => setDrawerGoalId(g.id)}
                      onEdit={() => setGoalModal({ ...g })}
                      onDelete={() => deleteGoal(g)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="lpms-card plan-card">
        <div className="lpms-card-header">
          <h3 className="lpms-card-title">Unassigned goals</h3>
          <button type="button" className="lpms-btn sm primary" onClick={() => setGoalModal({})}>
            + Goal
          </button>
        </div>
        <div className="lpms-card-body">
          {(goalsByPhase.get('__none__') || []).length === 0 && <EmptyState title="No unassigned goals" />}
          {(goalsByPhase.get('__none__') || []).map((g) => (
            <GoalPlanningRow
              key={g.id}
              project={p}
              goal={g}
              onOpen={() => setDrawerGoalId(g.id)}
              onEdit={() => setGoalModal({ ...g })}
              onDelete={() => deleteGoal(g)}
            />
          ))}
        </div>
      </section>

      <section className="lpms-card plan-card">
        <div className="lpms-card-header">
          <h3 className="lpms-card-title">All milestones</h3>
          <button type="button" className="lpms-btn sm primary" onClick={() => setMsModal({})}>
            + Milestone
          </button>
        </div>
        <div className="lpms-card-body">
          {(p.milestones || []).length === 0 && (
            <EmptyState title="No milestones" hint="Attach milestones to goals from the goal drawer or here." />
          )}
          {[...(p.milestones || [])]
            .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
            .map((m) => {
              const g = (p.goals || []).find((x) => x.id === m.goalId)
              return (
                <div key={m.id} className="plan-milestone-row">
                  <div>
                    <strong>{m.title}</strong>
                    <div className="muted small">
                      {formatShortDate(m.dueDate)} · {g?.title || 'Goal'}
                    </div>
                  </div>
                  <div className="row-actions">
                    <StatusChip status={m.status} />
                    <button type="button" className="lpms-btn ghost sm" onClick={() => setMsModal({ ...m })}>
                      Edit
                    </button>
                    <button type="button" className="lpms-btn ghost sm danger" onClick={() => updateProject(p.id, (proj) => M.deleteMilestone(proj, m.id))}>
                      Del
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      </section>

      {drawerGoalId && <GoalDetailDrawer project={p} goalId={drawerGoalId} onClose={() => setDrawerGoalId(null)} />}

      {goalModal && (
        <GoalPlanningModal
          initial={goalModal}
          phases={phases}
          onClose={() => setGoalModal(null)}
          onSave={(draft) => {
            if (goalModal.id) updateProject(p.id, (proj) => M.updateGoal(proj, goalModal.id, draft))
            else updateProject(p.id, (proj) => M.addGoal(proj, draft))
            setGoalModal(null)
          }}
        />
      )}
      {msModal && (
        <MilestonePlanningModal
          initial={msModal}
          project={p}
          phases={phases}
          onClose={() => setMsModal(null)}
          onSave={(draft) => {
            if (msModal.id) updateProject(p.id, (proj) => M.updateMilestone(proj, msModal.id, draft))
            else updateProject(p.id, (proj) => M.addMilestone(proj, draft))
            setMsModal(null)
          }}
        />
      )}
      {phaseEdit && (
        <PhaseEditModal
          initial={phaseEdit}
          onClose={() => setPhaseEdit(null)}
          onSave={(draft) => {
            updateProject(p.id, (proj) => M.updatePhase(proj, phaseEdit.id, draft))
            setPhaseEdit(null)
          }}
        />
      )}
    </div>
  )
}

function GoalPlanningRow({ project, goal, onOpen, onEdit, onDelete }) {
  const pct = goalProgressPercent(project, goal.id)
  const n = tasksForGoal(project, goal.id).length
  return (
    <div className="goal-plan-row">
      <div className="goal-plan-main">
        <strong>{goal.title}</strong>
        <div className="goal-plan-meta">
          <StatusChip status={goal.status} />
          <PriorityChip priority={goal.priority} />
          <span className="muted small">Target {formatShortDate(goal.targetDate)}</span>
        </div>
        <div className="progress-bar progress-bar--thin">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="muted small">
          {pct}% · {n} tasks
        </span>
      </div>
      <div className="row-actions">
        <button type="button" className="lpms-btn sm" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="lpms-btn sm" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="lpms-btn sm danger" onClick={onDelete}>
          Del
        </button>
      </div>
    </div>
  )
}

function GoalPlanningModal({ initial, phases, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [status, setStatus] = useState(initial.status || 'In Progress')
  const [priority, setPriority] = useState(initial.priority || 'Medium')
  const [targetDate, setTargetDate] = useState(initial.targetDate || '')
  const [startDate, setStartDate] = useState(initial.startDate || '')
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const [tagsStr, setTagsStr] = useState((initial.tags || []).join(', '))

  return (
    <Modal
      title={initial.id ? 'Edit goal' : 'New goal'}
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
                status,
                priority,
                targetDate,
                startDate,
                phaseId: phaseId || null,
                tags: tagsStr
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
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
        <input className="lpms-input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Description</label>
        <textarea className="lpms-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="lpms-field-row">
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
      <div className="lpms-field-row">
        <div className="lpms-field">
          <label className="lpms-label">Start</label>
          <input className="lpms-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="lpms-field">
          <label className="lpms-label">Target</label>
          <input className="lpms-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
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
        <label className="lpms-label">Tags</label>
        <input className="lpms-input" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
      </div>
    </Modal>
  )
}

function MilestonePlanningModal({ initial, project, phases, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate || '')
  const [status, setStatus] = useState(initial.status || 'Not Started')
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const [goalId, setGoalId] = useState(initial.goalId || (project.goals || [])[0]?.id || '')

  return (
    <Modal
      title={initial.id ? 'Edit milestone' : 'New milestone'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="lpms-btn primary"
            onClick={() => onSave({ title, description, dueDate, status, phaseId: phaseId || null, goalId })}
          >
            Save
          </button>
        </>
      }
    >
      <div className="lpms-field">
        <label className="lpms-label">Goal</label>
        <select className="lpms-select" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          {(project.goals || []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Title</label>
        <input className="lpms-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Description</label>
        <textarea className="lpms-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="lpms-field-row">
        <div className="lpms-field">
          <label className="lpms-label">Due</label>
          <input className="lpms-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
    </Modal>
  )
}

function PhaseEditModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial.name || '')
  const [description, setDescription] = useState(initial.description || '')
  const [status, setStatus] = useState(initial.status || 'Not Started')

  return (
    <Modal
      title="Edit phase"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lpms-btn primary" onClick={() => onSave({ name, description, status })}>
            Save
          </button>
        </>
      }
    >
      <div className="lpms-field">
        <label className="lpms-label">Name</label>
        <input className="lpms-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Description</label>
        <textarea className="lpms-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Status</label>
        <select className="lpms-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {PHASE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
