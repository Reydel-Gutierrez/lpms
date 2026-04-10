import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { STATUSES, PRIORITIES, BLOCKER_SEVERITIES } from '../data/constants'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { GoalDetailDrawer } from '../components/goals/GoalDetailDrawer'
import { projectExecutionStats } from '../utils/deriveStats'
import * as M from '../utils/mutations'
import {
  MissionHero,
  GoalsExecutionGrid,
  DoNextPanel,
  UpcomingUrgencyPanel,
  BlockersStrip,
} from './dashboard/sections'

export function Dashboard() {
  const { activeProject, updateProject, presentationMode } = useAppState()
  const [drawerGoalId, setDrawerGoalId] = useState(null)
  const [goalModal, setGoalModal] = useState(null)
  const [blockerModal, setBlockerModal] = useState(null)
  const [taskFilterStatus, setTaskFilterStatus] = useState('all')
  const [taskFilterPriority, setTaskFilterPriority] = useState('all')

  const p = activeProject
  const stats = useMemo(() => (p ? projectExecutionStats(p) : null), [p])
  const filters = useMemo(
    () => ({ taskFilterStatus, taskFilterPriority, setTaskFilterStatus, setTaskFilterPriority }),
    [taskFilterStatus, taskFilterPriority]
  )

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

  const pres = presentationMode

  const saveGoal = (draft) => {
    if (goalModal?.id) {
      updateProject(p.id, (proj) => M.updateGoal(proj, goalModal.id, draft))
    } else {
      updateProject(p.id, (proj) => M.addGoal(proj, draft))
    }
    setGoalModal(null)
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
    <div className={`lpms-page lpms-dashboard${pres ? ' lpms-dashboard--pres' : ''}`}>
      <MissionHero project={p} stats={stats} presentation={pres} />

      <div className={`dashboard-grid${pres ? ' dashboard-grid--pres' : ''}`}>
        <div className="dashboard-col dashboard-col--main">
          <GoalsExecutionGrid
            project={p}
            onOpenGoal={setDrawerGoalId}
            onAddGoal={() => setGoalModal({})}
            presentation={pres}
            maxGoals={pres ? 5 : undefined}
          />
          {!pres && (
            <div className="dash-quick-links">
              <Link to="/goals" className="lpms-btn">
                Structure &amp; planning
              </Link>
              <Link to="/timeline" className="lpms-btn">
                Full timeline
              </Link>
            </div>
          )}
        </div>
        <div className="dashboard-col dashboard-col--side">
          <BlockersStrip project={p} updateProject={updateProject} onEditBlocker={setBlockerModal} presentation={pres} />
          <DoNextPanel project={p} updateProject={updateProject} filters={filters} presentation={pres} />
        </div>
        <div className="dashboard-span-full">
          <UpcomingUrgencyPanel project={p} presentation={pres} />
        </div>
      </div>

      {drawerGoalId && (
        <GoalDetailDrawer project={p} goalId={drawerGoalId} onClose={() => setDrawerGoalId(null)} />
      )}

      {goalModal !== null && (
        <GoalFormModal initial={goalModal} phases={p.phases || []} onSave={saveGoal} onClose={() => setGoalModal(null)} />
      )}
      {blockerModal !== null && (
        <BlockerFormModal
          initial={blockerModal}
          goals={p.goals || []}
          onSave={saveBlocker}
          onClose={() => setBlockerModal(null)}
        />
      )}
    </div>
  )
}

function GoalFormModal({ initial, phases, onSave, onClose }) {
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
        <label className="lpms-label">Tags (comma-separated)</label>
        <input className="lpms-input" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="LCI, MVP" />
      </div>
    </Modal>
  )
}

function BlockerFormModal({ initial, goals, onSave, onClose }) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [severity, setSeverity] = useState(initial.severity || 'Medium')
  const [owner, setOwner] = useState(initial.owner || '')
  const [goalId, setGoalId] = useState(initial.goalId || '')
  const [status, setStatus] = useState(initial.status || 'Open')

  return (
    <Modal
      title={initial.id ? 'Edit blocker' : 'New blocker'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="lpms-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="lpms-btn primary"
            onClick={() => onSave({ title, description, severity, owner, goalId: goalId || null, status })}
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
          <label className="lpms-label">Severity</label>
          <select className="lpms-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {BLOCKER_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="lpms-field">
          <label className="lpms-label">Owner</label>
          <input className="lpms-input" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
      </div>
      <div className="lpms-field">
        <label className="lpms-label">Related goal (optional)</label>
        <select className="lpms-select" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">—</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>
      {initial.id && (
        <div className="lpms-field">
          <label className="lpms-label">Status</label>
          <select className="lpms-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      )}
    </Modal>
  )
}
