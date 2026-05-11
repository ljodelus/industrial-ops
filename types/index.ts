export type UserRole = 'operator' | 'supervisor' | 'engineer' | 'admin'

export type CraneStatus = 'idle' | 'moving' | 'loading' | 'error' | 'offline'

export type CraneMode = 'auto' | 'manual' | 'maintenance'

export type AlarmSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export interface User {
  id: string
  name: string
  role: UserRole
  email: string
}

export interface Crane {
  id: string
  name: string
  status: CraneStatus
  position: number
  load: number
  currentJob?: string
  line: string
  mode?: CraneMode
  targetPosition?: number
}

export interface Tank {
  id: string
  number: number
  name: string
  occupied: boolean
  currentPart?: string
  dwellProgress: number
  line: string
  freeTicksRemaining?: number
}

export interface Recipe {
  id:              string
  name:            string
  version:         number
  line:            string
  steps:           RecipeStep[]
  updatedBy:       string
  createdAt:       string
  updatedAt:       string
  versionHistory?: RecipeVersionRecord[]
}

export interface RecipeStep {
  tankNumber: number
  tankName: string
  craneNumber: number
  minTime: number
  preferredTime: number
  maxTime: number
  notes?: string
}

export interface RecipeVersionRecord {
  version: number
  date:    string   // ISO date string
  author:  string
  note:    string
}

export interface Job {
  id: string
  recipeId: string
  recipeName: string
  status: JobStatus
  priority: number
  line: string
  assignedCrane?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  notes?: string
}

// ─── Job Simulation State ─────────────────────────────────────────────────────

export type JobStepStatus = 'completed' | 'in_progress' | 'pending'

export interface JobStepSimState {
  status: JobStepStatus
  progress: number    // 0–100
  elapsedSec: number  // seconds elapsed in this step
}

export interface JobSimState {
  currentStepIndex: number
  steps: JobStepSimState[]
}

export interface Alarm {
  id: string
  severity: AlarmSeverity
  category: string
  message: string
  source: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  triggeredAt: string
}

// ─── UI Component Props ───────────────────────────────────────────────────────

export interface StatusDotProps {
  status: 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface BadgeProps {
  variant: 'ok' | 'warning' | 'alarm' | 'offline' | 'idle' | 'info' | 'gold'
  label: string
  className?: string
}

export interface AlarmBadgeProps {
  count: number
  unacknowledged?: boolean
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  children: React.ReactNode
  className?: string
}

export interface InputProps {
  label?: string
  type?: 'text' | 'number' | 'password' | 'search'
  placeholder?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  unit?: string
  register?: import('react-hook-form').UseFormRegisterReturn
  className?: string
}

export interface SelectProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
  error?: string
  register?: import('react-hook-form').UseFormRegisterReturn
  className?: string
}

export interface CardProps {
  title?: string
  accent?: 'ok' | 'warning' | 'alarm' | 'offline' | 'primary' | 'gold'
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  accentColor?: string
  maxWidth?: string
  closeOnOverlay?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

export interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
}

export interface ProgressBarProps {
  value: number
  max: number
  unit?: string
  showLabel?: boolean
  className?: string
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  message: string
  action?: React.ReactNode
}

export interface ValueDisplayProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  accent?: CardProps['accent']
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

// ─── Recipe Form ─────────────────────────────────────────────────────────────

/** Draft step used inside the recipe create/edit form (has a local id for stable React keys). */
export interface StepDraft {
  id:            string   // local UUID — not persisted
  tankNumber:    number
  tankName:      string
  craneNumber:   number
  minTime:       number
  preferredTime: number
  maxTime:       number
  notes:         string
}

/** An error item shown in the validation summary panel. */
export interface ValidationError {
  message:  string
  scrollTo: string   // element id to scroll to on click
}

// ─── Recipe Import / Export ───────────────────────────────────────────────────

export type ConflictMode = 'skip' | 'update' | 'replace'

export interface ImportedRecipeFile {
  exportedAt: string
  exportedBy: string
  version:    string
  recipes:    Recipe[]
}

// ─── Toast / Notifications ───────────────────────────────────────────────────

export interface ToastItem {
  id:      string
  type:    'success' | 'error' | 'warning' | 'info'
  message: string
}

// ─── Alarm History ───────────────────────────────────────────────────────────

export interface AlarmHistoryEntry {
  id:             string
  severity:       AlarmSeverity
  message:        string
  source:         string
  category:       string
  triggeredAt:    string   // ISO date-time string
  duration:       string   // formatted "HH:MM:SS"
  acknowledgedBy: string | null
  acknowledgedAt: string | null  // ISO date-time string or null
  acknowledged:   boolean
  faultCode:      string
  fullMessage:    string
  recommendation: string
}

// ─── Crane Control ────────────────────────────────────────────────────────────

export interface CraneMovementRecord {
  id: string
  timestamp: string
  from: number
  to: number
  distance: number
  durationSec: number
  speedMpm: number
  jobId?: string
  result: 'success' | 'fault' | 'aborted'
}

// ─── Production Report ────────────────────────────────────────────────────────

export type BatchStatus = 'completed' | 'failed' | 'cancelled'

export interface ProductionBatch {
  id:           string
  recipeId:     string
  recipeName:   string
  line:         'LINE-1' | 'LINE-2'
  crane:        string
  parts:        number
  startedAt:    string
  completedAt:  string
  cycleTime:    string   // formatted "HH:MM:SS"
  onTime:       boolean
  status:       BatchStatus
}

export interface DailyVolumeEntry {
  date:  string
  line1: number
  line2: number
}

// ─── Downtime Report ──────────────────────────────────────────────────────────

export type DowntimeCategory = 'Motion' | 'Communication' | 'Planned' | 'Process' | 'Sensor'

export interface DowntimeEvent {
  id:               string
  date:             string                // e.g. 'May 09'
  startTime:        string                // e.g. '08:14:22'
  endTime:          string                // e.g. '08:20:36'
  duration:         string                // formatted 'MM:SS'
  durationMinutes:  number
  equipment:        string                // e.g. 'CRANE-1'
  category:         DowntimeCategory
  cause:            string
  impactedBatches:  number
  resolvedBy:       string
  alarmRef:         string                // alarm ID or '—'
  fullDescription:  string
  faultCode:        string
  batchesAffected:  string[]
  resolution:       string
  preventiveAction: string
}

export interface EquipmentDowntimeStat {
  id:               string
  name:             string
  type:             'crane' | 'plc'
  downtimeMinutes:  number
  eventCount:       number
  availability:     number                // 0–100 percentage
  mtbf:             string                // e.g. '28h 10m'
  lastFault:        string
  lastFaultAt:      string                // e.g. '08:14 May 09'
  status:           'online' | 'offline'
}

export interface DowntimeTimelineEntry {
  date:          string
  motion:        number
  communication: number
  planned:       number
  process:       number
  sensor:        number
}

export interface DowntimeCategoryEntry {
  category:    string
  totalMinutes: number
  events:      number
  avgMinutes:  number
}

// ─── Crane Utilization Report ─────────────────────────────────────────────────

export type CraneCurrentStatus = 'moving' | 'idle' | 'loading' | 'error'

export interface CraneUtilizationData {
  id:           string   // e.g. 'CRANE-1'
  line:         string   // e.g. 'LINE-1'
  status:       CraneCurrentStatus
  activePct:    number   // 0–100
  idlePct:      number   // 0–100
  faultPct:     number   // 0–100
}

export interface ActivityDayEntry {
  date:        string   // e.g. 'May 03'
  active:      number   // hours
  idle:        number
  fault:       number
  maintenance: number
}

export interface CraneActivityData {
  craneId:     string   // 'fleet' | 'CRANE-1' | ...
  days:        ActivityDayEntry[]
}

export interface LoadBucket {
  range:     string   // e.g. '0–100 kg'
  transfers: number
  color:     string   // Tailwind fill class
}

export interface HeatmapCell {
  craneId:    string
  positionMm: number   // 0, 1000, 2000, …
  tankLabel:  string   // 'T1', 'T2', ...
  dwellHours: number
  transfers:  number
  intensity:  number   // 0–1
}

export interface CraneComparisonMetric {
  metric:     string
  crane1:     string
  crane2:     string
  crane3:     string
  crane4:     string
  fleetAvg:   string
  bestIndex:  number | null   // 0=crane1, 1=crane2, 2=crane3, 3=crane4
  worstIndex: number | null
}

// ─── Alarm Report ─────────────────────────────────────────────────────────────

export interface AlarmFrequencyEntry {
  date:     string
  critical: number
  high:     number
  medium:   number
  low:      number
  total:    number
}

export interface HourlyAlarmEntry {
  hour:  string
  count: number
}

export type AlarmSourceType = 'crane' | 'plc' | 'tank' | 'zone' | 'system'

export interface AlarmSourceStat {
  rank:     number
  source:   string
  type:     AlarmSourceType
  count:    number
  pct:      number
  critical: number
  high:     number
  medium:   number
  low:      number
}

export interface AlarmHeatmapCell {
  day:      number   // 0 = Mon, 6 = Sun
  hour:     number   // 0–23
  total:    number
  critical: number
  high:     number
  medium:   number
  low:      number
}

export type RecurringAlarmTrend = 'up' | 'stable' | 'down'

export interface RecurringAlarmOccurrence {
  timestamp:      string
  acknowledgedIn: string
  acknowledgedBy: string
}

export interface RecurringAlarm {
  id:              string
  rank:            number
  message:         string
  source:          string
  category:        string
  triggers:        number
  avgResponse:     string
  firstSeen:       string
  lastSeen:        string
  trend:           RecurringAlarmTrend
  peakDay:         string
  peakHour:        string
  avgPerDay:       string
  lastOccurrences: RecurringAlarmOccurrence[]
  recommendation:  string
}

export interface AlarmReportKpis {
  totalAlarms:     number
  avgResponseTime: string
  nuisanceAlarms:  number
  criticalRate:    string
  unresolved:      number
}

export interface ResponseTimeStat {
  fastestAck:       string
  fastestBy:        string
  slowestAck:       string
  slowestBy:        string
  median:           string
  withinTargetPct:  number
}

export interface ResponseTimeBucket {
  label:    string
  count:    number
  colorKey: 'ok' | 'primary' | 'gold' | 'warning' | 'alarm'
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export type DiagnosticLogLevel = 'INFO' | 'WARN' | 'ERROR'

export interface DiagnosticLogEntry {
  id:        string
  timestamp: string   // HH:MM:SS
  level:     DiagnosticLogLevel
  message:   string
}

export interface LatencyPoint {
  second: number  // rolling counter
  plc1:   number  // ms
  plc2:   number  // ms
}

export type DiagComponentStatus = 'ok' | 'warning' | 'alarm' | 'offline'

export interface CraneHardwareStatus {
  craneId:        string
  craneName:      string
  overall:        DiagComponentStatus
  travelMotor:    DiagComponentStatus
  hoistMotor:     DiagComponentStatus
  vfdDrive:       DiagComponentStatus
  encoder:        DiagComponentStatus
  endLimitLeft:   DiagComponentStatus
  endLimitRight:  DiagComponentStatus
  loadCell:       DiagComponentStatus
  brakeSystem:    DiagComponentStatus
  tempVfd:        number   // °C
  tempMotor:      number   // °C
  operatingHours: number
}

// ─── IO Testing ───────────────────────────────────────────────────────────────

export type IOSignalType   = 'DI' | 'DO' | 'AI' | 'AO'
export type IOSignalStatus = 'HIGH' | 'LOW' | 'FAULT' | 'CAUTION' | 'FORCED'
export type PLCLine        = 'LINE-1' | 'LINE-2'
export type IODevice       = 'CRANE-1' | 'CRANE-2' | 'TANK-1' | 'TANK-2' | 'TANK-3' | 'TANK-4' | 'TANK-5' | 'TANK-6' | 'ZONE-A' | 'ZONE-B' | 'SYSTEM'

export interface IOSignal {
  address:  string         // e.g. '%I0.0', '%Q0.0', '%IW0'
  name:     string         // e.g. 'CRANE-1_END_LIMIT_LEFT'
  type:     IOSignalType
  status:   IOSignalStatus
  device:   IODevice
  value?:   number         // Analog signals only
  unit?:    string         // e.g. 'mm', 'kg', 'm/min', '°C'
  min?:     number         // Analog range min
  max?:     number         // Analog range max
  plc:      PLCLine
}

export type IOLogEntryType = 'READ' | 'FORCE' | 'RELEASE' | 'FAULT' | 'MONITOR'

export interface IOLogEntry {
  id:         string
  timestamp:  string       // HH:MM:SS
  type:       IOLogEntryType
  address:    string
  signalName: string
  detail:     string
}

export interface MonitorDataPoint {
  second: number
  value:  number
}

// ─── User Management ──────────────────────────────────────────────────────────

export interface UserActivity {
  timestamp: string
  action:    string
  type:      'login' | 'ack' | 'recipe' | 'job' | 'other'
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditCategory =
  | 'Authentication'
  | 'User Management'
  | 'Recipe'
  | 'Job'
  | 'Alarm'
  | 'Configuration'
  | 'IO Force'
  | 'System'
  | 'Security'

export type AuditResult   = 'SUCCESS' | 'FAILURE' | 'WARNING'
export type AuditSeverity = 'info' | 'warning' | 'critical'

export interface AuditEntry {
  id:                 string
  timestamp:          string        // ISO datetime
  category:           AuditCategory
  user:               string
  action:             string
  target:             string
  ipAddress:          string
  result:             AuditResult
  severity:           AuditSeverity
  // Detail fields
  eventId:            string
  sessionId:          string
  userAgent:          string
  duration:           string
  beforeState?:       string
  afterState?:        string
  additionalContext?: string
  changes?:           string
  // Security-specific
  attemptCount?:      number
  geoHint?:           string
  // IO Force-specific
  signalAddress?:     string
  previousValue?:     string
  forcedValue?:       string
  forceDuration?:     string
}

export interface AuditTimelinePoint {
  date:     string
  auth:     number
  alarm:    number
  config:   number
  recipe:   number
  security: number
  other:    number
}

export interface AuditTopUser {
  name:  string
  role:  string
  count: number
}

export interface UserWithStatus extends User {
  status:         'active' | 'inactive'
  lastLogin:      string
  lastLoginIP:    string
  activeSessions: number
  totalLogins:    number
  createdAt:      string
  online:         boolean
  sessionStart?:  string
  browser?:       string
  activities:     UserActivity[]
}

