import type {
  ProductionBatch, BatchStatus, DailyVolumeEntry,
  DowntimeEvent, EquipmentDowntimeStat, DowntimeTimelineEntry, DowntimeCategoryEntry,
  CraneUtilizationData, CraneActivityData, LoadBucket, HeatmapCell, CraneComparisonMetric,
  AlarmFrequencyEntry, HourlyAlarmEntry, AlarmSourceStat,
  AlarmHeatmapCell, RecurringAlarm, AlarmReportKpis,
  ResponseTimeStat, ResponseTimeBucket,
} from '@/types'

// ─── Daily Volume — Last 7 Days ───────────────────────────────────────────────

export const mockDailyVolume: DailyVolumeEntry[] = [
  { date: 'May 03', line1:  8, line2:  6 },
  { date: 'May 04', line1: 12, line2:  9 },
  { date: 'May 05', line1:  7, line2:  5 },
  { date: 'May 06', line1: 14, line2: 11 },
  { date: 'May 07', line1: 10, line2:  8 },
  { date: 'May 08', line1: 11, line2:  9 },
  { date: 'May 09', line1:  9, line2:  7 },
]

// ─── Recipe Mix ───────────────────────────────────────────────────────────────

export const mockRecipeMix = [
  { name: 'ZINC STANDARD',    batches: 68, pct: 47.9, color: '#4fc3f7' },
  { name: 'PHOSPHATE LIGHT',  batches: 48, pct: 33.8, color: '#e8a23a' },
  { name: 'HEAVY DEGREASING', batches: 26, pct: 18.3, color: '#ffa726' },
]

// ─── Line Efficiency ──────────────────────────────────────────────────────────

export const mockLineEfficiency = [
  { metric: 'Utilization',    line1: 87,  line2: 79,  line1Label: '87%',    line2Label: '79%'    },
  { metric: 'On-Time Rate',   line1: 96,  line2: 92,  line1Label: '96%',    line2Label: '92%'    },
  { metric: 'Cycle Time %',   line1: 80,  line2: 95,  line1Label: '48 min', line2Label: '57 min' },
]

export const mockLineSummary = {
  line1: { utilization: '87%', onTimeRate: '96%', avgCycleTime: '48 min', batchesCompleted: 80, bestRecipe: 'ZINC STD'   },
  line2: { utilization: '79%', onTimeRate: '92%', avgCycleTime: '57 min', batchesCompleted: 62, bestRecipe: 'PHOSPHATE'  },
}

// ─── Batch Generation ─────────────────────────────────────────────────────────

const RECIPES: { id: string; name: string }[] = [
  { id: 'r1', name: 'ZINC STANDARD'    },
  { id: 'r2', name: 'PHOSPHATE LIGHT'  },
  { id: 'r3', name: 'HEAVY DEGREASING' },
]

const LINES:   ('LINE-1' | 'LINE-2')[] = ['LINE-1', 'LINE-2']
const CRANES:  string[]                 = ['C1', 'C2', 'C3', 'C4']
const STATUS_POOL: BatchStatus[]        = [
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'failed',    'cancelled',
]

function pad(n: number, size = 3): string {
  return n.toString().padStart(size, '0')
}

function fmtCycle(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${pad(h, 2)}:${pad(m, 2)}:00`
}

function fmtDateTime(d: Date): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const mo  = months[d.getMonth()]
  const day = pad(d.getDate(), 2)
  const hr  = pad(d.getHours(), 2)
  const mn  = pad(d.getMinutes(), 2)
  return `${day} ${mo} ${d.getFullYear()} ${hr}:${mn}`
}

function generateBatch(idx: number): ProductionBatch {
  const rIdx    = (idx * 3 + 7) % 3
  const lIdx    = idx % 2
  const cIdx    = idx % 4
  const sIdx    = idx % 10

  const recipe  = RECIPES[rIdx]
  const line    = LINES[lIdx]
  const crane   = CRANES[cIdx]
  const status  = STATUS_POOL[sIdx]
  const parts   = 6 + (idx % 7)
  const onTime  = status === 'failed' ? false : (idx % 8 !== 3)

  const dayOffset     = Math.floor(idx / 20)
  const hourOfDay     = (4 + (idx % 14)) % 24
  const minuteOfHour  = (idx * 13) % 60

  const startDate = new Date('2026-05-09T00:00:00Z')
  startDate.setUTCDate(startDate.getUTCDate() - dayOffset)
  startDate.setUTCHours(hourOfDay, minuteOfHour, 0, 0)

  const cycleMinutes = onTime ? 45 + (idx % 20) : 90 + (idx % 60)
  const endDate      = new Date(startDate.getTime() + cycleMinutes * 60_000)

  return {
    id:          `JOB-${pad(idx + 1)}`,
    recipeId:    recipe.id,
    recipeName:  recipe.name,
    line,
    crane,
    parts,
    startedAt:   fmtDateTime(startDate),
    completedAt: fmtDateTime(endDate),
    cycleTime:   fmtCycle(cycleMinutes),
    onTime,
    status,
  }
}

// ─── Explicit first 10 rows (from spec) ──────────────────────────────────────

const EXPLICIT_BATCHES: ProductionBatch[] = [
  { id: 'JOB-001', recipeId: 'r1', recipeName: 'ZINC STANDARD',    line: 'LINE-1', crane: 'C1', parts:  8, startedAt: '09 May 2026 07:00', completedAt: '09 May 2026 08:00', cycleTime: '01:00:00', onTime: true,  status: 'completed' },
  { id: 'JOB-002', recipeId: 'r2', recipeName: 'PHOSPHATE LIGHT',  line: 'LINE-2', crane: 'C3', parts:  6, startedAt: '09 May 2026 07:10', completedAt: '09 May 2026 07:58', cycleTime: '00:48:00', onTime: true,  status: 'completed' },
  { id: 'JOB-003', recipeId: 'r1', recipeName: 'ZINC STANDARD',    line: 'LINE-1', crane: 'C1', parts:  9, startedAt: '09 May 2026 07:30', completedAt: '09 May 2026 08:35', cycleTime: '01:05:00', onTime: false, status: 'completed' },
  { id: 'JOB-004', recipeId: 'r3', recipeName: 'HEAVY DEGREASING', line: 'LINE-1', crane: 'C2', parts: 10, startedAt: '09 May 2026 06:00', completedAt: '09 May 2026 07:38', cycleTime: '01:38:00', onTime: true,  status: 'completed' },
  { id: 'JOB-005', recipeId: 'r2', recipeName: 'PHOSPHATE LIGHT',  line: 'LINE-2', crane: 'C3', parts:  6, startedAt: '09 May 2026 06:10', completedAt: '09 May 2026 07:02', cycleTime: '00:52:00', onTime: true,  status: 'completed' },
  { id: 'JOB-006', recipeId: 'r1', recipeName: 'ZINC STANDARD',    line: 'LINE-1', crane: 'C1', parts:  8, startedAt: '09 May 2026 05:30', completedAt: '09 May 2026 06:32', cycleTime: '01:02:00', onTime: true,  status: 'completed' },
  { id: 'JOB-007', recipeId: 'r2', recipeName: 'PHOSPHATE LIGHT',  line: 'LINE-2', crane: 'C4', parts:  7, startedAt: '09 May 2026 05:00', completedAt: '09 May 2026 05:55', cycleTime: '00:55:00', onTime: true,  status: 'completed' },
  { id: 'JOB-008', recipeId: 'r1', recipeName: 'ZINC STANDARD',    line: 'LINE-1', crane: 'C2', parts:  9, startedAt: '09 May 2026 04:00', completedAt: '09 May 2026 05:48', cycleTime: '01:48:00', onTime: false, status: 'failed'    },
  { id: 'JOB-009', recipeId: 'r3', recipeName: 'HEAVY DEGREASING', line: 'LINE-1', crane: 'C1', parts: 11, startedAt: '09 May 2026 03:00', completedAt: '09 May 2026 04:38', cycleTime: '01:38:00', onTime: true,  status: 'completed' },
  { id: 'JOB-010', recipeId: 'r2', recipeName: 'PHOSPHATE LIGHT',  line: 'LINE-2', crane: 'C3', parts:  6, startedAt: '09 May 2026 02:30', completedAt: '09 May 2026 03:22', cycleTime: '00:52:00', onTime: true,  status: 'cancelled' },
]

// ─── Generate remaining 132 batches ──────────────────────────────────────────

const GENERATED_BATCHES: ProductionBatch[] = Array.from({ length: 132 }, (_, i) =>
  generateBatch(i + 10)
).map((b, i) => ({ ...b, id: `JOB-${pad(i + 11)}` }))

export const mockProductionBatches: ProductionBatch[] = [
  ...EXPLICIT_BATCHES,
  ...GENERATED_BATCHES,
]

// ─── Downtime Timeline ────────────────────────────────────────────────────────

export const mockDowntimeTimeline: DowntimeTimelineEntry[] = [
  { date: 'May 03', motion: 15, communication:  0, planned: 60, process:  5, sensor:  0 },
  { date: 'May 04', motion: 28, communication: 12, planned:  0, process: 10, sensor:  5 },
  { date: 'May 05', motion:  0, communication:  0, planned: 60, process:  0, sensor:  0 },
  { date: 'May 06', motion: 42, communication:  0, planned:  0, process:  8, sensor:  3 },
  { date: 'May 07', motion:  5, communication:  8, planned:  0, process:  0, sensor:  0 },
  { date: 'May 08', motion: 12, communication:  0, planned: 60, process:  0, sensor:  7 },
  { date: 'May 09', motion: 20, communication: 14, planned:  0, process:  5, sensor:  0 },
]

// ─── Downtime by Category ─────────────────────────────────────────────────────

export const mockDowntimeCategories: DowntimeCategoryEntry[] = [
  { category: 'Planned maint.',  totalMinutes: 180, events: 3, avgMinutes: 60.0 },
  { category: 'Motion fault',    totalMinutes: 122, events: 8, avgMinutes: 15.3 },
  { category: 'Communication',   totalMinutes:  34, events: 4, avgMinutes:  8.5 },
  { category: 'Process fault',   totalMinutes:  28, events: 5, avgMinutes:  5.6 },
  { category: 'Sensor fault',    totalMinutes:  15, events: 3, avgMinutes:  5.0 },
]

// ─── Equipment Downtime Stats ─────────────────────────────────────────────────

export const mockEquipmentStats: EquipmentDowntimeStat[] = [
  {
    id: 'CRANE-1', name: 'CRANE-1', type: 'crane',
    downtimeMinutes: 52, eventCount: 6, availability: 97.4,
    mtbf: '28h 10m', lastFault: 'Motion timeout',  lastFaultAt: '08:14 May 09', status: 'online',
  },
  {
    id: 'CRANE-2', name: 'CRANE-2', type: 'crane',
    downtimeMinutes: 20, eventCount: 2, availability: 98.8,
    mtbf: '42h 00m', lastFault: 'Speed reduced',   lastFaultAt: '06:15 May 07', status: 'online',
  },
  {
    id: 'CRANE-3', name: 'CRANE-3', type: 'crane',
    downtimeMinutes: 15, eventCount: 2, availability: 99.1,
    mtbf: '36h 20m', lastFault: 'Zone conflict',   lastFaultAt: '06:30 May 09', status: 'online',
  },
  {
    id: 'CRANE-4', name: 'CRANE-4', type: 'crane',
    downtimeMinutes: 38, eventCount: 4, availability: 97.8,
    mtbf: '24h 15m', lastFault: 'Motion timeout',  lastFaultAt: '05:30 May 08', status: 'online',
  },
  {
    id: 'PLC-LINE1', name: 'PLC-LINE1', type: 'plc',
    downtimeMinutes: 22, eventCount: 3, availability: 98.7,
    mtbf: '56h 00m', lastFault: 'Comm failure',    lastFaultAt: '05:10 May 08', status: 'online',
  },
  {
    id: 'PLC-LINE2', name: 'PLC-LINE2', type: 'plc',
    downtimeMinutes: 25, eventCount: 2, availability: 98.5,
    mtbf: '48h 30m', lastFault: 'Comm failure',    lastFaultAt: '08:10 May 09', status: 'online',
  },
]

// ─── Downtime Events (23 total) ───────────────────────────────────────────────

export const mockDowntimeEvents: DowntimeEvent[] = [
  // ── Page 1 — May 09 ──────────────────────────────────────────────────────
  {
    id: 'DT-001', date: 'May 09', startTime: '08:14:22', endTime: '08:20:36',
    duration: '06:14', durationMinutes: 6.2,
    equipment: 'CRANE-1', category: 'Motion',
    cause: 'Motion timeout at 3,200mm',
    impactedBatches: 2, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-001',
    fullDescription: 'Motion timeout — CRANE-1 failed to reach target position 3,200mm → 4,800mm within 30 second limit.',
    faultCode: 'E-0x4A12',
    batchesAffected: ['JOB-001', 'JOB-003'],
    resolution: 'Operator acknowledged fault. VFD reset. Normal operation resumed.',
    preventiveAction: 'Schedule VFD-01 inspection within 48 hours.',
  },
  {
    id: 'DT-002', date: 'May 09', startTime: '08:10:05', endTime: '08:21:00',
    duration: '10:55', durationMinutes: 10.9,
    equipment: 'PLC-LINE2', category: 'Communication',
    cause: 'PLC communication failure',
    impactedBatches: 3, resolvedBy: 'Marc Dupont', alarmRef: 'ALM-002',
    fullDescription: 'PLC-LINE2 lost Ethernet communication with SCADA. Automatic reconnect failed twice before manual reset.',
    faultCode: 'E-0x1C08',
    batchesAffected: ['JOB-002', 'JOB-005', 'JOB-007'],
    resolution: 'Network switch rebooted. PLC reconnected automatically after 90 seconds.',
    preventiveAction: 'Replace aging network switch SW-12 during next maintenance window.',
  },
  {
    id: 'DT-003', date: 'May 09', startTime: '06:45:10', endTime: '06:50:30',
    duration: '05:20', durationMinutes: 5.3,
    equipment: 'CRANE-3', category: 'Motion',
    cause: 'Emergency stop triggered',
    impactedBatches: 1, resolvedBy: 'Marc Dupont', alarmRef: 'ALM-006',
    fullDescription: 'CRANE-3 emergency stop triggered by operator during zone conflict. Crane halted at position 1,100mm.',
    faultCode: 'E-0x3F01',
    batchesAffected: ['JOB-007'],
    resolution: 'Zone cleared manually. E-stop reset by supervisor. Motion sequence restarted.',
    preventiveAction: 'Review zone interlock logic to prevent concurrent zone access.',
  },
  {
    id: 'DT-004', date: 'May 09', startTime: '06:30:00', endTime: '06:38:15',
    duration: '08:15', durationMinutes: 8.3,
    equipment: 'ZONE-B', category: 'Motion',
    cause: 'Zone conflict — CRANE-2/CRANE-3',
    impactedBatches: 2, resolvedBy: 'Marc Dupont', alarmRef: 'ALM-007',
    fullDescription: 'CRANE-2 and CRANE-3 simultaneously requested access to ZONE-B. Safety interlock activated and halted both units.',
    faultCode: 'E-0x3F04',
    batchesAffected: ['JOB-005', 'JOB-007'],
    resolution: 'Zone priority algorithm reassigned. CRANE-2 granted access. CRANE-3 queued.',
    preventiveAction: 'Update zone scheduler firmware to version 4.2.1.',
  },
  {
    id: 'DT-005', date: 'May 09', startTime: '06:00:00', endTime: '07:00:00',
    duration: '60:00', durationMinutes: 60,
    equipment: 'LINE-1', category: 'Planned',
    cause: 'Pre-shift maintenance window',
    impactedBatches: 0, resolvedBy: 'SYSTEM', alarmRef: '—',
    fullDescription: 'Scheduled pre-shift maintenance window for LINE-1. All cranes halted. PLC diagnostics run.',
    faultCode: '—',
    batchesAffected: [],
    resolution: 'Maintenance completed on schedule. Line returned to normal production.',
    preventiveAction: 'No corrective action required — planned event.',
  },
  {
    id: 'DT-006', date: 'May 09', startTime: '05:30:15', endTime: '05:35:00',
    duration: '04:45', durationMinutes: 4.8,
    equipment: 'CRANE-2', category: 'Motion',
    cause: 'Motion timeout at 800mm',
    impactedBatches: 1, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-011',
    fullDescription: 'CRANE-2 failed to reach bath position 800mm. Motor drive reported overcurrent during deceleration phase.',
    faultCode: 'E-0x4A08',
    batchesAffected: ['JOB-006'],
    resolution: 'Drive reset. Motion profile adjusted. Speed limit reduced to 85% for this crane.',
    preventiveAction: 'Inspect CRANE-2 cable chain and motor drive contacts.',
  },
  {
    id: 'DT-007', date: 'May 09', startTime: '05:10:00', endTime: '05:25:00',
    duration: '15:00', durationMinutes: 15,
    equipment: 'PLC-LINE1', category: 'Communication',
    cause: 'PLC communication failure',
    impactedBatches: 2, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-012',
    fullDescription: 'PLC-LINE1 Modbus TCP connection dropped. SCADA entered safe-hold mode for all LINE-1 equipment.',
    faultCode: 'E-0x1C02',
    batchesAffected: ['JOB-004', 'JOB-006'],
    resolution: 'PLC firmware watchdog timeout cleared. Communication restored after cold restart.',
    preventiveAction: 'Schedule PLC firmware update to v3.8.4 — includes improved watchdog handling.',
  },
  {
    id: 'DT-008', date: 'May 09', startTime: '04:40:00', endTime: '05:10:00',
    duration: '30:00', durationMinutes: 30,
    equipment: 'CRANE-4', category: 'Sensor',
    cause: 'Encoder warning threshold',
    impactedBatches: 1, resolvedBy: 'John Carter', alarmRef: 'ALM-014',
    fullDescription: 'CRANE-4 absolute encoder reported position drift of 3.2mm over 20 movements. Warning threshold exceeded. Auto-calibration triggered.',
    faultCode: 'E-0x5B01',
    batchesAffected: ['JOB-009'],
    resolution: 'Auto-calibration completed. Encoder position reset to reference. Position accuracy verified.',
    preventiveAction: 'Inspect encoder coupling and cable shielding on CRANE-4.',
  },
  {
    id: 'DT-009', date: 'May 09', startTime: '04:25:10', endTime: '04:48:00',
    duration: '22:50', durationMinutes: 22.8,
    equipment: 'TANK-04', category: 'Process',
    cause: 'Tank level low',
    impactedBatches: 1, resolvedBy: 'John Carter', alarmRef: 'ALM-015',
    fullDescription: 'TANK-04 chemical level dropped below minimum operating threshold (15L remaining vs 50L minimum). Process aborted.',
    faultCode: 'E-0x2D05',
    batchesAffected: ['JOB-009'],
    resolution: 'Tank refilled from reserve supply. Level sensor recalibrated. Process restarted.',
    preventiveAction: 'Review chemical consumption schedule. Increase refill frequency for TANK-04.',
  },
  {
    id: 'DT-010', date: 'May 09', startTime: '03:00:00', endTime: '04:00:00',
    duration: '60:00', durationMinutes: 60,
    equipment: 'LINE-2', category: 'Planned',
    cause: 'Scheduled line cleaning',
    impactedBatches: 0, resolvedBy: 'SYSTEM', alarmRef: '—',
    fullDescription: 'Scheduled chemical bath cleaning and tank solution replacement for LINE-2. All baths flushed and refilled.',
    faultCode: '—',
    batchesAffected: [],
    resolution: 'Cleaning completed on schedule. All tank levels verified. LINE-2 returned to service.',
    preventiveAction: 'No corrective action required — planned event.',
  },

  // ── Page 2 — May 08 / May 07 ─────────────────────────────────────────────
  {
    id: 'DT-011', date: 'May 08', startTime: '07:22:00', endTime: '07:30:00',
    duration: '08:00', durationMinutes: 8,
    equipment: 'CRANE-1', category: 'Motion',
    cause: 'Overload protection triggered',
    impactedBatches: 1, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-018',
    fullDescription: 'CRANE-1 hoist load cell detected overload (112% of rated capacity). Motion halted automatically.',
    faultCode: 'E-0x4B03',
    batchesAffected: ['JOB-021'],
    resolution: 'Load redistributed. Overload condition cleared. Normal operation resumed.',
    preventiveAction: 'Inspect load cell calibration on CRANE-1 hoist.',
  },
  {
    id: 'DT-012', date: 'May 08', startTime: '06:00:00', endTime: '07:00:00',
    duration: '60:00', durationMinutes: 60,
    equipment: 'LINE-1', category: 'Planned',
    cause: 'Pre-shift maintenance window',
    impactedBatches: 0, resolvedBy: 'SYSTEM', alarmRef: '—',
    fullDescription: 'Scheduled pre-shift maintenance window for LINE-1.',
    faultCode: '—',
    batchesAffected: [],
    resolution: 'Maintenance completed on schedule.',
    preventiveAction: 'No corrective action required — planned event.',
  },
  {
    id: 'DT-013', date: 'May 08', startTime: '05:44:00', endTime: '05:51:00',
    duration: '07:00', durationMinutes: 7,
    equipment: 'CRANE-4', category: 'Sensor',
    cause: 'Encoder warning level 2',
    impactedBatches: 1, resolvedBy: 'John Carter', alarmRef: 'ALM-019',
    fullDescription: 'CRANE-4 encoder drift reached level-2 threshold. Position accuracy compromised for precision tasks.',
    faultCode: 'E-0x5B02',
    batchesAffected: ['JOB-025'],
    resolution: 'Manual calibration sequence run. Drift corrected.',
    preventiveAction: 'Schedule encoder replacement within 30 days.',
  },
  {
    id: 'DT-014', date: 'May 08', startTime: '04:10:00', endTime: '04:17:00',
    duration: '07:00', durationMinutes: 7,
    equipment: 'PLC-LINE1', category: 'Communication',
    cause: 'Heartbeat timeout',
    impactedBatches: 2, resolvedBy: 'Marc Dupont', alarmRef: 'ALM-020',
    fullDescription: 'PLC-LINE1 watchdog heartbeat missed for 3 consecutive cycles. SCADA declared PLC unresponsive.',
    faultCode: 'E-0x1C10',
    batchesAffected: ['JOB-027', 'JOB-028'],
    resolution: 'PLC watchdog timer reset. Communication re-established without full restart.',
    preventiveAction: 'Investigate intermittent CPU load spikes on PLC-LINE1.',
  },
  {
    id: 'DT-015', date: 'May 07', startTime: '09:12:00', endTime: '09:17:00',
    duration: '05:00', durationMinutes: 5,
    equipment: 'CRANE-1', category: 'Motion',
    cause: 'Overspeed fault cleared',
    impactedBatches: 1, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-021',
    fullDescription: 'CRANE-1 travel speed exceeded 105% of set speed during empty return. VFD overspeed protection activated.',
    faultCode: 'E-0x4C01',
    batchesAffected: ['JOB-033'],
    resolution: 'VFD parameter P04.12 (overspeed threshold) verified and corrected to 102%.',
    preventiveAction: 'Audit all VFD overspeed parameters during next PM.',
  },
  {
    id: 'DT-016', date: 'May 07', startTime: '07:30:00', endTime: '07:38:00',
    duration: '08:00', durationMinutes: 8,
    equipment: 'PLC-LINE2', category: 'Communication',
    cause: 'PLC comm timeout',
    impactedBatches: 1, resolvedBy: 'Marc Dupont', alarmRef: 'ALM-022',
    fullDescription: 'PLC-LINE2 Ethernet adapter reported collision overflow. TCP connection dropped.',
    faultCode: 'E-0x1C06',
    batchesAffected: ['JOB-035'],
    resolution: 'Network cable replaced. Ethernet adapter buffer cleared.',
    preventiveAction: 'Replace patch cable from PLC-LINE2 to patch panel.',
  },

  // ── Page 3 — May 06 / May 05 / May 04 / May 03 ───────────────────────────
  {
    id: 'DT-017', date: 'May 06', startTime: '08:45:00', endTime: '09:27:00',
    duration: '42:00', durationMinutes: 42,
    equipment: 'CRANE-1', category: 'Motion',
    cause: 'Motion timeout in zone A',
    impactedBatches: 2, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-025',
    fullDescription: 'CRANE-1 failed to complete approach motion in ZONE-A within 45-second limit. Retried twice before halting.',
    faultCode: 'E-0x4A14',
    batchesAffected: ['JOB-041', 'JOB-042'],
    resolution: 'Mechanical inspection found partial brake drag. Brake adjusted.',
    preventiveAction: 'Full brake system inspection scheduled for next maintenance slot.',
  },
  {
    id: 'DT-018', date: 'May 06', startTime: '07:55:00', endTime: '08:03:00',
    duration: '08:00', durationMinutes: 8,
    equipment: 'CRANE-4', category: 'Process',
    cause: 'Process abort — liquid level',
    impactedBatches: 1, resolvedBy: 'John Carter', alarmRef: 'ALM-026',
    fullDescription: 'CRANE-4 aborted immersion sequence — TANK-09 level sensor reported out-of-range value.',
    faultCode: 'E-0x2D09',
    batchesAffected: ['JOB-044'],
    resolution: 'Level sensor cable re-seated. Sensor reading stabilised.',
    preventiveAction: 'Replace TANK-09 level sensor at next opportunity.',
  },
  {
    id: 'DT-019', date: 'May 06', startTime: '06:10:00', endTime: '06:13:00',
    duration: '03:00', durationMinutes: 3,
    equipment: 'CRANE-3', category: 'Sensor',
    cause: 'Position sensor fault',
    impactedBatches: 1, resolvedBy: 'Marc Dupont', alarmRef: 'ALM-027',
    fullDescription: 'CRANE-3 proximity sensor at bath entry reported inconsistent state — toggled 4 times in 2 seconds.',
    faultCode: 'E-0x5A03',
    batchesAffected: ['JOB-046'],
    resolution: 'Sensor cleaned and re-aligned. Signal verified stable.',
    preventiveAction: 'Clean all proximity sensors monthly as part of PM schedule.',
  },
  {
    id: 'DT-020', date: 'May 05', startTime: '06:00:00', endTime: '07:00:00',
    duration: '60:00', durationMinutes: 60,
    equipment: 'LINE-1', category: 'Planned',
    cause: 'Pre-shift maintenance window',
    impactedBatches: 0, resolvedBy: 'SYSTEM', alarmRef: '—',
    fullDescription: 'Scheduled pre-shift maintenance window for LINE-1.',
    faultCode: '—',
    batchesAffected: [],
    resolution: 'Maintenance completed on schedule.',
    preventiveAction: 'No corrective action required — planned event.',
  },
  {
    id: 'DT-021', date: 'May 04', startTime: '09:10:00', endTime: '09:22:00',
    duration: '12:00', durationMinutes: 12,
    equipment: 'CRANE-4', category: 'Motion',
    cause: 'Motion fault at position limit',
    impactedBatches: 1, resolvedBy: 'John Carter', alarmRef: 'ALM-031',
    fullDescription: 'CRANE-4 reached software position limit unexpectedly. Origin reference lost after power dip.',
    faultCode: 'E-0x4A20',
    batchesAffected: ['JOB-058'],
    resolution: 'Reference run performed. Origin position re-established.',
    preventiveAction: 'Install UPS on CRANE-4 controller to prevent power-dip origin loss.',
  },
  {
    id: 'DT-022', date: 'May 04', startTime: '08:15:00', endTime: '08:25:00',
    duration: '10:00', durationMinutes: 10,
    equipment: 'PLC-LINE1', category: 'Communication',
    cause: 'Network packet loss',
    impactedBatches: 2, resolvedBy: 'Sarah Mills', alarmRef: 'ALM-032',
    fullDescription: 'Excessive packet loss (>25%) on PLC-LINE1 Ethernet link caused repeated timeouts.',
    faultCode: 'E-0x1C14',
    batchesAffected: ['JOB-060', 'JOB-061'],
    resolution: 'Faulty cable connector crimped and replaced. Packet loss eliminated.',
    preventiveAction: 'Audit all PLC Ethernet cable terminations.',
  },
  {
    id: 'DT-023', date: 'May 03', startTime: '06:00:00', endTime: '07:00:00',
    duration: '60:00', durationMinutes: 60,
    equipment: 'LINE-2', category: 'Planned',
    cause: 'Scheduled line inspection',
    impactedBatches: 0, resolvedBy: 'SYSTEM', alarmRef: '—',
    fullDescription: 'Scheduled weekly inspection of LINE-2 chemistry baths, tanks, and lifting equipment.',
    faultCode: '—',
    batchesAffected: [],
    resolution: 'Inspection completed. No issues found. Line returned to service.',
    preventiveAction: 'No corrective action required — planned event.',
  },
]

// ─── Crane Utilization — Per-Crane Summary ────────────────────────────────────

export const mockCraneUtilization: CraneUtilizationData[] = [
  { id: 'CRANE-1', line: 'LINE-1', status: 'moving',  activePct: 87.4, idlePct: 8.2,  faultPct: 4.4  },
  { id: 'CRANE-2', line: 'LINE-1', status: 'idle',    activePct: 79.1, idlePct: 18.5, faultPct: 2.4  },
  { id: 'CRANE-3', line: 'LINE-2', status: 'loading', activePct: 84.2, idlePct: 12.3, faultPct: 3.5  },
  { id: 'CRANE-4', line: 'LINE-2', status: 'error',   activePct: 68.9, idlePct: 16.8, faultPct: 14.3 },
]

// ─── Activity Breakdown — Fleet + Per-Crane Daily Data ────────────────────────

const FLEET_DAYS = [
  { date: 'May 03', active: 76.2, idle: 10.4, fault: 5.8, maintenance: 3.6 },
  { date: 'May 04', active: 81.4, idle:  8.2, fault: 4.4, maintenance: 2.0 },
  { date: 'May 05', active: 74.8, idle: 12.6, fault: 4.6, maintenance: 4.0 },
  { date: 'May 06', active: 83.1, idle:  7.8, fault: 4.1, maintenance: 1.0 },
  { date: 'May 07', active: 79.5, idle:  9.4, fault: 3.1, maintenance: 4.0 },
  { date: 'May 08', active: 80.2, idle:  8.8, fault: 5.0, maintenance: 2.0 },
  { date: 'May 09', active: 41.6, idle:  5.2, fault: 2.8, maintenance: 2.4 },
]

// Per-crane: proportional split of fleet totals with unique profile
const CRANE1_DAYS = [
  { date: 'May 03', active: 20.4, idle: 2.2, fault: 0.9, maintenance: 0.5 },
  { date: 'May 04', active: 22.1, idle: 1.6, fault: 0.3, maintenance: 0.0 },
  { date: 'May 05', active: 19.8, idle: 2.8, fault: 1.0, maintenance: 0.4 },
  { date: 'May 06', active: 22.6, idle: 1.0, fault: 0.4, maintenance: 0.0 },
  { date: 'May 07', active: 21.0, idle: 1.8, fault: 0.5, maintenance: 0.7 },
  { date: 'May 08', active: 20.9, idle: 2.0, fault: 0.8, maintenance: 0.3 },
  { date: 'May 09', active: 11.5, idle: 1.2, fault: 0.6, maintenance: 0.7 },
]

const CRANE2_DAYS = [
  { date: 'May 03', active: 18.1, idle: 3.8, fault: 1.2, maintenance: 0.9 },
  { date: 'May 04', active: 19.4, idle: 3.0, fault: 1.0, maintenance: 0.6 },
  { date: 'May 05', active: 17.2, idle: 4.1, fault: 1.3, maintenance: 1.4 },
  { date: 'May 06', active: 20.1, idle: 2.8, fault: 0.8, maintenance: 0.3 },
  { date: 'May 07', active: 19.0, idle: 3.2, fault: 0.6, maintenance: 1.2 },
  { date: 'May 08', active: 19.6, idle: 3.0, fault: 1.0, maintenance: 0.4 },
  { date: 'May 09', active:  9.8, idle: 1.8, fault: 0.6, maintenance: 0.8 },
]

const CRANE3_DAYS = [
  { date: 'May 03', active: 20.0, idle: 2.8, fault: 1.6, maintenance: 1.6 },
  { date: 'May 04', active: 21.6, idle: 2.0, fault: 1.2, maintenance: 1.2 },
  { date: 'May 05', active: 19.6, idle: 3.4, fault: 1.0, maintenance: 2.0 },
  { date: 'May 06', active: 21.8, idle: 2.4, fault: 1.4, maintenance: 0.4 },
  { date: 'May 07', active: 20.8, idle: 3.0, fault: 0.8, maintenance: 1.4 },
  { date: 'May 08', active: 21.2, idle: 2.4, fault: 1.4, maintenance: 1.0 },
  { date: 'May 09', active: 11.2, idle: 1.4, fault: 0.8, maintenance: 1.6 },
]

const CRANE4_DAYS = [
  { date: 'May 03', active: 17.7, idle: 3.6, fault: 3.6, maintenance: 1.1 },
  { date: 'May 04', active: 18.3, idle: 3.2, fault: 2.8, maintenance: 1.7 },
  { date: 'May 05', active: 18.2, idle: 2.8, fault: 2.8, maintenance: 2.2 },
  { date: 'May 06', active: 18.6, idle: 2.4, fault: 2.0, maintenance: 1.0 },
  { date: 'May 07', active: 18.7, idle: 2.8, fault: 1.4, maintenance: 1.1 },
  { date: 'May 08', active: 18.5, idle: 2.6, fault: 2.2, maintenance: 0.7 },
  { date: 'May 09', active:  9.1, idle: 1.4, fault: 1.2, maintenance: 0.3 },
]

export const mockActivityBreakdown: CraneActivityData[] = [
  { craneId: 'fleet',   days: FLEET_DAYS  },
  { craneId: 'CRANE-1', days: CRANE1_DAYS },
  { craneId: 'CRANE-2', days: CRANE2_DAYS },
  { craneId: 'CRANE-3', days: CRANE3_DAYS },
  { craneId: 'CRANE-4', days: CRANE4_DAYS },
]

// ─── Load Distribution — Transfer Load Buckets ────────────────────────────────

export const mockLoadDistribution: LoadBucket[] = [
  { range: '0–100',   transfers:  45, color: 'status-idle'    },
  { range: '100–200', transfers:  89, color: 'accent-primary' },
  { range: '200–300', transfers: 156, color: 'accent-primary' },
  { range: '300–400', transfers: 312, color: 'accent-primary' },
  { range: '400–500', transfers: 428, color: 'accent-primary' },
  { range: '500–600', transfers: 287, color: 'accent-primary' },
  { range: '600–700', transfers: 198, color: 'status-warning' },
  { range: '700–800', transfers:  89, color: 'status-warning' },
  { range: '800+',    transfers:  23, color: 'status-alarm'   },
]

// ─── Movement Heatmap ──────────────────────────────────────────────────────────

const TANK_LABELS: Record<number, string> = {
  0:    'T1',
  1000: 'T2',
  2000: 'T3',
  3000: 'T4',
  4000: 'T5',
  5000: 'T6',
  6000: 'T7',
  7000: 'T8',
  8000: 'T9',
}

function makeHeatmapRow(
  craneId: string,
  intensities: number[],    // 9 values 0–1
  transferCounts: number[], // 9 values
): HeatmapCell[] {
  return intensities.map((intensity, i) => {
    const positionMm = i * 1000
    const dwellHours = parseFloat((intensity * 6.8).toFixed(1))
    return {
      craneId,
      positionMm,
      tankLabel:  TANK_LABELS[positionMm] ?? `T${i + 1}`,
      dwellHours,
      transfers:  transferCounts[i],
      intensity,
    }
  })
}

export const mockMovementHeatmap: HeatmapCell[] = [
  ...makeHeatmapRow('CRANE-1',
    [0.15, 0.82, 0.91, 0.88, 0.12, 0.79, 0.84, 0.18, 0.08],
    [  12,   68,   74,   70,   10,   64,   69,   14,    6]),
  ...makeHeatmapRow('CRANE-2',
    [0.90, 0.85, 0.11, 0.08, 0.06, 0.10, 0.07, 0.05, 0.04],
    [  74,   69,    9,    7,    5,    8,    6,    4,    3]),
  ...makeHeatmapRow('CRANE-3',
    [0.07, 0.06, 0.09, 0.10, 0.08, 0.86, 0.92, 0.88, 0.12],
    [   6,    5,    7,    8,    7,   70,   75,   72,   10]),
  ...makeHeatmapRow('CRANE-4',
    [0.09, 0.11, 0.87, 0.84, 0.09, 0.07, 0.08, 0.06, 0.05],
    [   7,    9,   71,   68,    7,    6,    6,    5,    4]),
]

// ─── Crane Comparison Table Rows ──────────────────────────────────────────────

export const mockCraneComparisonRows: CraneComparisonMetric[] = [
  {
    metric: 'Line',          crane1: 'LINE-1', crane2: 'LINE-1', crane3: 'LINE-2', crane4: 'LINE-2', fleetAvg: '—',
    bestIndex: null, worstIndex: null,
  },
  {
    metric: 'Utilization',   crane1: '87.4%',  crane2: '79.1%',  crane3: '84.2%',  crane4: '68.9%',  fleetAvg: '79.9%',
    bestIndex: 0, worstIndex: 3,
  },
  {
    metric: 'Active Time',   crane1: '59.4h',  crane2: '53.8h',  crane3: '57.3h',  crane4: '46.8h',  fleetAvg: '54.3h',
    bestIndex: 0, worstIndex: 3,
  },
  {
    metric: 'Idle Time',     crane1: '5.6h',   crane2: '12.6h',  crane3: '8.4h',   crane4: '11.4h',  fleetAvg: '9.5h',
    bestIndex: 0, worstIndex: 1,
  },
  {
    metric: 'Fault Time',    crane1: '3.0h',   crane2: '1.6h',   crane3: '2.4h',   crane4: '9.7h',   fleetAvg: '4.2h',
    bestIndex: 1, worstIndex: 3,
  },
  {
    metric: 'Total Movements', crane1: '842',  crane2: '654',    crane3: '731',    crane4: '620',    fleetAvg: '711.8',
    bestIndex: 0, worstIndex: 3,
  },
  {
    metric: 'Total Distance', crane1: '48.2 km', crane2: '38.5 km', crane3: '52.1 km', crane4: '45.5 km', fleetAvg: '46.1 km',
    bestIndex: 2, worstIndex: 1,
  },
  {
    metric: 'Avg Load',      crane1: '435 kg', crane2: '398 kg', crane3: '421 kg', crane4: '384 kg', fleetAvg: '409 kg',
    bestIndex: 0, worstIndex: 3,
  },
  {
    metric: 'Max Load',      crane1: '820 kg', crane2: '760 kg', crane3: '810 kg', crane4: '740 kg', fleetAvg: '782 kg',
    bestIndex: 0, worstIndex: 3,
  },
  {
    metric: 'Faults',        crane1: '6',      crane2: '2',      crane3: '3',      crane4: '8',      fleetAvg: '4.75',
    bestIndex: 1, worstIndex: 3,
  },
  {
    metric: 'MTBF',          crane1: '26h 30m', crane2: '36h 00m', crane3: '32h 00m', crane4: '10h 30m', fleetAvg: '26h 15m',
    bestIndex: 1, worstIndex: 3,
  },
]

// ─── Alarm Report — KPIs ──────────────────────────────────────────────────────

export const mockAlarmReportKpis: AlarmReportKpis = {
  totalAlarms:     48,
  avgResponseTime: '4m 32s',
  nuisanceAlarms:  7,
  criticalRate:    '16.7%',
  unresolved:      2,
}

// ─── Alarm Frequency — Daily (7 days) ────────────────────────────────────────

export const mockAlarmFrequencyDaily: AlarmFrequencyEntry[] = [
  { date: 'May 03', critical: 1, high: 1, medium: 1, low: 1, total: 4 },
  { date: 'May 04', critical: 2, high: 2, medium: 2, low: 1, total: 7 },
  { date: 'May 05', critical: 1, high: 0, medium: 1, low: 1, total: 3 },
  { date: 'May 06', critical: 2, high: 1, medium: 4, low: 2, total: 9 },
  { date: 'May 07', critical: 1, high: 1, medium: 2, low: 1, total: 5 },
  { date: 'May 08', critical: 1, high: 1, medium: 3, low: 1, total: 6 },
  { date: 'May 09', critical: 0, high: 2, medium: 4, low: 2, total: 8 },
]

// ─── Alarm Frequency — Hourly (typical day) ───────────────────────────────────

export const mockHourlyAlarms: HourlyAlarmEntry[] = [
  { hour: '00:00', count: 0 },
  { hour: '01:00', count: 0 },
  { hour: '02:00', count: 1 },
  { hour: '03:00', count: 0 },
  { hour: '04:00', count: 0 },
  { hour: '05:00', count: 1 },
  { hour: '06:00', count: 3 },
  { hour: '07:00', count: 4 },
  { hour: '08:00', count: 5 },
  { hour: '09:00', count: 3 },
  { hour: '10:00', count: 2 },
  { hour: '11:00', count: 2 },
  { hour: '12:00', count: 1 },
  { hour: '13:00', count: 2 },
  { hour: '14:00', count: 2 },
  { hour: '15:00', count: 1 },
  { hour: '16:00', count: 3 },
  { hour: '17:00', count: 2 },
  { hour: '18:00', count: 1 },
  { hour: '19:00', count: 0 },
  { hour: '20:00', count: 1 },
  { hour: '21:00', count: 0 },
  { hour: '22:00', count: 0 },
  { hour: '23:00', count: 0 },
]

// ─── Alarm Sources ────────────────────────────────────────────────────────────

export const mockAlarmSources: AlarmSourceStat[] = [
  { rank: 1, source: 'CRANE-1',   type: 'crane',  count: 18, pct: 37.5, critical: 4, high: 3, medium: 8,  low: 3 },
  { rank: 2, source: 'PLC-LINE2', type: 'plc',    count:  8, pct: 16.7, critical: 1, high: 2, medium: 3,  low: 2 },
  { rank: 3, source: 'CRANE-4',   type: 'crane',  count:  7, pct: 14.6, critical: 2, high: 2, medium: 2,  low: 1 },
  { rank: 4, source: 'TANK-03',   type: 'tank',   count:  5, pct: 10.4, critical: 0, high: 1, medium: 3,  low: 1 },
  { rank: 5, source: 'CRANE-2',   type: 'crane',  count:  4, pct:  8.3, critical: 1, high: 1, medium: 1,  low: 1 },
  { rank: 6, source: 'ZONE-B',    type: 'zone',   count:  3, pct:  6.2, critical: 0, high: 1, medium: 2,  low: 0 },
  { rank: 7, source: 'PLC-LINE1', type: 'plc',    count:  3, pct:  6.2, critical: 0, high: 1, medium: 1,  low: 1 },
]

// ─── Response Time Buckets ────────────────────────────────────────────────────

export const mockResponseTimeBuckets: ResponseTimeBucket[] = [
  { label: '< 1 min',   count:  8, colorKey: 'ok'      },
  { label: '1–5 min',   count: 18, colorKey: 'primary'  },
  { label: '5–10 min',  count: 12, colorKey: 'gold'     },
  { label: '10–30 min', count:  7, colorKey: 'warning'  },
  { label: '> 30 min',  count:  3, colorKey: 'alarm'    },
]

// ─── Response Time Stats ──────────────────────────────────────────────────────

export const mockResponseTimeStats: ResponseTimeStat = {
  fastestAck:      '00:23',
  fastestBy:       'CRANE-1 alarm by Marc Dupont',
  slowestAck:      '47:12',
  slowestBy:       'Sensor fault by John Carter',
  median:          '03:45',
  withinTargetPct: 54.2,
}

// ─── Alarm Frequency Heatmap (24 × 7) ────────────────────────────────────────

// day: 0=Mon … 6=Sun, hour: 0–23
// Pattern: Mon–Fri 07–09 are peak hours (darkest cells)
// counts[hour][day] → alarm count

const HEATMAP_COUNTS: number[][] = [
  /* 00 */ [0, 0, 0, 0, 0, 0, 0],
  /* 01 */ [0, 0, 0, 0, 0, 0, 0],
  /* 02 */ [1, 0, 0, 0, 0, 0, 0],
  /* 03 */ [0, 0, 1, 0, 0, 0, 0],
  /* 04 */ [0, 0, 0, 0, 0, 0, 0],
  /* 05 */ [1, 0, 0, 1, 0, 0, 0],
  /* 06 */ [2, 2, 1, 2, 1, 0, 0],
  /* 07 */ [5, 4, 4, 4, 5, 0, 0],
  /* 08 */ [4, 5, 5, 4, 4, 0, 0],
  /* 09 */ [3, 2, 3, 3, 2, 0, 0],
  /* 10 */ [1, 2, 1, 2, 1, 0, 0],
  /* 11 */ [2, 1, 2, 1, 2, 0, 0],
  /* 12 */ [1, 1, 1, 1, 1, 0, 0],
  /* 13 */ [1, 2, 1, 1, 2, 0, 0],
  /* 14 */ [3, 1, 3, 1, 2, 0, 0],
  /* 15 */ [1, 1, 1, 1, 1, 0, 0],
  /* 16 */ [2, 2, 2, 2, 3, 0, 0],
  /* 17 */ [1, 1, 2, 1, 1, 0, 0],
  /* 18 */ [1, 0, 1, 0, 1, 0, 0],
  /* 19 */ [0, 0, 0, 0, 0, 0, 0],
  /* 20 */ [0, 1, 0, 0, 0, 0, 0],
  /* 21 */ [0, 0, 0, 0, 0, 0, 0],
  /* 22 */ [0, 0, 0, 0, 0, 0, 0],
  /* 23 */ [0, 0, 0, 0, 0, 0, 0],
]

function distributeSeverity(total: number): { critical: number; high: number; medium: number; low: number } {
  if (total === 0) return { critical: 0, high: 0, medium: 0, low: 0 }
  if (total === 1) return { critical: 0, high: 1, medium: 0, low: 0 }
  if (total === 2) return { critical: 1, high: 1, medium: 0, low: 0 }
  if (total === 3) return { critical: 1, high: 1, medium: 1, low: 0 }
  if (total === 4) return { critical: 2, high: 1, medium: 1, low: 0 }
  return                 { critical: 2, high: 1, medium: 1, low: 1 }
}

export const mockAlarmHeatmap: AlarmHeatmapCell[] = HEATMAP_COUNTS.flatMap((dayCounts, hour) =>
  dayCounts.map((total, day) => ({
    day,
    hour,
    total,
    ...distributeSeverity(total),
  }))
)

// ─── Recurring Alarms ─────────────────────────────────────────────────────────

export const mockRecurringAlarms: RecurringAlarm[] = [
  {
    id: 'RA-001', rank: 1,
    message: 'Motion timeout — CRANE-1',
    source: 'CRANE-1', category: 'Motion',
    triggers: 8, avgResponse: '04:12',
    firstSeen: 'May 03', lastSeen: 'May 09', trend: 'up',
    peakDay: 'May 06', peakHour: '08:00–09:00', avgPerDay: '1.14/day',
    lastOccurrences: [
      { timestamp: '08:14:22 May 09', acknowledgedIn: '06:14', acknowledgedBy: 'Sarah Mills'  },
      { timestamp: '05:30:15 May 08', acknowledgedIn: '04:45', acknowledgedBy: 'Sarah Mills'  },
      { timestamp: '07:22:10 May 06', acknowledgedIn: '03:20', acknowledgedBy: 'Marc Dupont'  },
    ],
    recommendation: 'Frequency increasing — consider checking CRANE-1 VFD and scheduling preventive maintenance. Consider raising motion timeout threshold from 30s to 45s if mechanical condition is verified.',
  },
  {
    id: 'RA-002', rank: 2,
    message: 'PLC comm failure',
    source: 'PLC-LINE2', category: 'Comm',
    triggers: 5, avgResponse: '08:45',
    firstSeen: 'May 04', lastSeen: 'May 09', trend: 'up',
    peakDay: 'May 09', peakHour: '08:00–09:00', avgPerDay: '0.71/day',
    lastOccurrences: [
      { timestamp: '08:10:05 May 09', acknowledgedIn: '10:55', acknowledgedBy: 'Marc Dupont'  },
      { timestamp: '07:30:00 May 07', acknowledgedIn: '08:00', acknowledgedBy: 'Marc Dupont'  },
      { timestamp: '08:15:00 May 04', acknowledgedIn: '10:00', acknowledgedBy: 'Sarah Mills'  },
    ],
    recommendation: 'Recurring communication failure on PLC-LINE2 — schedule network switch SW-12 replacement and audit cable terminations during next maintenance window.',
  },
  {
    id: 'RA-003', rank: 3,
    message: 'Tank occupied too long',
    source: 'TANK-03', category: 'Process',
    triggers: 4, avgResponse: '06:30',
    firstSeen: 'May 03', lastSeen: 'May 08', trend: 'stable',
    peakDay: 'May 06', peakHour: '14:00–16:00', avgPerDay: '0.57/day',
    lastOccurrences: [
      { timestamp: '14:10:00 May 08', acknowledgedIn: '05:12', acknowledgedBy: 'John Carter'  },
      { timestamp: '15:30:00 May 06', acknowledgedIn: '08:45', acknowledgedBy: 'John Carter'  },
      { timestamp: '14:00:00 May 04', acknowledgedIn: '06:15', acknowledgedBy: 'Marc Dupont'  },
    ],
    recommendation: 'Review recipe dwell time for TANK-03 — consider increasing crane priority for this bath to reduce overstay frequency.',
  },
  {
    id: 'RA-004', rank: 4,
    message: 'Recipe mismatch detected',
    source: 'SYSTEM', category: 'Recipe',
    triggers: 4, avgResponse: '02:15',
    firstSeen: 'May 05', lastSeen: 'May 09', trend: 'down',
    peakDay: 'May 07', peakHour: '07:00–08:00', avgPerDay: '0.57/day',
    lastOccurrences: [
      { timestamp: '07:05:00 May 09', acknowledgedIn: '01:50', acknowledgedBy: 'Sarah Mills'  },
      { timestamp: '07:30:00 May 07', acknowledgedIn: '02:30', acknowledgedBy: 'Sarah Mills'  },
      { timestamp: '06:10:00 May 05', acknowledgedIn: '02:25', acknowledgedBy: 'Marc Dupont'  },
    ],
    recommendation: 'Frequency decreasing — continue monitoring. Verify operator training on recipe assignment at shift start.',
  },
  {
    id: 'RA-005', rank: 5,
    message: 'Zone conflict detected',
    source: 'ZONE-B', category: 'Collision',
    triggers: 3, avgResponse: '05:48',
    firstSeen: 'May 05', lastSeen: 'May 07', trend: 'stable',
    peakDay: 'May 06', peakHour: '06:00–07:00', avgPerDay: '0.43/day',
    lastOccurrences: [
      { timestamp: '06:30:00 May 07', acknowledgedIn: '06:10', acknowledgedBy: 'Marc Dupont'  },
      { timestamp: '06:45:00 May 06', acknowledgedIn: '05:20', acknowledgedBy: 'Marc Dupont'  },
      { timestamp: '07:00:00 May 05', acknowledgedIn: '05:14', acknowledgedBy: 'Sarah Mills'  },
    ],
    recommendation: 'Update zone scheduler firmware to v4.2.1 to improve concurrent zone access management.',
  },
  {
    id: 'RA-006', rank: 6,
    message: 'Encoder warning — CRANE-4',
    source: 'CRANE-4', category: 'Sensor',
    triggers: 3, avgResponse: '09:22',
    firstSeen: 'May 06', lastSeen: 'May 09', trend: 'up',
    peakDay: 'May 08', peakHour: '05:00–06:00', avgPerDay: '0.43/day',
    lastOccurrences: [
      { timestamp: '04:40:00 May 09', acknowledgedIn: '30:00', acknowledgedBy: 'John Carter'  },
      { timestamp: '05:44:00 May 08', acknowledgedIn: '07:00', acknowledgedBy: 'John Carter'  },
      { timestamp: '09:10:00 May 06', acknowledgedIn: '07:10', acknowledgedBy: 'John Carter'  },
    ],
    recommendation: 'Inspect encoder coupling and cable shielding on CRANE-4. Schedule encoder replacement within 30 days.',
  },
  {
    id: 'RA-007', rank: 7,
    message: 'Speed reduced — CRANE-2',
    source: 'CRANE-2', category: 'Motion',
    triggers: 3, avgResponse: '03:05',
    firstSeen: 'May 03', lastSeen: 'May 07', trend: 'down',
    peakDay: 'May 05', peakHour: '05:00–06:00', avgPerDay: '0.43/day',
    lastOccurrences: [
      { timestamp: '05:30:15 May 07', acknowledgedIn: '02:30', acknowledgedBy: 'Sarah Mills'  },
      { timestamp: '04:10:00 May 05', acknowledgedIn: '03:20', acknowledgedBy: 'Marc Dupont'  },
      { timestamp: '05:15:00 May 03', acknowledgedIn: '03:25', acknowledgedBy: 'Marc Dupont'  },
    ],
    recommendation: 'Frequency decreasing after drive parameter adjustment on May 07. Continue monitoring speed profile.',
  },
]
