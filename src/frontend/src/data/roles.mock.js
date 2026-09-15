export const ROLES = [
  {
    code: 'admin',
    title: 'Operations Admin',
    tag: 'System Lead',
    initials: 'AD',
    description: 'Full dispatch control, security entitlements, and system overrides.',
    permissions: {
      viewMap: true,
      viewKpis: true,
      viewAlerts: true,
      viewPlan: true,
      applyRecommendation: true,
      ackAlert: true,
      manageUsers: true
    }
  },
  {
    code: 'shift_supervisor',
    title: 'Shift Supervisor',
    tag: 'Operations Lead',
    initials: 'SS',
    description: '72h rolling plans, quay crane gang allocations, and plan approvals.',
    permissions: {
      viewMap: true,
      viewKpis: true,
      viewAlerts: true,
      viewPlan: true,
      applyRecommendation: true,
      ackAlert: true,
      manageUsers: false
    }
  },
  {
    code: 'berth_planner',
    title: 'Berth Planner',
    tag: 'Marine Specialist',
    initials: 'BP',
    description: 'Quayside vessel allocations, hydrographic UKC, and crane assignments.',
    permissions: {
      viewMap: true,
      viewKpis: true,
      viewAlerts: true,
      viewPlan: true,
      applyRecommendation: true,
      ackAlert: true,
      manageUsers: false
    }
  },
  {
    code: 'gate_controller',
    title: 'Gate Controller',
    tag: 'Logistics Specialist',
    initials: 'GC',
    description: 'Truck OCR lanes, queue diversions, and intermodal drayage flow.',
    permissions: {
      viewMap: true,
      viewKpis: true,
      viewAlerts: true,
      viewPlan: false,
      applyRecommendation: true,
      ackAlert: true,
      manageUsers: false
    }
  },
  {
    code: 'viewer',
    title: 'Executive Viewer',
    tag: 'Monitoring',
    initials: 'VR',
    description: 'Read-only maritime digital twin telemetry and executive reporting.',
    permissions: {
      viewMap: true,
      viewKpis: true,
      viewAlerts: true,
      viewPlan: true,
      applyRecommendation: false,
      ackAlert: false,
      manageUsers: false
    }
  }
]
