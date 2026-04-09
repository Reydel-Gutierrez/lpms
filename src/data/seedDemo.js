import { createId } from './model'

function phase(name, order, isCurrent, completed = false) {
  return {
    id: createId('ph'),
    name,
    order,
    isCurrent,
    completed,
  }
}

function goal(title, status, progressPercent, targetDate, phaseId = null) {
  return {
    id: createId('g'),
    title,
    status,
    progressPercent,
    targetDate: targetDate || '',
    phaseId,
  }
}

function task(title, opts = {}) {
  return {
    id: createId('t'),
    title,
    description: opts.description || '',
    dueDate: opts.dueDate || '',
    status: opts.status || 'In Progress',
    priority: opts.priority || 'Medium',
    isNextAction: !!opts.isNextAction,
    phaseId: opts.phaseId ?? null,
    completed: !!opts.completed,
  }
}

function milestone(title, dueDate, status, phaseId = null, notes = '') {
  return {
    id: createId('m'),
    title,
    dueDate: dueDate || '',
    status,
    phaseId,
    notes,
  }
}

function blocker(title, severity, owner, resolved = false) {
  return {
    id: createId('b'),
    title,
    description: '',
    severity,
    owner: owner || '',
    createdAt: new Date().toISOString().slice(0, 10),
    resolved,
  }
}

export function getSeedProjects() {
  /** LCI (command interface) + LCE (engineering workspace) — single mission */
  const lciLcePhases = [
    phase('Planning', 0, false, true),
    phase('Foundation', 1, false, true),
    phase('UI', 2, true, false),
    phase('Tooling', 3, false, false),
    phase('Backend', 4, false, false),
    phase('Integrations', 5, false, false),
    phase('Testing', 6, false, false),
    phase('Hardening', 7, false, false),
    phase('Deployment', 8, false, false),
  ]
  const L = Object.fromEntries(lciLcePhases.map((p) => [p.name, p.id]))

  const lciLce = {
    id: 'proj_lci_lce',
    name: 'LCI & LCE',
    type: 'Product / Software',
    owner: 'Ops & Engineering',
    description:
      'Legion Command Interface (LCI): command-center UI for live operations, workspace filtering, and TV-ready layouts. Legion Command Engineering (LCE): standards, repos, CI templates, observability, and delivery rhythm — one program.',
    status: 'On Track',
    priority: 'High',
    targetDate: '2026-06-30',
    startDate: '2025-11-01',
    currentPhaseId: lciLcePhases[2].id,
    progressPercent: 0,
    accentColor: '#5eead4',
    archived: false,
    phases: lciLcePhases,
    goals: [
      goal('Finish operator UI shell', 'In Progress', 65, '2026-04-20', L.UI),
      goal('Wire active release data', 'In Progress', 30, '2026-05-01', L.Backend),
      goal('Stabilize layout for TV displays', 'Not Started', 0, '2026-05-10', L.UI),
      goal('Unified PR checklist', 'On Track', 80, '2026-04-30', L.Tooling),
      goal('Observability baseline', 'In Progress', 40, '2026-05-20', L.Integrations),
    ],
    tasks: [
      task('Build KPI cards for release health', { isNextAction: true, priority: 'High', phaseId: L.UI }),
      task('Clean tables for incident queue', { priority: 'High', phaseId: L.UI }),
      task('Add workspace filtering', { isNextAction: true, phaseId: L.UI }),
      task('API contract for release snapshot', { phaseId: L.Backend }),
      task('Dark theme polish pass', { completed: true, phaseId: L.UI }),
      task('Document branching model', { completed: true, phaseId: L.Foundation }),
      task('CI template for new services', { isNextAction: true, phaseId: L.Tooling }),
      task('Runbook index in LPMS', { phaseId: L.Tooling }),
    ],
    milestones: [
      milestone('MVP readiness review', '2026-05-01', 'In Progress', L.Testing),
      milestone('Production pilot', '2026-05-15', 'Not Started', L.Deployment),
      milestone('Tooling freeze', '2026-05-15', 'On Track', L.Tooling),
    ],
    blockers: [blocker('Staging data parity with prod', 'Medium', 'Platform')],
  }

  const p3Phases = [
    phase('Formation', 0, false, true),
    phase('Banking', 1, false, true),
    phase('Insurance', 2, true, false),
    phase('Branding', 3, false, false),
    phase('Operations', 4, false, false),
  ]
  const p3Ids = Object.fromEntries(p3Phases.map((p) => [p.name, p.id]))

  const companySetup = {
    id: 'proj_company_setup',
    name: 'Company Setup',
    type: 'Company Setup',
    owner: 'Founder',
    description: 'Entity formation through go-live operations checklist.',
    status: 'Needs Focus',
    priority: 'Critical',
    targetDate: '2026-04-30',
    startDate: '2026-02-01',
    currentPhaseId: p3Phases[2].id,
    progressPercent: 48,
    accentColor: '#fbbf24',
    archived: false,
    phases: p3Phases,
    goals: [
      goal('Business formation complete', 'In Progress', 70, '2026-04-15', p3Ids.Formation),
      goal('Banking & treasury ready', 'On Track', 90, '2026-04-10', p3Ids.Banking),
      goal('Insurance coverage in place', 'In Progress', 35, '2026-04-25', p3Ids.Insurance),
    ],
    tasks: [
      task('LLC articles filed', { completed: true, phaseId: p3Ids.Formation }),
      task('EIN received', { completed: true, phaseId: p3Ids.Formation }),
      task('Open operating account', { completed: true, phaseId: p3Ids.Banking }),
      task('Obtain GL / liability quotes', { isNextAction: true, priority: 'Critical', phaseId: p3Ids.Insurance }),
      task('Website basics + email domain', { phaseId: p3Ids.Branding }),
    ],
    milestones: [
      milestone('LLC filed', '2026-03-01', 'Complete', p3Ids.Formation),
      milestone('EIN received', '2026-03-08', 'Complete', p3Ids.Formation),
      milestone('Bank account opened', '2026-03-20', 'Complete', p3Ids.Banking),
      milestone('Insurance bound', '2026-04-28', 'Not Started', p3Ids.Insurance),
    ],
    blockers: [
      blocker('Waiting on carrier clarification for coverage limits', 'High', 'Legal', false),
    ],
  }

  const p4Phases = [
    phase('Research', 0, false, true),
    phase('Enrolled', 1, false, true),
    phase('In Progress', 2, true, false),
    phase('Practice', 3, false, false),
    phase('Scheduled', 4, false, false),
    phase('Passed', 5, false, false),
  ]
  const p4Ids = Object.fromEntries(p4Phases.map((p) => [p.name, p.id]))

  const certs = {
    id: 'proj_certs',
    name: 'Certifications Roadmap',
    type: 'Certification / Learning',
    owner: 'You',
    description: 'Structured path from enrollment through exam pass.',
    status: 'On Track',
    priority: 'High',
    targetDate: '2026-07-01',
    startDate: '2026-01-15',
    currentPhaseId: p4Phases[2].id,
    progressPercent: 38,
    accentColor: '#34d399',
    archived: false,
    phases: p4Phases,
    goals: [
      goal('Finish DDC modules', 'In Progress', 55, '2026-05-01', p4Ids['In Progress']),
      goal('Networking deep dive', 'In Progress', 25, '2026-05-15', p4Ids.Practice),
      goal('Pass certification exam', 'Not Started', 0, '2026-06-20', p4Ids.Passed),
    ],
    tasks: [
      task('Complete module 4–6', { isNextAction: true, priority: 'High', phaseId: p4Ids['In Progress'] }),
      task('Schedule practice exams', { phaseId: p4Ids.Practice }),
      task('Book exam slot', { phaseId: p4Ids.Scheduled }),
    ],
    milestones: [
      milestone('All modules complete', '2026-05-10', 'In Progress', p4Ids['In Progress']),
      milestone('Exam date', '2026-06-15', 'Not Started', p4Ids.Scheduled),
    ],
    blockers: [],
  }

  const p5Phases = [
    phase('Discovery', 0, false, true),
    phase('Draft', 1, true, false),
    phase('Review', 2, false, false),
    phase('Award', 3, false, false),
  ]
  const p5Ids = Object.fromEntries(p5Phases.map((p) => [p.name, p.id]))

  const proposal = {
    id: 'proj_proposal',
    name: 'Proposal System v1',
    type: 'Product / Software',
    owner: 'Solutions',
    description: 'Internal proposal builder with reusable sections and approvals.',
    status: 'In Progress',
    priority: 'Medium',
    targetDate: '2026-08-01',
    startDate: '2026-03-01',
    currentPhaseId: p5Phases[1].id,
    progressPercent: 22,
    accentColor: '#f472b6',
    archived: false,
    phases: p5Phases,
    goals: [
      goal('Section library v1', 'In Progress', 40, '2026-05-01', p5Ids.Draft),
      goal('Export to PDF', 'Not Started', 0, '2026-06-01', p5Ids.Review),
    ],
    tasks: [
      task('Define section schema', { completed: true, phaseId: p5Ids.Discovery }),
      task('Editor UX for blocks', { isNextAction: true, phaseId: p5Ids.Draft }),
      task('Version history stub', { phaseId: p5Ids.Draft }),
    ],
    milestones: [
      milestone('Internal alpha', '2026-05-20', 'Not Started', p5Ids.Review),
    ],
    blockers: [
      blocker('Legal review of boilerplate delayed', 'Medium', 'Legal', false),
    ],
  }

  const p6Phases = [
    phase('Inventory', 0, false, true),
    phase('Adopt', 1, true, false),
    phase('Integrate', 2, false, false),
    phase('Govern', 3, false, false),
  ]
  const p6Ids = Object.fromEntries(p6Phases.map((p) => [p.name, p.id]))

  const stackRoadmap = {
    id: 'proj_stack',
    name: 'Software Stack Roadmap',
    type: 'General',
    owner: 'CTO',
    description: 'Canonical stack decisions and migration waves.',
    status: 'On Track',
    priority: 'High',
    targetDate: '2026-12-31',
    startDate: '2026-01-01',
    currentPhaseId: p6Phases[1].id,
    progressPercent: 33,
    accentColor: '#38bdf8',
    archived: false,
    phases: p6Phases,
    goals: [
      goal('Document golden paths', 'In Progress', 50, '2026-06-01', p6Ids.Adopt),
      goal('Deprecate legacy packages', 'Not Started', 10, '2026-09-01', p6Ids.Govern),
    ],
    tasks: [
      task('Audit current dependencies', { completed: true, phaseId: p6Ids.Inventory }),
      task('Approve React + Node baseline', { isNextAction: true, phaseId: p6Ids.Adopt }),
      task('LPMS as internal pilot app', { isNextAction: true, phaseId: p6Ids.Adopt }),
    ],
    milestones: [
      milestone('Stack decision memo', '2026-04-30', 'In Progress', p6Ids.Adopt),
    ],
    blockers: [],
  }

  const p7Phases = [
    phase('Assessment', 0, false, true),
    phase('Remediation', 1, true, false),
    phase('Audit', 2, false, false),
  ]
  const p7Ids = Object.fromEntries(p7Phases.map((p) => [p.name, p.id]))

  const licensing = {
    id: 'proj_licensing',
    name: 'Licensing & Compliance Tracker',
    type: 'Licensing / Compliance',
    owner: 'Compliance',
    description: 'Track renewals, attestations, and audit artifacts.',
    status: 'Needs Focus',
    priority: 'High',
    targetDate: '2026-05-01',
    startDate: '2026-02-15',
    currentPhaseId: p7Phases[1].id,
    progressPercent: 60,
    accentColor: '#a78bfa',
    archived: false,
    phases: p7Phases,
    goals: [
      goal('License inventory current', 'On Track', 85, '2026-04-20', p7Ids.Assessment),
      goal('SOC2 evidence folder structure', 'In Progress', 45, '2026-05-01', p7Ids.Remediation),
    ],
    tasks: [
      task('Export vendor list from finance', { completed: true, phaseId: p7Ids.Assessment }),
      task('Map licenses to owners', { isNextAction: true, priority: 'High', phaseId: p7Ids.Remediation }),
      task('Upload Q1 attestations', { phaseId: p7Ids.Audit }),
    ],
    milestones: [
      milestone('Renewal calendar published', '2026-04-18', 'In Progress', p7Ids.Remediation),
    ],
    blockers: [
      blocker('Missing signature on DPA for vendor X', 'Critical', 'Legal', false),
    ],
  }

  return [
    lciLce,
    companySetup,
    certs,
    proposal,
    stackRoadmap,
    licensing,
  ]
}
