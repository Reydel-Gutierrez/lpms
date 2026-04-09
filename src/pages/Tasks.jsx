import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { STATUSES, PRIORITIES } from '../data/constants'
import { StatusChip } from '../components/ui/StatusChip'
import { PriorityChip } from '../components/ui/PriorityChip'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { formatShortDate } from '../utils/dates'
import { phaseName, isTaskOverdue, isDueToday } from '../utils/deriveStats'
import * as M from '../utils/mutations'

export function Tasks() {
  const { activeProject, updateProject } = useAppState()
  const [q, setQ] = useState('')
  const [fGoal, setFGoal] = useState('all')
  const [fPhase, setFPhase] = useState('all')
  const [fStatus, setFStatus] = useState('all')
  const [fPriority, setFPriority] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [groupByGoal, setGroupByGoal] = useState(true)
  const [modal, setModal] = useState(null)

  const p = activeProject

  const filtered = useMemo(() => {
    if (!p) return []
    let list = [...(p.tasks || [])]
    if (!showDone) list = list.filter((t) => !t.completed)
    if (fGoal !== 'all') list = list.filter((t) => t.goalId === fGoal)
    if (fPhase !== 'all') list = list.filter((t) => t.phaseId === fPhase)
    if (fStatus !== 'all') list = list.filter((t) => t.status === fStatus)
    if (fPriority !== 'all') list = list.filter((t) => t.priority === fPriority)
    if (q.trim()) {
      const qq = q.toLowerCase()
      list = list.filter(
        (t) => t.title.toLowerCase().includes(qq) || (t.description || '').toLowerCase().includes(qq)
      )
    }
    return list.sort((a, b) => {
      if (a.isNextAction !== b.isNextAction) return a.isNextAction ? -1 : 1
      return (a.dueDate || '').localeCompare(b.dueDate || '')
    })
  }, [p, q, fGoal, fPhase, fStatus, fPriority, showDone])

  const byGoal = useMemo(() => {
    const map = new Map()
    for (const t of filtered) {
      const k = t.goalId || '__none__'
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(t)
    }
    return map
  }, [filtered])

  if (!p) {
    return (
      <div className="lpms-page">
        <EmptyState title="Select a project" action={<Link to="/projects" className="lpms-btn primary">Projects</Link>} />
      </div>
    )
  }

  const goals = p.goals || []
  const phases = p.phases || []

  const renderTaskRow = (t) => {
    const g = goals.find((x) => x.id === t.goalId)
    const overdue = isTaskOverdue(t)
    const today = isDueToday(t.dueDate)
    return (
      <div
        key={t.id}
        className={`task-ops-row${overdue ? ' task-ops-row--overdue' : ''}${today ? ' task-ops-row--today' : ''}`}
      >
        <label className="task-ops-check">
          <input
            type="checkbox"
            checked={t.completed}
            onChange={(e) => updateProject(p.id, (proj) => M.updateTask(proj, t.id, { completed: e.target.checked }))}
          />
        </label>
        <div className="task-ops-body">
          <div className="task-ops-title">
            {t.title}
            {t.isNextAction && <span className="donext-flag">NEXT</span>}
          </div>
          <div className="task-ops-meta muted small">
            {g?.title || 'No goal'}
            {t.dueDate && ` · ${formatShortDate(t.dueDate)}`}
            {phaseName(p, t.phaseId) && ` · ${phaseName(p, t.phaseId)}`}
          </div>
        </div>
        <div className="task-ops-chips">
          <StatusChip status={t.status} />
          <PriorityChip priority={t.priority} />
        </div>
        <div className="task-ops-actions">
          <button type="button" className="lpms-btn sm" onClick={() => setModal({ ...t })}>
            Edit
          </button>
          <button type="button" className="lpms-btn sm danger" onClick={() => updateProject(p.id, (proj) => M.deleteTask(proj, t.id))}>
            Del
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lpms-page tasks-page">
      <header className="page-header-block">
        <h1>Tasks</h1>
        <p className="muted">Operational queue for {p.name}, organized by goal.</p>
      </header>

      <div className="lpms-card tasks-toolbar">
        <div className="lpms-card-body tasks-toolbar-inner">
          <input className="lpms-input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="lpms-select" value={fGoal} onChange={(e) => setFGoal(e.target.value)}>
            <option value="all">All goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <select className="lpms-select" value={fPhase} onChange={(e) => setFPhase(e.target.value)}>
            <option value="all">All phases</option>
            {phases.map((ph) => (
              <option key={ph.id} value={ph.id}>
                {ph.name}
              </option>
            ))}
          </select>
          <select className="lpms-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="lpms-select" value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
            <option value="all">All priorities</option>
            {PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
          <label className="lpms-check-inline">
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            Done
          </label>
          <label className="lpms-check-inline">
            <input type="checkbox" checked={groupByGoal} onChange={(e) => setGroupByGoal(e.target.checked)} />
            Group by goal
          </label>
          <button type="button" className="lpms-btn primary" onClick={() => setModal({})}>
            + Task
          </button>
        </div>
      </div>

      <div className="lpms-card">
        <div className="lpms-card-body" style={{ padding: 0 }}>
          {filtered.length === 0 && <EmptyState title="No tasks match" hint="Adjust filters or add work under a goal." />}
          {groupByGoal
            ? [...byGoal.entries()].map(([gid, rows]) => {
                const g = goals.find((x) => x.id === gid)
                return (
                  <div key={gid} className="task-goal-group">
                    <h3 className="task-goal-group-title">{g?.title || 'Unassigned goal'}</h3>
                    {rows.map(renderTaskRow)}
                  </div>
                )
              })
            : filtered.map(renderTaskRow)}
        </div>
      </div>

      {modal !== null && (
        <TaskFormModal
          project={p}
          initial={modal}
          onClose={() => setModal(null)}
          onSave={(draft) => {
            if (modal.id) updateProject(p.id, (proj) => M.updateTask(proj, modal.id, draft))
            else updateProject(p.id, (proj) => M.addTask(proj, draft))
            setModal(null)
          }}
        />
      )}
    </div>
  )
}

function TaskFormModal({ project, initial, onClose, onSave }) {
  const goals = project.goals || []
  const phases = project.phases || []
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate || '')
  const [status, setStatus] = useState(initial.status || 'In Progress')
  const [priority, setPriority] = useState(initial.priority || 'Medium')
  const [isNextAction, setIsNextAction] = useState(!!initial.isNextAction)
  const [goalId, setGoalId] = useState(initial.goalId || goals[0]?.id || '')
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
                goalId,
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
        <label className="lpms-label">Goal</label>
        <select className="lpms-select" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>
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
      <label className="lpms-check-row">
        <input type="checkbox" checked={isNextAction} onChange={(e) => setIsNextAction(e.target.checked)} />
        Next action
      </label>
      <label className="lpms-check-row">
        <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
        Completed
      </label>
    </Modal>
  )
}
