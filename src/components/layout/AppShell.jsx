import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('lpms-presentation-root', presentationMode)
    return () => document.documentElement.classList.remove('lpms-presentation-root')
  }, [presentationMode])

  useEffect(() => {
    if (!presentationMode) return
    const onKey = (e) => {
      if (e.key === 'Escape') setPresentationMode(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [presentationMode, setPresentationMode])

  const onDashboard = location.pathname === '/'

  return (
    <div className={`lpms-shell${presentationMode ? ' presentation' : ''}`}>
      <aside className="lpms-sidebar">
        <div>
          <div className="lpms-brand">
            Legion <span>LPMS</span>
          </div>
          <p className="sidebar-tagline">Project command center</p>
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
        <header className={`lpms-topbar${presentationMode ? ' lpms-topbar--pres' : ''}`}>
          {presentationMode ? (
            <>
              <div className="topbar-pres-mission">
                <span className="topbar-pres-label">Mission</span>
                <span className="topbar-pres-name">{activeProject?.name || 'Select a project'}</span>
                {!onDashboard && (
                  <span className="topbar-pres-route muted small">
                    {nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ||
                      ''}
                  </span>
                )}
              </div>
              <button type="button" className="lpms-btn primary" onClick={() => setPresentationMode(false)}>
                Exit focus mode
              </button>
            </>
          ) : (
            <>
              <div style={{ minWidth: 0 }}>
                {activeProject && <p className="topbar-eyebrow">Active mission</p>}
                <p className="topbar-title">{activeProject?.name || 'Select a project'}</p>
              </div>
              <div className="topbar-actions">
                <button
                  type="button"
                  className="lpms-btn sm"
                  onClick={() => setPresentationMode(true)}
                  title="Wall / TV command layout"
                >
                  Focus mode
                </button>
              </div>
            </>
          )}
        </header>
        <Outlet />
      </div>
      {presentationMode && (
        <button
          type="button"
          className="lpms-exit-focus-fab"
          onClick={() => setPresentationMode(false)}
          title="Exit focus mode (Esc)"
        >
          Exit TV / focus mode
        </button>
      )}
    </div>
  )
}
