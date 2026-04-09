export function EmptyState({ title, hint, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text)' }}>{title}</p>
      {hint && <p style={{ margin: 0, fontSize: '0.9rem' }}>{hint}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  )
}
