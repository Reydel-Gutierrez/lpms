import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { STATUSES, PRIORITIES } from '../data/constants'
import { StatusChip } from '../components/ui/StatusChip'
import { PriorityChip } from '../components/ui/PriorityChip'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { formatShortDate } from '../utils/dates'
import { phaseName } from '../utils/projectStats'
import * as M from '../utils/mutations'

export function Tasks() {
  const { activeProject, updateProject } = useAppState()
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('all')
  const [fPriority, setFPriority] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [modal, setModal] = useState(null)

  const filtered = useMemo(() => {
    if (!activeProject) return []
    let list = [...(activeProject.tasks || [])]
    if (!showDone) list = list.filter((t) => !t.completed)
    if (fStatus !== 'all') list = list.filter((t) => t.status === fStatus)
    if (fPriority !== 'all') list = list.filter((t) => t.priority === fPriority)
    if (q.trim()) {
      const qq = q.toLowerCase()
      list = list.filter((t) => t.title.toLowerCase().includes(qq) || (t.description || '').toLowerCase().includes(qq))
    }
    return list.sort((a, b) => {
      if (a.isNextAction !== b.isNextAction) return a.isNextAction ? -1 : 1
      return (a.dueDate || '').localeCompare(b.dueDate || '')
    })
  }, [activeProject, q, fStatus, fPriority, showDone])

  if (!activeProject) {
    return (
      <div className="lpms-page">
        <EmptyState title="Select a project" action={<Link to="/projects" className="lpms-btn primary">Projects</Link>} />
      </div>
    )
  }

  const p = activeProject

  return (
    <div className="lpms-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.65rem', fontWeight: 800 }}>Tasks</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>All work items for {p.name}.</p>
        </div>
        <button type="button" className="lpms-btn primary" onClick={() => setModal({})}>
          + Quick add
        </button>
      </div>

      <div className="lpms-card" style={{ marginBottom: '1.25rem' }}>
        <div className="lpms-card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <input className="lpms-input" style={{ minWidth: '200px', flex: '1 1 200px' }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="lpms-select" style={{ width: 'auto' }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="lpms-select" style={{ width: 'auto' }} value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
            <option value="all">All priorities</option>
            {PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            Show completed
          </label>
        </div>
      </div>

      <div className="lpms-card">
        <div className="lpms-card-body" style={{ padding: 0 }}>
          {filtered.length === 0 && <EmptyState title="No tasks" hint="Adjust filters or add a task." />}
          {filtered.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '1rem',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={(e) => updateProject(p.id, (proj) => M.updateTask(proj, t.id, { completed: e.target.checked }))}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1.02rem', textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.5 : 1 }}>
                  {t.title}
                  {t.isNextAction && (
                    <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 900 }}>NEXT</span>
                  )}
                </div>
                {t.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t.description}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  <StatusChip status={t.status} />
                  <PriorityChip priority={t.priority} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Due {formatShortDate(t.dueDate)}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{phaseName(p, t.phaseId) || 'No phase'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button type="button" className="lpms-btn sm" onClick={() => setModal({ ...t })}>
                  Edit
                </button>
                <button type="button" className="lpms-btn sm danger" onClick={() => updateProject(p.id, (proj) => M.deleteTask(proj, t.id))}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <TaskEditorModal
          initial={modal}
          phases={p.phases || []}
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

function TaskEditorModal({ initial, phases, onSave, onClose }) {
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
            onClick={() => onSave({ title, description, dueDate, status, priority, isNextAction, phaseId: phaseId || null, completed })}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Due</label>
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
          Next action
        </label>
      </div>
      <div className="lpms-field">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
          Completed
        </label>
      </div>
    </Modal>
  )
}
