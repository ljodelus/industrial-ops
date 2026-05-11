// lib/simulation/engine.ts
// Simulation engine types, constants, initial state, and utility functions

export type SimStatus    = 'stopped' | 'running' | 'paused'
export type SimSpeed     = 1 | 2 | 5 | 10
export type SimEventType = 'MOVEMENT' | 'DWELL' | 'FAULT' | 'SYSTEM' | 'COMPLETE'

export interface SimCrane {
  id:             string
  name:           string
  position:       number       // mm
  targetPosition: number       // mm
  load:           number       // kg
  status:         'idle' | 'moving' | 'loading' | 'error' | 'offline'
  currentStep:    string       // e.g. "RINSE 1 (S3)"
  enabled:        boolean
  faulted:        boolean
}

export interface SimTank {
  id:            string
  number:        number
  name:          string
  occupied:      boolean
  currentPartId: string | null
  dwellElapsed:  number        // seconds
  dwellMax:      number        // seconds
  recipeName:    string
  stepLabel:     string        // e.g. "S2/S6"
}

export interface SimPart {
  id:         string
  recipeId:   string
  recipeName: string
  priority:   number
}

export interface SimEvent {
  id:        string
  timestamp: string      // HH:MM:SS (sim time)
  type:      SimEventType
  message:   string
}

export interface SensorOverrides {
  crane1EncoderOverride: boolean
  crane1EncoderValue:    number
  crane2EncoderOverride: boolean
  crane2EncoderValue:    number
  tank2OccupiedOverride: boolean
  tank2OccupiedValue:    boolean
  tank3OccupiedOverride: boolean
  tank3OccupiedValue:    boolean
  crane1LoadOverride:    boolean
  crane1LoadValue:       number
}

export interface TimerSettings {
  craneSpeedMpm:    number   // m/min base speed
  minDwellPct:      number   // % of recipe minimum dwell
  prefDwellPct:     number   // % of preferred dwell
  maxDwellPct:      number   // % of max dwell
  transferDelaySec: number   // delay between dwell complete and crane pickup
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatSimTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':')
}

export function formatDwellRemaining(elapsed: number, max: number): string {
  const remaining = Math.max(0, max - elapsed)
  const m = Math.floor(remaining / 60)
  const s = Math.floor(remaining % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 8 evenly-spaced tank positions in mm across a 8000mm rail */
export function getTankPositionsMm(count: number): number[] {
  const start = 300
  const end   = 7500
  if (count <= 1) return [Math.round((start + end) / 2)]
  return Array.from({ length: count }, (_, i) =>
    Math.round(start + (i / (count - 1)) * (end - start))
  )
}

// ─── Initial State (Tick ~2847 — simulation in progress) ─────────────────────

export const INITIAL_CRANES: SimCrane[] = [
  {
    id:             'CRANE-1',
    name:           'CRANE-1',
    position:       2400,
    targetPosition: 3200,
    load:           450,
    status:         'moving',
    currentStep:    'RINSE 1 (S3)',
    enabled:        true,
    faulted:        false,
  },
  {
    id:             'CRANE-2',
    name:           'CRANE-2',
    position:       800,
    targetPosition: 800,
    load:           0,
    status:         'idle',
    currentStep:    '—',
    enabled:        true,
    faulted:        false,
  },
]

export const INITIAL_TANKS: SimTank[] = [
  { id: 'T1', number: 1, name: 'LOAD',      occupied: false, currentPartId: null,     dwellElapsed: 0,   dwellMax: 0,   recipeName: '—',       stepLabel: '—'    },
  { id: 'T2', number: 2, name: 'DEGREASE',  occupied: true,  currentPartId: 'P-0042', dwellElapsed: 252, dwellMax: 480, recipeName: 'ZINC STD', stepLabel: 'S2/S6' },
  { id: 'T3', number: 3, name: 'RINSE 1',   occupied: true,  currentPartId: 'P-0039', dwellElapsed: 45,  dwellMax: 90,  recipeName: 'ZINC STD', stepLabel: 'S3/S6' },
  { id: 'T4', number: 4, name: 'ZINC BATH', occupied: true,  currentPartId: 'P-0041', dwellElapsed: 350, dwellMax: 720, recipeName: 'ZINC STD', stepLabel: 'S4/S6' },
  { id: 'T5', number: 5, name: 'RINSE 2',   occupied: false, currentPartId: null,     dwellElapsed: 0,   dwellMax: 90,  recipeName: '—',       stepLabel: '—'    },
  { id: 'T6', number: 6, name: 'UNLOAD',    occupied: false, currentPartId: null,     dwellElapsed: 0,   dwellMax: 0,   recipeName: '—',       stepLabel: '—'    },
]

export const INITIAL_PARTS: SimPart[] = [
  { id: 'P-0042', recipeId: 'recipe-1', recipeName: 'ZINC STANDARD',  priority: 1 },
  { id: 'P-0043', recipeId: 'recipe-1', recipeName: 'ZINC STANDARD',  priority: 2 },
  { id: 'P-0044', recipeId: 'recipe-2', recipeName: 'PHOSPHATE LIGHT', priority: 3 },
]

export const INITIAL_EVENTS: SimEvent[] = [
  { id: 'e01', timestamp: '00:47:23', type: 'MOVEMENT', message: 'CRANE-1 moving to RINSE 1 (T3) → target: 3,200mm' },
  { id: 'e02', timestamp: '00:47:21', type: 'DWELL',    message: 'PART-0039 dwell complete in DEGREASE (T2) → 06:12 elapsed' },
  { id: 'e03', timestamp: '00:47:18', type: 'MOVEMENT', message: 'CRANE-1 picked up PART-0039 from DEGREASE (T2)' },
  { id: 'e04', timestamp: '00:47:15', type: 'SYSTEM',   message: 'Simulation tick 2847 — speed: 1×' },
  { id: 'e05', timestamp: '00:47:10', type: 'DWELL',    message: 'PART-0042 dwell timer started — ZINC BATH (T4) — max: 15:00' },
  { id: 'e06', timestamp: '00:47:05', type: 'MOVEMENT', message: 'CRANE-1 placed PART-0042 in ZINC BATH (T4)' },
  { id: 'e07', timestamp: '00:47:00', type: 'COMPLETE', message: 'PART-0038 completed recipe ZINC STANDARD — all steps done' },
  { id: 'e08', timestamp: '00:46:55', type: 'SYSTEM',   message: 'Speed changed: 1× → 2×' },
  { id: 'e09', timestamp: '00:46:50', type: 'MOVEMENT', message: 'CRANE-2 moving to LOAD (T1) → target: 800mm' },
  { id: 'e10', timestamp: '00:46:45', type: 'DWELL',    message: 'PART-0042 dwell complete in RINSE 1 (T3) → 01:45 elapsed' },
  { id: 'e11', timestamp: '00:46:40', type: 'SYSTEM',   message: 'Simulation started — scenario: Normal Production LINE-1' },
]

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  craneSpeedMpm:    12,
  minDwellPct:      100,
  prefDwellPct:     100,
  maxDwellPct:      100,
  transferDelaySec: 2,
}

export const INITIAL_SENSOR_OVERRIDES: SensorOverrides = {
  crane1EncoderOverride: false,
  crane1EncoderValue:    3200,
  crane2EncoderOverride: false,
  crane2EncoderValue:    800,
  tank2OccupiedOverride: false,
  tank2OccupiedValue:    true,
  tank3OccupiedOverride: false,
  tank3OccupiedValue:    true,
  crane1LoadOverride:    false,
  crane1LoadValue:       450,
}

// ─── Crane position seeds for random retargeting ──────────────────────────────

export const TANK_POSITION_MM_6 = [300, 1550, 2800, 4050, 5300, 6550]

