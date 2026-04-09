import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { STATUSES } from '../data/constants'
import { StatusChip } from '../components/ui/StatusChip'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { formatShortDate } from '../utils/dates'
import * as M from '../utils/mutations'

export function GoalsPhases() {
  const { activeProject, updateProject } = useAppState()
  const [phaseName, setPhaseName] = useState('')
  const [goalModal, setGoalModal] = useState(null)
  const [msModal, setMsModal] = useState(null)

  if (!activeProject) {
    return (
      <div className="lpms-page">
        <EmptyState title="Select a project" hint="Choose a workspace from the rail." action={<Link to="/projects" className="lpms-btn primary">Projects</Link>} />
      </div>
    )
  }

  const p = activeProject
  const phases = [...(p.phases || [])].sort((a, b) => a.order - b.order)

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

  return (
    <div className="lpms-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.65rem', fontWeight: 800 }}>Goals & Phases</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Structure <strong style={{ color: 'var(--text)' }}>{p.name}</strong> — phases, goals, and milestones in one place.
        </p>
      </div>

      <div className="lpms-card" style={{ marginBottom: '1.5rem' }}>
        <div className="lpms-card-header">
          <h3 className="lpms-card-title">Phases</h3>
        </div>
        <div className="lpms-card-body">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="lpms-input" style={{ maxWidth: '280px' }} placeholder="New phase name" value={phaseName} onChange={(e) => setPhaseName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPhase()} />
            <button type="button" className="lpms-btn primary" onClick={addPhase}>
              Add phase
            </button>
          </div>
          {phases.length === 0 && <EmptyState title="No phases yet" hint="Add phases that match your project type (e.g. Build, Testing, or Enrolled, Passed)." />}
          {phases.map((ph, i) => {
            const tasksInPhase = (p.tasks || []).filter((t) => t.phaseId === ph.id)
            const done = tasksInPhase.filter((t) => t.completed).length
            const pct = tasksInPhase.length ? Math.round((done / tasksInPhase.length) * 100) : ph.completed ? 100 : 0
            return (
              <div key={ph.id} className="lpms-card" style={{ marginBottom: '0.75rem', boxShadow: 'none' }}>
                <div className="lpms-card-body" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{ph.name}</strong>
                      {ph.isCurrent && <StatusChip status="In Progress" />}
                      {ph.completed && <StatusChip status="Complete" />}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <button type="button" className="lpms-btn sm" onClick={() => move(i, -1)} disabled={i === 0}>
                        Up
                      </button>
                      <button type="button" className="lpms-btn sm" onClick={() => move(i, 1)} disabled={i === phases.length - 1}>
                        Down
                      </button>
                      <button type="button" className="lpms-btn sm primary" onClick={() => updateProject(p.id, (proj) => M.setCurrentPhase(proj, ph.id))}>
                        Set current
                      </button>
                      <button type="button" className="lpms-btn sm" onClick={() => updateProject(p.id, (proj) => M.updatePhase(proj, ph.id, { completed: !ph.completed }))}>
                        Toggle complete
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
                  <div style={{ marginTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Phase task progress</div>
                    <div className="progress-bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {done}/{tasksInPhase.length} tasks in phase
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="goals-phases-grid">
        <div className="lpms-card">
          <div className="lpms-card-header">
            <h3 className="lpms-card-title">Goals</h3>
            <button type="button" className="lpms-btn sm primary" onClick={() => setGoalModal({})}>
              + Goal
            </button>
          </div>
          <div className="lpms-card-body">
            {(p.goals || []).length === 0 && <EmptyState title="No goals" />}
            {(p.goals || []).map((g) => (
              <div key={g.id} style={{ padding: '0.65rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{g.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <StatusChip status={g.status} /> · Target {formatShortDate(g.targetDate)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" className="lpms-btn ghost sm" onClick={() => setGoalModal({ ...g })}>
                    Edit
                  </button>
                  <button type="button" className="lpms-btn ghost sm danger" onClick={() => updateProject(p.id, (proj) => M.deleteGoal(proj, g.id))}>
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lpms-card">
          <div className="lpms-card-header">
            <h3 className="lpms-card-title">Milestones</h3>
            <button type="button" className="lpms-btn sm primary" onClick={() => setMsModal({})}>
              + Milestone
            </button>
          </div>
          <div className="lpms-card-body">
            {(p.milestones || []).length === 0 && <EmptyState title="No milestones" />}
            {[...(p.milestones || [])]
              .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
              .map((m) => (
                <div key={m.id} style={{ padding: '0.65rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatShortDate(m.dueDate)} · <StatusChip status={m.status} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button type="button" className="lpms-btn ghost sm" onClick={() => setMsModal({ ...m })}>
                      Edit
                    </button>
                    <button type="button" className="lpms-btn ghost sm danger" onClick={() => updateProject(p.id, (proj) => M.deleteMilestone(proj, m.id))}>
                      Del
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {goalModal && (
        <GoalQuickModal
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
        <MsQuickModal
          initial={msModal}
          phases={phases}
          onClose={() => setMsModal(null)}
          onSave={(draft) => {
            if (msModal.id) updateProject(p.id, (proj) => M.updateMilestone(proj, msModal.id, draft))
            else updateProject(p.id, (proj) => M.addMilestone(proj, draft))
            setMsModal(null)
          }}
        />
      )}
    </div>
  )
}

function GoalQuickModal({ initial, phases, onSave, onClose }) {
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
        <label className="lpms-label">Progress %</label>
        <input className="lpms-input" type="number" min={0} max={100} value={progressPercent} onChange={(e) => setProgressPercent(e.target.value)} />
      </div>
    </Modal>
  )
}

function MsQuickModal({ initial, phases, onSave, onClose }) {
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
