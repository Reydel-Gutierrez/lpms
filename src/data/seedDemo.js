import { createId } from './model'
import { SCHEMA_VERSION } from './constants'

/** Default workspace when loading fresh seed data or after reset. */
export const DEFAULT_SEED_ACTIVE_PROJECT_ID = 'proj_lci_lce'

/** @param {string} name @param {number} order @param {'Not Started'|'In Progress'|'Complete'} status */
function ph(name, order, status, description = '') {
  return { id: createId('ph'), name, description, order, status }
}

function goal(title, fields = {}) {
  return {
    id: createId('g'),
    title,
    description: fields.description ?? '',
    status: fields.status ?? 'Not Started',
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
    status: fields.status ?? 'Not Started',
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

function projectLciLce() {
  const phases = [
    ph('Planning', 0, 'Not Started'),
    ph('Core UI & Architecture', 1, 'In Progress'),
    ph('Backend Integration', 2, 'Not Started'),
    ph('Discovery & Engineering Workflows', 3, 'Not Started'),
    ph('Visual Polish & Finalization', 4, 'Not Started'),
    ph('MVP Ready', 5, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Make all main LCI pages work dynamically from backend logic', {
      description: '',
      priority: 'High',
      phaseId: P['Backend Integration'],
      tags: ['LCI'],
    }),
    goal('Establish core LCE engineering workflow foundation', {
      description: '',
      priority: 'High',
      phaseId: P['Discovery & Engineering Workflows'],
      tags: ['LCE'],
    }),
    goal('Implement network discovery feature', {
      description: '',
      priority: 'High',
      phaseId: P['Discovery & Engineering Workflows'],
      tags: ['LCI'],
    }),
    goal('Refine premium Legion visual quality across all key pages', {
      description: '',
      priority: 'Medium',
      phaseId: P['Visual Polish & Finalization'],
      tags: ['LCI'],
    }),
    goal('Prepare the platform for a usable MVP state', {
      description: '',
      priority: 'High',
      phaseId: P['MVP Ready'],
      tags: ['LCI', 'LCE'],
    }),
  ]
  const [g1, g2, g3, g4, g5] = goals

  const tasks = [
    task('Work on all UI pages on LCI to work dynamically from backend with logic', g1.id, {
      priority: 'High',
      phaseId: P['Backend Integration'],
      isNextAction: true,
    }),
    task('Implement the Network Discovery feature', g3.id, {
      priority: 'High',
      phaseId: P['Discovery & Engineering Workflows'],
    }),
    task('Do a final premium visual touch up for all pages where needed', g4.id, {
      priority: 'Medium',
      phaseId: P['Visual Polish & Finalization'],
    }),
    task('Review engineering workflows and align key LCE pages with intended UX', g2.id, {
      priority: 'High',
      phaseId: P['Discovery & Engineering Workflows'],
    }),
    task('Stabilize the main platform structure for MVP usage', g5.id, {
      priority: 'High',
      phaseId: P['MVP Ready'],
    }),
  ]

  const milestones = [
    milestone('LCI pages dynamically backed by real logic', g1.id, { phaseId: P['Backend Integration'] }),
    milestone('Network discovery foundation working', g3.id, {
      phaseId: P['Discovery & Engineering Workflows'],
    }),
    milestone('Premium UI pass completed', g4.id, { phaseId: P['Visual Polish & Finalization'] }),
    milestone('MVP-ready checkpoint reached', g5.id, { phaseId: P['MVP Ready'] }),
  ]

  return projectShell({
    id: DEFAULT_SEED_ACTIVE_PROJECT_ID,
    name: 'LCI & LCE',
    type: 'Product / Software',
    owner: 'Reydel',
    description:
      'Legion Command Interface (LCI) and Legion Command Engineering (LCE) development program covering operator experience, engineering workflows, backend-connected UI, discovery, standards, and premium system polish.',
    status: 'In Progress',
    priority: 'High',
    targetDate: '',
    startDate: '',
    currentPhaseId: P['Core UI & Architecture'],
    accentColor: '#5eead4',
    phases,
    goals,
    tasks,
    milestones,
    brainstorm: [],
    blockers: [],
  })
}

function projectSoftwareStack() {
  const phases = [
    ph('Planning', 0, 'In Progress'),
    ph('Core Operating Systems', 1, 'Not Started'),
    ph('Sales & Delivery Systems', 2, 'Not Started'),
    ph('Internal Operations', 3, 'Not Started'),
    ph('Scaling Systems', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Define the core software products the company needs first', {
      priority: 'High',
      phaseId: P.Planning,
    }),
    goal('Prioritize the order of software development', {
      priority: 'High',
      phaseId: P.Planning,
    }),
    goal('Separate MVP-critical systems from future systems', {
      priority: 'High',
      phaseId: P.Planning,
    }),
    goal('Clarify which systems can live inside Legion versus standalone tools', {
      priority: 'High',
      phaseId: P.Planning,
    }),
    goal('Legion Core Platform', {
      description: 'Foundational product and internal platform scope.',
      priority: 'Medium',
      phaseId: P['Core Operating Systems'],
    }),
    goal('Proposal & Estimating System', {
      description: 'Quoting and proposal tooling (roadmap placement).',
      priority: 'Medium',
      phaseId: P['Sales & Delivery Systems'],
    }),
    goal('Project Management / Delivery Tracking', {
      description: 'Execution visibility and delivery tracking.',
      priority: 'Medium',
      phaseId: P['Sales & Delivery Systems'],
    }),
    goal('Service Ticket / Dispatch System', {
      description: 'Field and service workflow support.',
      priority: 'Medium',
      phaseId: P['Internal Operations'],
    }),
    goal('Client Portal', {
      description: 'Client-facing access and transparency.',
      priority: 'Medium',
      phaseId: P['Sales & Delivery Systems'],
    }),
    goal('Reporting / Analytics', {
      description: 'Operational and business reporting.',
      priority: 'Medium',
      phaseId: P['Scaling Systems'],
    }),
    goal('Internal Admin / Team Operations', {
      description: 'Team and admin workflows.',
      priority: 'Medium',
      phaseId: P['Internal Operations'],
    }),
    goal('Documentation / Knowledge Base', {
      description: 'Standards, runbooks, and knowledge.',
      priority: 'Medium',
      phaseId: P['Scaling Systems'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Define the full company software stack', g1.id, { priority: 'High', phaseId: P.Planning }),
    task('Prioritize what must be built first versus later', g2.id, { priority: 'High', phaseId: P.Planning }),
    task('Group software by business function', g1.id, { priority: 'Medium', phaseId: P.Planning }),
    task('Decide which systems should be internal-only and which may become products', g4.id, {
      priority: 'High',
      phaseId: P.Planning,
    }),
    task('Review how software stack supports delivery, operations, and scaling', g2.id, {
      priority: 'Medium',
      phaseId: P.Planning,
    }),
  ]

  return projectShell({
    id: 'proj_software_stack',
    name: 'Software Stack Roadmap',
    type: 'Operations',
    owner: 'Reydel',
    description:
      'Master roadmap for the internal and client-facing software ecosystem needed to operate Legion Controls as a real company.',
    status: 'Planning',
    priority: 'High',
    targetDate: '',
    startDate: '',
    currentPhaseId: P.Planning,
    accentColor: '#38bdf8',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectCertifications() {
  const phases = [
    ph('Research & Planning', 0, 'In Progress'),
    ph('In Progress', 1, 'Not Started'),
    ph('Scheduling', 2, 'Not Started'),
    ph('Completed', 3, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Define the most important certifications to complete first', {
      priority: 'High',
      phaseId: P['Research & Planning'],
    }),
    goal('Track current BAS / controls / networking learning progress', {
      priority: 'High',
      phaseId: P['In Progress'],
    }),
    goal('Align certification path with company needs', {
      priority: 'Medium',
      phaseId: P['Research & Planning'],
    }),
    goal('Support long-term credibility and technical growth', {
      priority: 'Medium',
      phaseId: P['Research & Planning'],
    }),
    goal('BAS / Controls', {
      description: 'Building automation and controls learning path.',
      priority: 'Medium',
      phaseId: P['In Progress'],
    }),
    goal('Networking', {
      description: 'Network fundamentals relevant to the work.',
      priority: 'Medium',
      phaseId: P['In Progress'],
    }),
    goal('Project / Operations', {
      description: 'Delivery and operations-related credentials.',
      priority: 'Medium',
      phaseId: P.Scheduling,
    }),
    goal('Licensing-related education', {
      description: 'Training tied to regulatory or licensing context.',
      priority: 'Medium',
      phaseId: P['Research & Planning'],
    }),
    goal('Continuing technical development', {
      description: 'Ongoing skills and depth.',
      priority: 'Low',
      phaseId: P['In Progress'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Review which certifications matter most for the business', g1.id, {
      priority: 'High',
      phaseId: P['Research & Planning'],
    }),
    task('Prioritize certifications by near-term value', g1.id, {
      priority: 'High',
      phaseId: P['Research & Planning'],
    }),
    task('Track current in-progress learning', g2.id, {
      priority: 'High',
      phaseId: P['In Progress'],
    }),
    task('Plan next certification steps', g3.id, {
      priority: 'Medium',
      phaseId: P.Scheduling,
    }),
    task('Align certifications with Legion technical direction', g4.id, {
      priority: 'Medium',
      phaseId: P['Research & Planning'],
    }),
  ]

  return projectShell({
    id: 'proj_certifications',
    name: 'Certifications Roadmap',
    type: 'Certification / Learning',
    owner: 'Reydel',
    description:
      'Roadmap for certifications, technical training, and knowledge development needed to strengthen Legion Controls and support technical credibility.',
    status: 'In Progress',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: P['Research & Planning'],
    accentColor: '#34d399',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectLicensingCompliance() {
  const phases = [
    ph('Research', 0, 'In Progress'),
    ph('Requirements Review', 1, 'Not Started'),
    ph('Application Planning', 2, 'Not Started'),
    ph('Submission / Setup', 3, 'Not Started'),
    ph('Active / Maintained', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Identify required licenses and compliance items', {
      priority: 'High',
      phaseId: P.Research,
    }),
    goal('Organize legal and operational requirements', {
      priority: 'High',
      phaseId: P['Requirements Review'],
    }),
    goal('Clarify what is needed before offering services', {
      priority: 'High',
      phaseId: P['Requirements Review'],
    }),
    goal('Track readiness for formal business operation', {
      priority: 'High',
      phaseId: P['Application Planning'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Identify required company licenses', g1.id, { priority: 'High', phaseId: P.Research }),
    task('Review compliance requirements for services offered', g2.id, {
      priority: 'High',
      phaseId: P['Requirements Review'],
    }),
    task('Organize licensing and legal setup steps', g2.id, {
      priority: 'Medium',
      phaseId: P['Application Planning'],
    }),
    task('Clarify what must be active before launch', g3.id, {
      priority: 'High',
      phaseId: P['Requirements Review'],
    }),
    task('Create a structure for maintaining compliance items', g4.id, {
      priority: 'Medium',
      phaseId: P['Active / Maintained'],
    }),
  ]

  return projectShell({
    id: 'proj_licensing_compliance',
    name: 'Licensing & Compliance',
    type: 'Licensing / Compliance',
    owner: 'Reydel',
    description:
      'Central workspace for required licenses, compliance planning, and legal/operational readiness items needed before offering services more formally.',
    status: 'Planning',
    priority: 'High',
    targetDate: '',
    startDate: '',
    currentPhaseId: P.Research,
    accentColor: '#a78bfa',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectLlcBusinessSetup() {
  const phases = [
    ph('Formation', 0, 'In Progress'),
    ph('Legal & Tax', 1, 'Not Started'),
    ph('Banking & Finance', 2, 'Not Started'),
    ph('Insurance', 3, 'Not Started'),
    ph('Branding & Admin', 4, 'Not Started'),
    ph('Operational Setup', 5, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Finalize business formation structure', {
      priority: 'High',
      phaseId: P.Formation,
    }),
    goal('Organize tax and legal setup items', {
      priority: 'High',
      phaseId: P['Legal & Tax'],
    }),
    goal('Set up banking and financial basics', {
      priority: 'High',
      phaseId: P['Banking & Finance'],
    }),
    goal('Prepare insurance and administrative basics', {
      priority: 'Medium',
      phaseId: P.Insurance,
    }),
    goal('Establish a clean operational company foundation', {
      priority: 'Medium',
      phaseId: P['Operational Setup'],
    }),
  ]
  const [g1, g2, g3, g4, g5] = goals

  const tasks = [
    task('Review business formation steps', g1.id, { priority: 'High', phaseId: P.Formation }),
    task('Organize legal and tax setup requirements', g2.id, {
      priority: 'High',
      phaseId: P['Legal & Tax'],
    }),
    task('Plan banking and finance setup', g3.id, {
      priority: 'High',
      phaseId: P['Banking & Finance'],
    }),
    task('Review insurance needs', g4.id, { priority: 'Medium', phaseId: P.Insurance }),
    task('Organize core administrative setup items', g5.id, {
      priority: 'Medium',
      phaseId: P['Branding & Admin'],
    }),
  ]

  return projectShell({
    id: 'proj_llc_business_setup',
    name: 'LLC / Business Setup',
    type: 'Company Setup',
    owner: 'Reydel',
    description:
      'Workspace for forming the business structure and completing the foundational setup needed to operate properly.',
    status: 'Planning',
    priority: 'High',
    targetDate: '',
    startDate: '',
    currentPhaseId: P.Formation,
    accentColor: '#fbbf24',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectProposalEstimating() {
  const phases = [
    ph('Planning', 0, 'In Progress'),
    ph('Workflow Definition', 1, 'Not Started'),
    ph('UX / Structure', 2, 'Not Started'),
    ph('MVP Build', 3, 'Not Started'),
    ph('Refinement', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Define how proposals should be created', {
      priority: 'Medium',
      phaseId: P.Planning,
    }),
    goal('Structure estimating workflow', {
      priority: 'Medium',
      phaseId: P['Workflow Definition'],
    }),
    goal('Clarify scope, pricing, and deliverable format', {
      priority: 'Medium',
      phaseId: P['UX / Structure'],
    }),
    goal('Prepare this as a future internal operating tool', {
      priority: 'Medium',
      phaseId: P['MVP Build'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Define proposal workflow', g1.id, { priority: 'Medium', phaseId: P.Planning }),
    task('Define estimating workflow', g2.id, {
      priority: 'Medium',
      phaseId: P['Workflow Definition'],
    }),
    task('Review proposal data structure needs', g3.id, {
      priority: 'Medium',
      phaseId: P['UX / Structure'],
    }),
    task('Clarify what proposal system should include in MVP', g4.id, {
      priority: 'Medium',
      phaseId: P['MVP Build'],
    }),
    task('Plan how proposal system connects with other company tools', g4.id, {
      priority: 'Medium',
      phaseId: P.Planning,
    }),
  ]

  return projectShell({
    id: 'proj_proposal_estimating',
    name: 'Proposal & Estimating System',
    type: 'Product / Software',
    owner: 'Reydel',
    description:
      'Planning workspace for the proposal, estimating, and quotation workflow needed to support Legion sales and project delivery.',
    status: 'Planning',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: P.Planning,
    accentColor: '#f472b6',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectLpms() {
  const phases = [
    ph('Planning', 0, 'Not Started'),
    ph('Structure & UX', 1, 'In Progress'),
    ph('Daily Use', 2, 'Not Started'),
    ph('Refinement', 3, 'Not Started'),
    ph('Expansion', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Make LPMS useful for daily planning', {
      priority: 'Medium',
      phaseId: P['Daily Use'],
    }),
    goal('Refine project structure for real company use', {
      priority: 'Medium',
      phaseId: P['Structure & UX'],
    }),
    goal('Improve execution visibility across projects', {
      priority: 'Medium',
      phaseId: P['Daily Use'],
    }),
    goal('Prepare LPMS to support future team/project operations', {
      priority: 'Medium',
      phaseId: P.Expansion,
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Use LPMS for real company planning', g1.id, {
      priority: 'Medium',
      phaseId: P['Daily Use'],
    }),
    task('Refine dashboard and structure based on actual use', g2.id, {
      priority: 'Medium',
      phaseId: P['Structure & UX'],
    }),
    task('Improve project visibility and execution flow', g3.id, {
      priority: 'Medium',
      phaseId: P.Refinement,
    }),
    task('Review what future PM features matter most', g4.id, {
      priority: 'Low',
      phaseId: P.Expansion,
    }),
    task('Stabilize LPMS as a real internal tool', g4.id, {
      priority: 'Medium',
      phaseId: P.Refinement,
    }),
  ]

  return projectShell({
    id: 'proj_lpms',
    name: 'Project Delivery / PM System',
    type: 'Product / Software',
    owner: 'Reydel',
    description:
      'Internal project management and delivery tracking system for Legion work, planning, and execution.',
    status: 'In Progress',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: P['Structure & UX'],
    accentColor: '#818cf8',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectBrandingPresence() {
  const phases = [
    ph('Brand Direction', 0, 'In Progress'),
    ph('Website Planning', 1, 'Not Started'),
    ph('Messaging', 2, 'Not Started'),
    ph('Launch Readiness', 3, 'Not Started'),
    ph('Ongoing Refinement', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Clarify brand presentation', {
      priority: 'Medium',
      phaseId: P['Brand Direction'],
    }),
    goal('Improve website direction', {
      priority: 'Medium',
      phaseId: P['Website Planning'],
    }),
    goal('Align messaging with Legion vision', {
      priority: 'Medium',
      phaseId: P.Messaging,
    }),
    goal('Prepare a professional external presence', {
      priority: 'Medium',
      phaseId: P['Launch Readiness'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Review brand direction', g1.id, { priority: 'Medium', phaseId: P['Brand Direction'] }),
    task('Review company website needs', g2.id, {
      priority: 'Medium',
      phaseId: P['Website Planning'],
    }),
    task('Improve messaging and positioning', g3.id, {
      priority: 'Medium',
      phaseId: P.Messaging,
    }),
    task('Define what must be live before launch', g4.id, {
      priority: 'Medium',
      phaseId: P['Launch Readiness'],
    }),
    task('Organize external presence priorities', g4.id, {
      priority: 'Medium',
      phaseId: P['Ongoing Refinement'],
    }),
  ]

  return projectShell({
    id: 'proj_branding_presence',
    name: 'Branding, Website & Presence',
    type: 'Operations',
    owner: 'Reydel',
    description:
      'Workspace for brand presentation, company website direction, messaging, and external professional presence.',
    status: 'Planning',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: P['Brand Direction'],
    accentColor: '#fb923c',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectServiceOperations() {
  const phases = [
    ph('Planning', 0, 'In Progress'),
    ph('Workflow Design', 1, 'Not Started'),
    ph('Tool Definition', 2, 'Not Started'),
    ph('Operational Readiness', 3, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Define service delivery workflow', {
      priority: 'Medium',
      phaseId: P.Planning,
    }),
    goal('Clarify dispatch/service tracking needs', {
      priority: 'Medium',
      phaseId: P['Workflow Design'],
    }),
    goal('Prepare operational structure for future jobs', {
      priority: 'Medium',
      phaseId: P['Tool Definition'],
    }),
    goal('Organize internal delivery logic', {
      priority: 'Medium',
      phaseId: P['Operational Readiness'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Define service workflow needs', g1.id, { priority: 'Medium', phaseId: P.Planning }),
    task('Review dispatch/service tracking requirements', g2.id, {
      priority: 'Medium',
      phaseId: P['Workflow Design'],
    }),
    task('Plan operational support tools', g3.id, {
      priority: 'Medium',
      phaseId: P['Tool Definition'],
    }),
    task('Clarify what systems are needed before active service scaling', g4.id, {
      priority: 'Medium',
      phaseId: P['Operational Readiness'],
    }),
  ]

  return projectShell({
    id: 'proj_service_operations',
    name: 'Service Operations Foundation',
    type: 'Operations',
    owner: 'Reydel',
    description:
      'Planning workspace for service delivery structure, dispatch/service logic, and operational workflows needed as the company grows.',
    status: 'Planning',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: P.Planning,
    accentColor: '#2dd4bf',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

function projectDocumentationStandards() {
  const phases = [
    ph('Planning', 0, 'In Progress'),
    ph('Standards Definition', 1, 'Not Started'),
    ph('Template Creation', 2, 'Not Started'),
    ph('Documentation Structure', 3, 'Not Started'),
    ph('Ongoing Maintenance', 4, 'Not Started'),
  ]
  const P = Object.fromEntries(phases.map((p) => [p.name, p.id]))

  const goals = [
    goal('Define internal standards', {
      priority: 'Medium',
      phaseId: P['Standards Definition'],
    }),
    goal('Build documentation structure', {
      priority: 'Medium',
      phaseId: P['Documentation Structure'],
    }),
    goal('Organize templates and repeatable systems', {
      priority: 'Medium',
      phaseId: P['Template Creation'],
    }),
    goal('Prepare documentation for consistent delivery quality', {
      priority: 'Medium',
      phaseId: P['Ongoing Maintenance'],
    }),
  ]
  const [g1, g2, g3, g4] = goals

  const tasks = [
    task('Define documentation priorities', g2.id, { priority: 'Medium', phaseId: P.Planning }),
    task('Review standards needed for delivery quality', g1.id, {
      priority: 'Medium',
      phaseId: P['Standards Definition'],
    }),
    task('Organize template needs', g3.id, {
      priority: 'Medium',
      phaseId: P['Template Creation'],
    }),
    task('Plan internal documentation structure', g2.id, {
      priority: 'Medium',
      phaseId: P['Documentation Structure'],
    }),
    task('Clarify what should be standardized first', g1.id, {
      priority: 'Medium',
      phaseId: P.Planning,
    }),
  ]

  return projectShell({
    id: 'proj_documentation_standards',
    name: 'Documentation & Standards',
    type: 'Operations',
    owner: 'Reydel',
    description:
      'Workspace for internal standards, engineering templates, documentation structure, and repeatable delivery quality systems.',
    status: 'Planning',
    priority: 'Medium',
    targetDate: '',
    startDate: '',
    currentPhaseId: P.Planning,
    accentColor: '#94a3b8',
    phases,
    goals,
    tasks,
    milestones: [],
    brainstorm: [],
    blockers: [],
  })
}

export function getSeedProjects() {
  return [
    projectLciLce(),
    projectSoftwareStack(),
    projectCertifications(),
    projectLicensingCompliance(),
    projectLlcBusinessSetup(),
    projectProposalEstimating(),
    projectLpms(),
    projectBrandingPresence(),
    projectServiceOperations(),
    projectDocumentationStandards(),
  ]
}
