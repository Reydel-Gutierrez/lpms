export function statusChipClass(status) {
  const key = (status || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return `chip chip-status-${key || 'not-started'}`
}

export function priorityChipClass(priority) {
  const key = (priority || 'medium').toLowerCase()
  return `chip chip-priority-${key}`
}
