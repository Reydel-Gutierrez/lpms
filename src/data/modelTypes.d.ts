export interface Phase {
  id: string
  name: string
  description: string
  order: number
  status: string
}

export interface Goal {
  id: string
  title: string
  description: string
  status: string
  priority: string
  phaseId?: string | null
  startDate?: string
  targetDate?: string
  tags: string[]
}

export interface Task {
  id: string
  goalId: string | null
  phaseId?: string | null
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  completed: boolean
  completedAt?: string
  isNextAction: boolean
  order: number
}

export interface Milestone {
  id: string
  goalId: string | null
  phaseId?: string | null
  title: string
  description: string
  status: string
  dueDate?: string
}

export interface BrainstormNote {
  id: string
  goalId: string | null
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface Blocker {
  id: string
  title: string
  description: string
  severity: string
  owner?: string
  status: string
  createdAt: string
  resolvedAt?: string
  goalId?: string | null
}

export interface Project {
  id: string
  schemaVersion?: number
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
  phases: Phase[]
  goals: Goal[]
  tasks: Task[]
  milestones: Milestone[]
  brainstorm: BrainstormNote[]
  blockers: Blocker[]
}
