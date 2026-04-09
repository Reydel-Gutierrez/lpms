import { useMemo, useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { STATUSES, PRIORITIES } from '../../data/constants'
import { StatusChip } from '../ui/StatusChip'
import { PriorityChip } from '../ui/PriorityChip'
import { Drawer } from '../ui/Drawer'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { formatShortDate } from '../../utils/dates'
import {
  phaseName,
  goalProgressPercent,
  tasksForGoal,
  milestonesForGoal,
  brainstormForGoal,
} from '../../utils/deriveStats'
import * as M from '../../utils/mutations'

export function GoalDetailDrawer({ project, goalId, onClose }) {
  const { updateProject } = useAppState()
  const goal = useMemo(
    () => (project?.goals || []).find((g) => g.id === goalId) || null,
    [project, goalId]
  )

  const [taskModal, setTaskModal] = useState(null)
  const [msModal, setMsModal] = useState(null)
  const [noteModal, setNoteModal] = useState(null)

  if (!goal || !project) return null

  const pct = goalProgressPercent(project, goal.id)
  const tasks = tasksForGoal(project, goal.id).sort((a, b) => a.order - b.order)
  const milestones = milestonesForGoal(project, goal.id)
  const notes = brainstormForGoal(project, goal.id)

  const p = project

  return (
    <>
      <Drawer
        open
        wide
        title={goal.title}
        subtitle={goal.description || 'Execution hub for this objective'}
        onClose={onClose}
      >
        <div className="goal-drawer-summary">
          <div className="goal-drawer-chips">
            <StatusChip status={goal.status} />
            <PriorityChip priority={goal.priority} />
            {phaseName(p, goal.phaseId) && (
              <span className="chip chip-status-not-started" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
                {phaseName(p, goal.phaseId)}
              </span>
            )}
          </div>
          <div className="goal-drawer-dates">
            <span>Start {formatShortDate(goal.startDate)}</span>
            <span>Target {formatShortDate(goal.targetDate)}</span>
          </div>
          <div className="goal-drawer-progress">
            <div className="goal-drawer-progress-label">
              <span>Goal progress</span>
              <span>{pct}%</span>
            </div>
            <div className="progress-bar progress-bar--lg">
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
          {goal.tags?.length > 0 && (
            <div className="goal-drawer-tags">
              {goal.tags.map((t) => (
                <span key={t} className="goal-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <section className="goal-drawer-section">
          <div className="goal-drawer-section-head">
            <h3>Tasks</h3>
            <button type="button" className="lpms-btn sm primary" onClick={() => setTaskModal({})}>
              + Task
            </button>
          </div>
          {tasks.length === 0 && <EmptyState title="No tasks yet" hint="Break this goal into executable steps." />}
          <ul className="goal-drawer-list">
            {tasks.map((t) => (
              <li key={t.id} className="goal-drawer-task">
                <label className="goal-drawer-task-check">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={(e) =>
                      updateProject(p.id, (proj) => M.updateTask(proj, t.id, { completed: e.target.checked }))
                    }
                  />
                  <span className={t.completed ? 'done' : ''}>{t.title}</span>
                </label>
                <div className="goal-drawer-task-meta">
                  <PriorityChip priority={t.priority} />
                  <span className="muted">Due {formatShortDate(t.dueDate)}</span>
                  <button type="button" className="lpms-btn ghost sm" onClick={() => setTaskModal({ ...t })}>
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="goal-drawer-section">
          <div className="goal-drawer-section-head">
            <h3>Milestones</h3>
            <button type="button" className="lpms-btn sm primary" onClick={() => setMsModal({})}>
              + Milestone
            </button>
          </div>
          {milestones.length === 0 && <EmptyState title="No milestones" />}
          <ul className="goal-drawer-list">
            {milestones.map((m) => (
              <li key={m.id} className="goal-drawer-milestone">
                <div>
                  <strong>{m.title}</strong>
                  <div className="muted small">
                    {formatShortDate(m.dueDate)} · <StatusChip status={m.status} />
                  </div>
                </div>
                <button type="button" className="lpms-btn ghost sm" onClick={() => setMsModal({ ...m })}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="goal-drawer-section">
          <div className="goal-drawer-section-head">
            <h3>Brainstorm</h3>
            <button type="button" className="lpms-btn sm primary" onClick={() => setNoteModal({})}>
              + Note
            </button>
          </div>
          {notes.length === 0 && <EmptyState title="No notes" hint="Capture ideas in context." />}
          <ul className="goal-drawer-notes">
            {notes.map((n) => (
              <li key={n.id} className="goal-drawer-note">
                <div className="goal-drawer-note-head">
                  <strong>{n.title}</strong>
                  <span className="muted small">{formatShortDate(n.createdAt?.slice(0, 10))}</span>
                </div>
                <p className="goal-drawer-note-body">{n.body || '—'}</p>
                <div className="goal-drawer-note-actions">
                  <button type="button" className="lpms-btn ghost sm" onClick={() => setNoteModal({ ...n })}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="lpms-btn ghost sm danger"
                    onClick={() => updateProject(p.id, (proj) => M.deleteBrainstorm(proj, n.id))}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Drawer>

      {taskModal !== null && (
        <TaskFormModal
          project={p}
          goalId={goal.id}
          initial={taskModal}
          onClose={() => setTaskModal(null)}
          onSave={(draft) => {
            if (taskModal.id) updateProject(p.id, (proj) => M.updateTask(proj, taskModal.id, draft))
            else updateProject(p.id, (proj) => M.addTask(proj, { ...draft, goalId: goal.id }))
            setTaskModal(null)
          }}
        />
      )}
      {msModal !== null && (
        <MilestoneFormModal
          project={p}
          goalId={goal.id}
          initial={msModal}
          onClose={() => setMsModal(null)}
          onSave={(draft) => {
            if (msModal.id) updateProject(p.id, (proj) => M.updateMilestone(proj, msModal.id, draft))
            else updateProject(p.id, (proj) => M.addMilestone(proj, { ...draft, goalId: goal.id }))
            setMsModal(null)
          }}
        />
      )}
      {noteModal !== null && (
        <NoteFormModal
          goalId={goal.id}
          initial={noteModal}
          onClose={() => setNoteModal(null)}
          onSave={(draft) => {
            if (noteModal.id) updateProject(p.id, (proj) => M.updateBrainstorm(proj, noteModal.id, draft))
            else updateProject(p.id, (proj) => M.addBrainstorm(proj, { ...draft, goalId: goal.id }))
            setNoteModal(null)
          }}
        />
      )}
    </>
  )
}

function TaskFormModal({ project, goalId, initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate || '')
  const [status, setStatus] = useState(initial.status || 'In Progress')
  const [priority, setPriority] = useState(initial.priority || 'Medium')
  const [isNextAction, setIsNextAction] = useState(!!initial.isNextAction)
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const phases = project.phases || []

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
                goalId,
                title,
                description,
                dueDate,
                status,
                priority,
                isNextAction,
                phaseId: phaseId || null,
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
        Mark as next action
      </label>
    </Modal>
  )
}

function MilestoneFormModal({ project, goalId, initial, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate || '')
  const [status, setStatus] = useState(initial.status || 'Not Started')
  const [phaseId, setPhaseId] = useState(initial.phaseId || '')
  const phases = project.phases || []

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
            onClick={() => onSave({ goalId, title, description, dueDate, status, phaseId: phaseId || null })}
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
      <div className="lpms-field-row">
        <div className="lpms-field">
          <label className="lpms-label">Due date</label>
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

function NoteFormModal({ goalId, initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial.title || '')
  const [body, setBody] = useState(initial.body || '')

  return (
    <Modal
      title={initial.id ? 'Edit note' : 'New note'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lpms-btn primary" onClick={() => onSave({ goalId, title, body })}>
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
        <label className="lpms-label">Body</label>
        <textarea className="lpms-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
      </div>
    </Modal>
  )
}
