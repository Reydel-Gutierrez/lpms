import { useState } from 'react'
import { useAppState } from '../context/AppStateContext'
import { PROJECT_TYPES, STATUSES, PRIORITIES } from '../data/constants'
import { StatusChip } from '../components/ui/StatusChip'
import { PriorityChip } from '../components/ui/PriorityChip'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { formatShortDate } from '../utils/dates'
import { taskStats, blockerCount } from '../utils/projectStats'

export function Projects() {
  const { projects, activeProjectId, setActiveProjectId, updateProject, addProject, removeProject, archiveProject } = useAppState()
  const [modal, setModal] = useState(null)

  const visible = projects.filter((p) => !p.archived)
  const archived = projects.filter((p) => p.archived)

  return (
    <div className="lpms-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: '40rem' }}>
            Manage workspaces, switch the active mission, and tune metadata. The rail mirrors this list.
          </p>
        </div>
        <button type="button" className="lpms-btn primary" onClick={() => setModal({ mode: 'new' })}>
          + New project
        </button>
      </div>

      {visible.length === 0 && (
        <EmptyState title="No projects" hint="Create a workspace to begin tracking execution." action={<button className="lpms-btn primary" type="button" onClick={() => setModal({ mode: 'new' })}>Create project</button>} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {visible.map((p) => {
          const { completed, total } = taskStats(p)
          const bc = blockerCount(p)
          return (
            <div
              key={p.id}
              className="lpms-card"
              style={{
                borderColor: p.id === activeProjectId ? 'rgba(94, 234, 212, 0.35)' : undefined,
                boxShadow: p.id === activeProjectId ? '0 0 0 1px rgba(94, 234, 212, 0.2)' : undefined,
              }}
            >
              <div className="lpms-card-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'stretch', marginBottom: '0.75rem' }}>
                  <span style={{ width: 5, borderRadius: 3, background: p.accentColor || 'var(--accent)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{p.name}</h2>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.description || '—'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <StatusChip status={p.status} />
                  <PriorityChip priority={p.priority} />
                  <span className="chip chip-status-not-started" style={{ textTransform: 'none', letterSpacing: '0.02em' }}>
                    {p.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Target {formatShortDate(p.targetDate)} · {completed}/{total} tasks
                  {bc ? ` · ${bc} open blocker${bc > 1 ? 's' : ''}` : ''}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button type="button" className="lpms-btn sm primary" onClick={() => setActiveProjectId(p.id)}>
                    {p.id === activeProjectId ? 'Active' : 'Set active'}
                  </button>
                  <button type="button" className="lpms-btn sm" onClick={() => setModal({ mode: 'edit', project: p })}>
                    Edit
                  </button>
                  <button type="button" className="lpms-btn sm" onClick={() => archiveProject(p.id)}>
                    Archive
                  </button>
                  <button
                    type="button"
                    className="lpms-btn sm danger"
                    onClick={() => {
                      if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) removeProject(p.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {archived.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Archived</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0' }}>
            {archived.map((p) => (
              <li key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
                <button type="button" className="lpms-btn sm" onClick={() => updateProject(p.id, { archived: false })}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modal && <ProjectModal modal={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

function ProjectModal({ modal, onClose }) {
  const { addProject, updateProject } = useAppState()
  const isNew = modal.mode === 'new'
  const proj = modal.project

  const [name, setName] = useState(proj?.name || '')
  const [type, setType] = useState(proj?.type || 'General')
  const [owner, setOwner] = useState(proj?.owner || '')
  const [description, setDescription] = useState(proj?.description || '')
  const [status, setStatus] = useState(proj?.status || 'Not Started')
  const [priority, setPriority] = useState(proj?.priority || 'Medium')
  const [targetDate, setTargetDate] = useState(proj?.targetDate || '')
  const [startDate, setStartDate] = useState(proj?.startDate || '')
  const [accentColor, setAccentColor] = useState(proj?.accentColor || '#5eead4')
  const [progressPercent, setProgressPercent] = useState(proj?.progressPercent ?? 0)

  const save = () => {
    const payload = {
      name,
      type,
      owner,
      description,
      status,
      priority,
      targetDate,
      startDate,
      accentColor,
      progressPercent: Number(progressPercent) || 0,
    }
    if (isNew) {
      addProject(payload)
    } else {
      updateProject(proj.id, payload)
    }
    onClose()
  }

  return (
    <Modal
      title={isNew ? 'New project' : 'Edit project'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lpms-btn primary" onClick={save}>
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
        <label className="lpms-label">Type</label>
        <select className="lpms-select" value={type} onChange={(e) => setType(e.target.value)}>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Owner</label>
        <input className="lpms-input" value={owner} onChange={(e) => setOwner(e.target.value)} />
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Description</label>
        <textarea className="lpms-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Start date</label>
          <input className="lpms-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Target date</label>
          <input className="lpms-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Accent</label>
          <input className="lpms-input" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ height: '40px', padding: '4px' }} />
        </div>
        <div className="lpms-field" style={{ marginBottom: 0 }}>
          <label className="lpms-label">Progress % (manual)</label>
          <input className="lpms-input" type="number" min={0} max={100} value={progressPercent} onChange={(e) => setProgressPercent(e.target.value)} />
        </div>
      </div>
      <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Task completion still auto-updates progress when tasks change; manual value fills gaps when you have no tasks yet.
      </p>
    </Modal>
  )
}
