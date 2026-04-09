import { NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../../context/AppStateContext'
import { ProjectRail } from './ProjectRail'

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/goals', label: 'Goals & Phases' },
  { to: '/settings', label: 'Data' },
]

export function AppShell() {
  const { presentationMode, setPresentationMode, activeProject } = useAppState()

  return (
    <div className={`lpms-shell${presentationMode ? ' presentation' : ''}`}>
      <aside className="lpms-sidebar">
        <div>
          <div className="lpms-brand">
            Legion <span>LPMS</span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Project command center
          </p>
        </div>
        <nav className="lpms-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ProjectRail />
      </aside>
      <div className="lpms-main">
        <header className="lpms-topbar">
          <div style={{ minWidth: 0 }}>
            {activeProject && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Active mission
              </p>
            )}
            <p style={{ margin: '0.15rem 0 0', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeProject?.name || 'Select a project'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              className={`lpms-btn sm${presentationMode ? ' primary' : ''}`}
              onClick={() => setPresentationMode((v) => !v)}
              title="Fullscreen-style dashboard focus"
            >
              {presentationMode ? 'Exit focus' : 'Focus mode'}
            </button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
