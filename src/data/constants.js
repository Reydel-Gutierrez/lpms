export const PROJECT_TYPES = [
  'Product / Software',
  'Company Setup',
  'Certification / Learning',
  'Licensing / Compliance',
  'Operations',
  'General',
]

export const STATUSES = [
  'Not Started',
  'In Progress',
  'On Track',
  'Needs Focus',
  'Blocked',
  'Complete',
]

export const PHASE_STATUSES = ['Not Started', 'In Progress', 'Complete']

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export const BLOCKER_SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

export const BLOCKER_STATUS = ['Open', 'Resolved']

/** Legacy key (v1 flat model) */
export const STORAGE_KEY_V1 = 'lpms_v1'

/** Current persisted state key (goal-centered v2) */
export const STORAGE_KEY = 'lpms_v2'

export const SCHEMA_VERSION = 2
