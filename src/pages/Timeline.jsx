import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusChip } from '../components/ui/StatusChip'
import { formatShortDate } from '../utils/dates'
import { groupTimelineByUrgency } from '../utils/deriveStats'

const SECTIONS = [
  { key: 'overdue', label: 'Overdue', risk: true },
  { key: 'today', label: 'Today', risk: true },
  { key: 'week', label: 'Next 7 days', risk: false },
  { key: 'later', label: 'Upcoming', risk: false },
]

export function Timeline() {
  const { activeProject } = useAppState()
  const p = activeProject

  if (!p) {
    return (
      <div className="lpms-page">
        <EmptyState title="Select a project" action={<Link to="/projects" className="lpms-btn primary">Projects</Link>} />
      </div>
    )
  }

  const groups = groupTimelineByUrgency(p)

  return (
    <div className="lpms-page timeline-page">
      <header className="page-header-block">
        <h1>Timeline</h1>
        <p className="muted">
          What is coming up and what you might miss — for <strong className="text-bright">{p.name}</strong>.
        </p>
      </header>

      <div className="timeline-urgency-board">
        {SECTIONS.map(({ key, label, risk }) => (
          <section key={key} className={`timeline-column${risk ? ' timeline-column--risk' : ''}`}>
            <h2 className="timeline-column-title">{label}</h2>
            <div className="timeline-column-body">
              {(groups[key] || []).length === 0 && <p className="muted small">Nothing here.</p>}
              {(groups[key] || []).map((it) => (
                <article key={`${it.kind}-${it.id}`} className="timeline-card">
                  <div className="timeline-card-date">{formatShortDate(it.date)}</div>
                  <div className="timeline-card-main">
                    <h3>{it.title}</h3>
                    <p className="muted small">
                      <span className="timeline-kind">{it.kind}</span>
                      {it.goalTitle && ` · ${it.goalTitle}`}
                    </p>
                  </div>
                  {it.status && (
                    <div className="timeline-card-status">
                      <StatusChip status={it.status} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
