import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { EmptyState } from '../components/ui/EmptyState'
import { parseISODate, formatShortDate } from '../utils/dates'
import { timelineEvents } from '../utils/projectStats'

export function Timeline() {
  const { activeProject } = useAppState()

  const grouped = useMemo(() => {
    if (!activeProject) return []
    const ev = timelineEvents(activeProject)
    const map = new Map()
    for (const e of ev) {
      const key = e.date || 'TBD'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return [...map.entries()].sort((a, b) => {
      const da = parseISODate(a[0])?.getTime() ?? 9e15
      const db = parseISODate(b[0])?.getTime() ?? 9e15
      return da - db
    })
  }, [activeProject])

  if (!activeProject) {
    return (
      <div className="lpms-page">
        <EmptyState title="Select a project" action={<Link to="/projects" className="lpms-btn primary">Projects</Link>} />
      </div>
    )
  }

  return (
    <div className="lpms-page">
      <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.65rem', fontWeight: 800 }}>Timeline</h1>
      <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)' }}>
        Deadlines and milestones for <strong style={{ color: 'var(--text)' }}>{activeProject.name}</strong>.
      </p>

      <div className="lpms-card">
        <div className="lpms-card-body" style={{ padding: '1.5rem' }}>
          {grouped.length === 0 && <EmptyState title="No dated items" hint="Add milestones, task due dates, or goal targets." />}
          <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
            <div
              style={{
                position: 'absolute',
                left: 6,
                top: 4,
                bottom: 4,
                width: 2,
                background: 'linear-gradient(180deg, var(--accent), var(--indigo))',
                opacity: 0.45,
                borderRadius: 2,
              }}
            />
            {grouped.map(([date, items]) => (
              <div key={date} style={{ marginBottom: '1.75rem', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.15rem',
                    top: 6,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--accent)',
                    boxShadow: '0 0 12px rgba(94, 234, 212, 0.25)',
                  }}
                />
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.65rem' }}>
                  {date === 'TBD' ? 'Undated' : formatShortDate(date)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {items.map((e) => (
                    <div key={`${e.kind}-${e.id}`} className="kpi-tile" style={{ minHeight: 'auto', padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{e.title}</div>
                          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{e.kind}</div>
                        </div>
                        {e.status && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{e.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
