import { createId } from './model'
import { SCHEMA_VERSION } from './constants'

/** @param {string} name @param {number} order @param {'Not Started'|'In Progress'|'Complete'} status */
function ph(name, order, status, description = '') {
  return { id: createId('ph'), name, description, order, status }
}

function goal(title, fields = {}) {
  return {
    id: createId('g'),
    title,
    description: fields.description ?? '',
    status: fields.status ?? 'In Progress',
    priority: fields.priority ?? 'Medium',
    phaseId: fields.phaseId ?? null,
    startDate: fields.startDate ?? '',
    targetDate: fields.targetDate ?? '',
    tags: fields.tags ?? [],
  }
}

function task(title, goalId, fields = {}) {
  return {
    id: createId('t'),
    goalId,
    phaseId: fields.phaseId ?? null,
    title,
    description: fields.description ?? '',
    status: fields.status ?? 'In Progress',
    priority: fields.priority ?? 'Medium',
    dueDate: fields.dueDate ?? '',
    completed: !!fields.completed,
    completedAt: fields.completed ? new Date().toISOString() : '',
    isNextAction: !!fields.isNextAction,
    order: fields.order ?? 0,
  }
}

function milestone(title, goalId, fields = {}) {
  return {
    id: createId('m'),
    goalId,
    phaseId: fields.phaseId ?? null,
    title,
    description: fields.description ?? '',
    status: fields.status ?? 'Not Started',
    dueDate: fields.dueDate ?? '',
  }
}

function note(title, goalId, body) {
  const now = new Date().toISOString()
  return {
    id: createId('n'),
    goalId,
    title,
    body,
    createdAt: now,
    updatedAt: now,
  }
}

function blocker(title, fields = {}) {
  return {
    id: createId('b'),
    title,
    description: fields.description ?? '',
    severity: fields.severity ?? 'Medium',
    owner: fields.owner ?? '',
    status: fields.status ?? 'Open',
    createdAt: fields.createdAt ?? new Date().toISOString().slice(0, 10),
    resolvedAt: fields.resolvedAt ?? '',
    goalId: fields.goalId ?? null,
  }
}


function projectShell(base) {
  return {
    schemaVersion: SCHEMA_VERSION,
    archived: false,
    progressPercent: 0,
    phases: [],
    goals: [],
    tasks: [],
    milestones: [],
    brainstorm: [],
    blockers: [],
    ...base,
  }
}

function legionOperator() {
  const phases = [
    ph('Planning', 0, 'Complete'),
    ph('UI', 1, 'In Progress'),
    ph('Backend', 2, 'Not Started'),
    ph('Testing', 3, 'Not Started'),
    ph('Deployment', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Ship operator command shell', {
      description: 'Primary surfaces for live ops: KPI strip, incident tables, workspace scope.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P.UI,
      targetDate: '2026-04-22',
      tags: ['LCI', 'UX'],
    }),
    goal('Wire active release telemetry', {
      description: 'Backend contracts + polling/stream for what operators see as “truth”.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P.Backend,
      targetDate: '2026-05-05',
      tags: ['API'],
    }),
    goal('TV / wall-display readiness', {
      description: 'Typography, density presets, and motion tuned for 4K wall boards.',
      status: 'Not Started',
      priority: 'Medium',
      phaseId: P.UI,
      targetDate: '2026-05-12',
      tags: ['TV'],
    }),
  ]
  const [gShell, gTelemetry, gTv] = goals

  const tasks = [
    task('Build KPI cards for release health', gShell.id, {
      isNextAction: true,
      priority: 'High',
      phaseId: P.UI,
      dueDate: '2026-04-12',
    }),
    task('Clean incident queue tables', gShell.id, {
      priority: 'High',
      phaseId: P.UI,
      dueDate: '2026-04-14',
    }),
    task('Workspace filtering + saved views', gShell.id, {
      isNextAction: true,
      phaseId: P.UI,
      dueDate: '2026-04-18',
    }),
    task('Dark theme polish pass', gShell.id, {
      completed: true,
      phaseId: P.UI,
    }),
    task('Define release snapshot API contract', gTelemetry.id, {
      phaseId: P.Backend,
      dueDate: '2026-04-25',
    }),
    task('Stub integration against staging cluster', gTelemetry.id, {
      phaseId: P.Backend,
      dueDate: '2026-05-02',
    }),
    task('Document failure modes for stale data', gTelemetry.id, {
      phaseId: P.Backend,
    }),
    task('4K type ramp + safe zones', gTv.id, {
      phaseId: P.UI,
      dueDate: '2026-05-08',
    }),
  ]

  const milestones = [
    milestone('MVP readiness review', gShell.id, {
      dueDate: '2026-05-01',
      status: 'In Progress',
      phaseId: P.Testing,
    }),
    milestone('Production pilot window', gTelemetry.id, {
      dueDate: '2026-05-15',
      status: 'Not Started',
      phaseId: P.Deployment,
    }),
  ]

  const brainstorm = [
    note('Card taxonomy', gShell.id, 'Health / deploy / incidents / queue depth — keep 4 families max.'),
    note('Filter UX', gShell.id, 'Remember last workspace; quick reset chip on hero.'),
    note('Telemetry', gTelemetry.id, 'Consider websocket for heartbeat; REST fallback required.'),
    note('Wall mode', gTv.id, 'Hide chrome entirely; burn-in safe palette toggle.'),
  ]

  const blockers = [
    blocker('Staging data parity with production', {
      description: 'Need representative volume to validate table perf.',
      severity: 'Medium',
      owner: 'Platform',
      goalId: gTelemetry.id,
    }),
  ]

  return projectShell({
    id: 'proj_legion_operator',
    name: 'Legion Operator MVP',
    type: 'Product / Software',
    owner: 'Ops Lead',
    description:
      'Legion command interface for operators: live visibility, workspace filtering, and wall-ready layouts.',
    status: 'On Track',
    priority: 'High',
    targetDate: '2026-05-15',
    startDate: '2026-01-10',
    currentPhaseId: P.UI,
    accentColor: '#5eead4',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm,
    blockers,
  })
}

function legionEngineering() {
  const phases = [
    ph('Foundation', 0, 'Complete'),
    ph('Tooling', 1, 'In Progress'),
    ph('Integrations', 2, 'Not Started'),
    ph('Hardening', 3, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Unified engineering standards', {
      description: 'Branching, reviews, and release notes everyone follows.',
      status: 'On Track',
      priority: 'Medium',
      phaseId: P.Foundation,
      targetDate: '2026-04-30',
      tags: ['LCE', 'process'],
    }),
    goal('CI golden paths', {
      description: 'Templates for services, libs, and LPMS-style frontends.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P.Tooling,
      targetDate: '2026-05-18',
      tags: ['CI'],
    }),
    goal('Observability baseline', {
      description: 'Tracing + structured logs + SLO stubs for new services.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P.Integrations,
      targetDate: '2026-06-05',
      tags: ['o11y'],
    }),
  ]
  const [gStd, gCi, gObs] = goals

  const tasks = [
    task('Document branching model', gStd.id, { completed: true, phaseId: P.Foundation }),
    task('Publish PR checklist in repo template', gStd.id, { phaseId: P.Foundation, dueDate: '2026-04-28' }),
    task('CI template for Node services', gCi.id, {
      isNextAction: true,
      phaseId: P.Tooling,
      dueDate: '2026-04-16',
    }),
    task('CI template for Vite/React apps', gCi.id, { phaseId: P.Tooling, dueDate: '2026-04-20' }),
    task('Runbook index + ownership tags', gCi.id, { phaseId: P.Tooling }),
    task('OpenTelemetry bootstrap snippet', gObs.id, {
      isNextAction: true,
      phaseId: P.Integrations,
      dueDate: '2026-05-01',
    }),
    task('Error budget policy draft', gObs.id, { phaseId: P.Hardening }),
  ]

  const milestones = [
    milestone('Tooling freeze', gCi.id, { dueDate: '2026-05-15', status: 'On Track', phaseId: P.Tooling }),
    milestone('Observability pilot service', gObs.id, { dueDate: '2026-05-30', status: 'Not Started', phaseId: P.Integrations }),
  ]

  const brainstorm = [
    note('Templates', gCi.id, 'Start with LPMS as the reference Vite app in docs.'),
    note('SLOs', gObs.id, 'Pick 3 golden signals before dashboards multiply.'),
  ]

  return projectShell({
    id: 'proj_legion_engineering',
    name: 'Legion Engineering Workspace',
    type: 'Operations',
    owner: 'Engineering',
    description: 'Shared delivery discipline: CI, observability, and operational clarity for Legion software.',
    status: 'In Progress',
    priority: 'Medium',
    targetDate: '2026-06-30',
    startDate: '2025-11-01',
    currentPhaseId: P.Tooling,
    accentColor: '#818cf8',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm,
    blockers: [],
  })
}

function companySetup() {
  const phases = [
    ph('Formation', 0, 'Complete'),
    ph('Banking', 1, 'Complete'),
    ph('Insurance', 2, 'In Progress'),
    ph('Branding', 3, 'Not Started'),
    ph('Operations', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Entity formation closed', {
      description: 'LLC, EIN, and registered agent sorted.',
      status: 'Complete',
      priority: 'Critical',
      phaseId: P.Formation,
      targetDate: '2026-03-15',
    }),
    goal('Treasury online', {
      description: 'Operating account + card + basic policies.',
      status: 'On Track',
      priority: 'High',
      phaseId: P.Banking,
      targetDate: '2026-04-10',
    }),
    goal('Risk transfer in place', {
      description: 'GL + key rider coverage bound.',
      status: 'In Progress',
      priority: 'Critical',
      phaseId: P.Insurance,
      targetDate: '2026-04-28',
    }),
  ]
  const [gForm, gBank, gIns] = goals

  const tasks = [
    task('LLC articles filed', gForm.id, { completed: true, phaseId: P.Formation }),
    task('EIN received', gForm.id, { completed: true, phaseId: P.Formation }),
    task('Operating account opened', gBank.id, { completed: true, phaseId: P.Banking }),
    task('Obtain GL / liability quotes', gIns.id, {
      isNextAction: true,
      priority: 'Critical',
      phaseId: P.Insurance,
      dueDate: '2026-04-12',
    }),
    task('Website + email domain basics', gBank.id, { phaseId: P.Branding, dueDate: '2026-04-22' }),
  ]

  const milestones = [
    milestone('LLC filed', gForm.id, { dueDate: '2026-03-01', status: 'Complete', phaseId: P.Formation }),
    milestone('Bank live', gBank.id, { dueDate: '2026-03-20', status: 'Complete', phaseId: P.Banking }),
    milestone('Insurance bound', gIns.id, { dueDate: '2026-04-28', status: 'Not Started', phaseId: P.Insurance }),
  ]

  const brainstorm = [
    note('Carriers', gIns.id, 'Compare three quotes; watch cyber sub-limits.'),
  ]

  const blockers = [
    blocker('Carrier clarification on coverage limits', {
      severity: 'High',
      owner: 'Legal',
      goalId: gIns.id,
    }),
  ]

  return projectShell({
    id: 'proj_company_setup',
    name: 'Company Setup',
    type: 'Company Setup',
    owner: 'Founder',
    description: 'Formation through banking, insurance, and launch-ready operations.',
    status: 'Needs Focus',
    priority: 'Critical',
    targetDate: '2026-04-30',
    startDate: '2026-02-01',
    currentPhaseId: P.Insurance,
    accentColor: '#fbbf24',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm,
    blockers,
  })
}

function certifications() {
  const phases = [
    ph('Research', 0, 'Complete'),
    ph('Enrolled', 1, 'Complete'),
    ph('In Progress', 2, 'In Progress'),
    ph('Practice', 3, 'Not Started'),
    ph('Scheduled', 4, 'Not Started'),
    ph('Passed', 5, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Complete coursework', {
      description: 'All vendor modules + notes bank.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P['In Progress'],
      targetDate: '2026-05-08',
    }),
    goal('Exam readiness', {
      description: 'Practice tests above passing threshold twice in a row.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P.Practice,
      targetDate: '2026-05-25',
    }),
    goal('Pass certification', {
      description: 'Schedule, sit, and close loop with employer.',
      status: 'Not Started',
      priority: 'Critical',
      phaseId: P.Passed,
      targetDate: '2026-06-20',
    }),
  ]
  const [gCourse, gReady, gPass] = goals

  const tasks = [
    task('Finish modules 4–6', gCourse.id, {
      isNextAction: true,
      priority: 'High',
      phaseId: P['In Progress'],
      dueDate: '2026-04-14',
    }),
    task('Build 100-flashcard deck', gCourse.id, { phaseId: P['In Progress'] }),
    task('Schedule practice exams', gReady.id, { phaseId: P.Practice, dueDate: '2026-05-05' }),
    task('Book exam slot', gPass.id, { phaseId: P.Scheduled, dueDate: '2026-05-18' }),
  ]

  const milestones = [
    milestone('Modules complete', gCourse.id, { dueDate: '2026-05-10', status: 'In Progress', phaseId: P['In Progress'] }),
    milestone('Exam day', gPass.id, { dueDate: '2026-06-15', status: 'Not Started', phaseId: P.Scheduled }),
  ]

  const brainstorm = [
    note('Study cadence', gCourse.id, '90m deep blocks, 2x weekdays + Sunday morning.'),
  ]

  return projectShell({
    id: 'proj_certs',
    name: 'Certifications Roadmap',
    type: 'Certification / Learning',
    owner: 'You',
    description: 'Structured certification path from enrollment to pass.',
    status: 'On Track',
    priority: 'High',
    targetDate: '2026-07-01',
    startDate: '2026-01-15',
    currentPhaseId: P['In Progress'],
    accentColor: '#34d399',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm,
    blockers: [],
  })
}

function proposalSystem() {
  const phases = [
    ph('Discovery', 0, 'Complete'),
    ph('Draft', 1, 'In Progress'),
    ph('Review', 2, 'Not Started'),
    ph('Award', 3, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Composable section library', {
      description: 'Reusable blocks with metadata for approvals.',
      status: 'In Progress',
      priority: 'Medium',
      phaseId: P.Draft,
      targetDate: '2026-05-10',
    }),
    goal('Client-ready exports', {
      description: 'PDF + share link with version pinning.',
      status: 'Not Started',
      priority: 'Medium',
      phaseId: P.Review,
      targetDate: '2026-06-15',
    }),
  ]
  const [gLib, gExport] = goals

  const tasks = [
    task('Define section schema', gLib.id, { completed: true, phaseId: P.Discovery }),
    task('Editor UX for blocks', gLib.id, { isNextAction: true, phaseId: P.Draft, dueDate: '2026-04-20' }),
    task('Version history stub', gLib.id, { phaseId: P.Draft }),
    task('PDF layout grid', gExport.id, { phaseId: P.Review, dueDate: '2026-06-01' }),
  ]

  const milestones = [
    milestone('Internal alpha', gLib.id, { dueDate: '2026-05-20', status: 'Not Started', phaseId: P.Review }),
  ]

  const brainstorm = [
    note('Sections', gLib.id, 'Start with pricing, scope, assumptions, timeline, bios.'),
  ]

  const blockers = [
    blocker('Legal review of boilerplate delayed', { severity: 'Medium', owner: 'Legal', goalId: gExport.id }),
  ]

  return projectShell({
    id: 'proj_proposal',
    name: 'Proposal System v1',
    type: 'Product / Software',
    owner: 'Solutions',
    description: 'Internal proposal builder with reusable sections and approvals.',
    status: 'In Progress',
    priority: 'Medium',
    targetDate: '2026-08-01',
    startDate: '2026-03-01',
    currentPhaseId: P.Draft,
    accentColor: '#f472b6',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm,
    blockers,
  })
}

function softwareStack() {
  const phases = [
    ph('Inventory', 0, 'Complete'),
    ph('Adopt', 1, 'In Progress'),
    ph('Integrate', 2, 'Not Started'),
    ph('Govern', 3, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Document golden paths', {
      description: 'What we build new services with by default.',
      status: 'In Progress',
      priority: 'High',
      phaseId: P.Adopt,
      targetDate: '2026-06-01',
    }),
    goal('Sunset legacy packages', {
      description: 'Track debt and cutovers with owners.',
      status: 'Not Started',
      priority: 'Medium',
      phaseId: P.Govern,
      targetDate: '2026-09-30',
    }),
  ]
  const [gGolden, gSunset] = goals

  const tasks = [
    task('Audit current dependencies', gGolden.id, { completed: true, phaseId: P.Inventory }),
    task('Approve React + Node baseline', gGolden.id, {
      isNextAction: true,
      phaseId: P.Adopt,
      dueDate: '2026-04-30',
    }),
    task('LPMS as internal pilot app', gGolden.id, { isNextAction: true, phaseId: P.Adopt, dueDate: '2026-05-05' }),
    task('Deprecation policy draft', gSunset.id, { phaseId: P.Govern }),
  ]

  const milestones = [
    milestone('Stack decision memo', gGolden.id, { dueDate: '2026-04-30', status: 'In Progress', phaseId: P.Adopt }),
  ]

  const brainstorm = [
    note('Pilot criteria', gGolden.id, 'Must dogfood local-first + export story.'),
  ]

  return projectShell({
    id: 'proj_stack',
    name: 'Software Stack Roadmap',
    type: 'General',
    owner: 'CTO',
    description: 'Canonical stack choices and migration waves.',
    status: 'On Track',
    priority: 'High',
    targetDate: '2026-12-31',
    startDate: '2026-01-01',
    currentPhaseId: P.Adopt,
    accentColor: '#38bdf8',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm,
    blockers: [],
  })
}

export function getSeedProjects() {
  return [
    legionOperator(),
    legionEngineering(),
    companySetup(),
    certifications(),
    proposalSystem(),
    softwareStack(),
  ]
}
