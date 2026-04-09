export function parseISODate(s) {
  if (!s) return null
  const d = new Date(s + (s.length === 10 ? 'T12:00:00' : ''))
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatShortDate(s) {
  const d = parseISODate(s)
  if (!d) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysUntil(s) {
  const d = parseISODate(s)
  if (!d) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - now) / (24 * 60 * 60 * 1000))
}

export function isThisWeek(s) {
  const n = daysUntil(s)
  if (n === null) return false
  return n >= 0 && n <= 7
}
