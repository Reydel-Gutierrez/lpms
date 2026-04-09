export interface Phase {
  id: string
  name: string
  order: number
  isCurrent: boolean
  completed?: boolean
}

export interface Goal {
  id: string
  title: string
  targetDate?: string
  status: string
  phaseId?: string | null
  progressPercent: number
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  status: string
  priority: string
  isNextAction: boolean
  phaseId?: string | null
  completed: boolean
}

export interface Milestone {
  id: string
  title: string
  dueDate?: string
  status: string
  phaseId?: string | null
  notes?: string
}

export interface Blocker {
  id: string
  title: string
  description?: string
  severity: string
  owner?: string
  createdAt: string
  resolved: boolean
}

export interface Project {
  id: string
  name: string
  type: string
  owner: string
  description: string
  status: string
  priority: string
  targetDate?: string
  startDate?: string
  currentPhaseId?: string | null
  progressPercent: number
  accentColor?: string
  archived?: boolean
  goals: Goal[]
  phases: Phase[]
  tasks: Task[]
  milestones: Milestone[]
  blockers: Blocker[]
}
