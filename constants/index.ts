export const ROLES = {
  OPERATOR:   'operator',
  SUPERVISOR: 'supervisor',
  ENGINEER:   'engineer',
  ADMIN:      'admin',
} as const

export const CRANE_STATUS_LABELS = {
  idle:    'Idle',
  moving:  'Moving',
  loading: 'Loading',
  error:   'Error',
  offline: 'Offline',
} as const

export const ALARM_SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-status-alarm',
  high:     'text-status-alarm',
  medium:   'text-status-warning',
  low:      'text-accent-gold',
  info:     'text-accent-primary',
}

export type NavRole = 'operator' | 'supervisor' | 'engineer' | 'admin'

export interface NavChild {
  label: string
  path:  string
  icon:  string
  roles: NavRole[]
}

export interface NavItem {
  label:    string
  path:     string | null
  icon:     string
  roles:    NavRole[]
  children?: NavChild[]
  devOnly?: boolean
}

export const NAVIGATION: NavItem[] = [
  {
    label: 'Overview',
    path:  '/overview',
    icon:  'LayoutDashboard',
    roles: ['operator', 'supervisor', 'engineer', 'admin'],
  },
  {
    label: 'Production',
    path:  null,
    icon:  'Activity',
    roles: ['operator', 'supervisor', 'engineer', 'admin'],
    children: [
      { label: 'Live Monitor',   path: '/production/monitor',  icon: 'Monitor',         roles: ['operator', 'supervisor', 'engineer', 'admin'] },
      { label: 'Job Queue',      path: '/production/jobs',     icon: 'ListOrdered',     roles: ['operator', 'supervisor', 'engineer', 'admin'] },
      { label: 'Crane Control',  path: '/production/cranes',   icon: 'MoveHorizontal',  roles: ['engineer', 'admin'] },
    ],
  },
  {
    label: 'Recipes',
    path:  null,
    icon:  'ClipboardList',
    roles: ['operator', 'supervisor', 'engineer', 'admin'],
    children: [
      { label: 'Recipe List',   path: '/recipes',               icon: 'Table2',    roles: ['operator', 'supervisor', 'engineer', 'admin'] },
      { label: 'Create Recipe', path: '/recipes/create',        icon: 'Plus',      roles: ['engineer', 'admin'] },
      { label: 'Import/Export', path: '/recipes/import-export', icon: 'Download',  roles: ['engineer', 'admin'] },
    ],
  },
  {
    label: 'Alarms',
    path:  null,
    icon:  'Bell',
    roles: ['operator', 'supervisor', 'engineer', 'admin'],
    children: [
      { label: 'Active Alarms',  path: '/alarms',          icon: 'BellRing',          roles: ['operator', 'supervisor', 'engineer', 'admin'] },
      { label: 'Alarm History',  path: '/alarms/history',  icon: 'Clock',             roles: ['supervisor', 'engineer', 'admin'] },
      { label: 'Alarm Settings', path: '/alarms/settings', icon: 'SlidersHorizontal', roles: ['engineer', 'admin'] },
    ],
  },
  {
    label: 'Reports',
    path:  null,
    icon:  'FileText',
    roles: ['supervisor', 'engineer', 'admin'],
    children: [
      { label: 'Production Report',  path: '/reports/production',        icon: 'BarChart2',    roles: ['supervisor', 'engineer', 'admin'] },
      { label: 'Downtime Report',    path: '/reports/downtime',          icon: 'TrendingDown', roles: ['supervisor', 'engineer', 'admin'] },
      { label: 'Crane Utilization',  path: '/reports/crane-utilization', icon: 'Gauge',        roles: ['supervisor', 'engineer', 'admin'] },
      { label: 'Alarm Report',       path: '/reports/alarms',            icon: 'FileText',     roles: ['supervisor', 'engineer', 'admin'] },
    ],
  },
  {
    label: 'Maintenance',
    path:  null,
    icon:  'Wrench',
    roles: ['engineer', 'admin'],
    children: [
      { label: 'Diagnostics',     path: '/maintenance/diagnostics', icon: 'Activity',     roles: ['engineer', 'admin'] },
      { label: 'Simulation Mode', path: '/maintenance/simulation',  icon: 'FlaskConical', roles: ['engineer', 'admin'] },
      { label: 'IO Testing',      path: '/maintenance/io-testing',  icon: 'Zap',          roles: ['engineer', 'admin'] },
    ],
  },
  {
    label: 'Admin',
    path:  null,
    icon:  'Shield',
    roles: ['admin'],
    children: [
      { label: 'User Management', path: '/admin/users',  icon: 'User',              roles: ['admin'] },
      { label: 'System Config',   path: '/admin/config', icon: 'SlidersHorizontal', roles: ['admin'] },
      { label: 'Audit Log',       path: '/admin/audit',  icon: 'FileText',          roles: ['admin'] },
    ],
  },
  {
    label:   'Design System',
    path:    '/design-system',
    icon:    'Layers',
    roles:   ['admin'],
    devOnly: true,
  },
]
