import { useAppState } from '../../context/AppStateContext'
import { taskStats, blockerCount } from '../../utils/projectStats'

export function ProjectRail() {
  const { projects, activeProjectId, setActiveProjectId } = useAppState()
  const visible = projects.filter((p) => !p.archived)

  return (
    <div className="lpms-card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="lpms-card-header" style={{ padding: '0.75rem 1rem' }}>
        <h3 className="lpms-card-title" style={{ margin: 0 }}>
          Workspaces
        </h3>
      </div>
      <div className="lpms-card-body" style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
        {visible.length === 0 && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No projects yet.</p>
        )}
        {visible.map((p) => {
          const { completed, total } = taskStats(p)
          const openBlockers = blockerCount(p)
          const goalN = (p.goals || []).length
          return (
            <button
              key={p.id}
              type="button"
              className={`project-rail-item${p.id === activeProjectId ? ' active' : ''}`}
              onClick={() => setActiveProjectId(p.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              <span className="project-rail-swatch" style={{ background: p.accentColor || 'var(--accent)' }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {goalN} goals · {completed}/{total} tasks
                  {openBlockers > 0 ? ` · ${openBlockers} blocker${openBlockers > 1 ? 's' : ''}` : ''}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
