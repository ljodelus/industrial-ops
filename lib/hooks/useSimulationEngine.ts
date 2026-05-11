'use client'

// Client hook — manages all simulation state + engine loop + fault injection

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addAlarm } from '@/store/slices/alarmsSlice'
import type { Alarm } from '@/types'
import { SCENARIOS } from '@/lib/simulation/scenarios'
import { FAULT_DEFINITIONS } from '@/lib/simulation/faults'
import {
  type SimStatus, type SimSpeed, type SimEventType,
  type SimCrane, type SimTank, type SimPart, type SimEvent,
  type SensorOverrides, type TimerSettings,
  formatSimTime, formatDwellRemaining,
  INITIAL_CRANES, INITIAL_TANKS, INITIAL_PARTS, INITIAL_EVENTS,
  DEFAULT_TIMER_SETTINGS, INITIAL_SENSOR_OVERRIDES,
  TANK_POSITION_MM_6,
} from '@/lib/simulation/engine'

// ─── Public interface ─────────────────────────────────────────────────────────

export interface SimulationState {
  status:           SimStatus
  tick:             number
  elapsedSeconds:   number
  elapsedFormatted: string
  speed:            SimSpeed
  scenario:         string
  activeLine:       string
  activeRecipeId:   string
  crane1Enabled:    boolean
  crane2Enabled:    boolean
  tankCount:        number
  cranes:           SimCrane[]
  tanks:            SimTank[]
  parts:            SimPart[]
  events:           SimEvent[]
  faultType:        string
  faultCrane:       string
  faultBanner:      string | null
  faultedCraneId:   string | null
  overrides:        SensorOverrides
  timerSettings:    TimerSettings
  view:             'synoptic' | 'table'
  eventFilter:      'ALL' | SimEventType
}

export interface SimulationActions {
  start:             () => void
  pause:             () => void
  stop:              () => void
  reset:             () => void
  setSpeed:          (s: SimSpeed) => void
  applyScenario:     (id: string) => void
  setActiveLine:     (l: string) => void
  setActiveRecipeId: (id: string) => void
  setCrane1Enabled:  (v: boolean) => void
  setCrane2Enabled:  (v: boolean) => void
  setTankCount:      (n: number) => void
  injectFault:       () => void
  setFaultType:      (t: string) => void
  setFaultCrane:     (c: string) => void
  addPart:           (part: SimPart) => void
  removePart:        (id: string) => void
  setOverride:       (key: keyof SensorOverrides, value: boolean | number) => void
  setTimerSetting:   (key: keyof TimerSettings, value: number) => void
  setView:           (v: 'synoptic' | 'table') => void
  setEventFilter:    (f: 'ALL' | SimEventType) => void
  clearEvents:       () => void
  exportEvents:      () => void
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function makeId(): string {
  return `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const MOVEMENT_POOL: (() => string)[] = [
  () => `CRANE-1 moving to ZINC BATH (T4) → target: ${(3200 + Math.floor(Math.random() * 1200)).toLocaleString()}mm`,
  () => `CRANE-1 picked up PART-${String(39 + Math.floor(Math.random() * 6)).padStart(4, '0')} from DEGREASE (T2)`,
  () => `CRANE-2 moving to LOAD (T1) → target: 800mm`,
  () => `CRANE-1 placed part in RINSE 1 (T3) — dwell started`,
  () => `CRANE-2 returning to home → target: 400mm`,
  () => `CRANE-1 moving to UNLOAD (T6) → target: 6,550mm`,
]

const DWELL_POOL = [
  () => `PART-${String(38 + Math.floor(Math.random() * 7)).padStart(4, '0')} dwell complete in DEGREASE (T2) → ${String(5 + Math.floor(Math.random() * 3)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} elapsed`,
  () => `Dwell timer started — ZINC BATH (T4) — max: 15:00`,
  () => `PART-0042 dwell extended — preferred time reached, next pickup pending`,
  () => `Dwell complete — RINSE 1 (T3) → crane pickup pending (transfer delay: 2s)`,
  () => `PART-0039 min dwell reached in RINSE 2 (T5) → ready for pickup`,
]

const SYSTEM_POOL = (tick: number, speed: number) => [
  `Simulation tick ${tick} — speed: ${speed}×`,
  `Crane positions updated — collision check: OK`,
  `Recipe ZINC STANDARD — active steps: 3/6`,
  `Part queue check — 3 items — next: P-0043 priority 2`,
  `Zone ZONE-B clear — no conflict detected`,
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSimulationEngine(): SimulationState & SimulationActions {
  const dispatch = useAppDispatch()

  // ── Control state ──────────────────────────────────────────────────────────
  const [status,         setStatus]         = useState<SimStatus>('stopped')
  const [tick,           setTick]           = useState(2847)
  const [elapsedSeconds, setElapsedSeconds] = useState(2843)   // ~00:47:23
  const [speed,          setSpeedState]     = useState<SimSpeed>(1)

  // ── Config state ───────────────────────────────────────────────────────────
  const [scenario,       setScenario]       = useState('normal-line1')
  const [activeLine,     setActiveLine]     = useState('LINE-1')
  const [activeRecipeId, setActiveRecipeId] = useState('recipe-1')
  const [crane1Enabled,  setCrane1Enabled]  = useState(true)
  const [crane2Enabled,  setCrane2Enabled]  = useState(true)
  const [tankCount,      setTankCountState] = useState(6)

  // ── Live sim state ─────────────────────────────────────────────────────────
  const [cranes, setCranes] = useState<SimCrane[]>(INITIAL_CRANES)
  const [tanks,  setTanks]  = useState<SimTank[]>(INITIAL_TANKS)
  const [parts,  setParts]  = useState<SimPart[]>(INITIAL_PARTS)
  const [events, setEvents] = useState<SimEvent[]>(INITIAL_EVENTS)

  // ── Fault state ────────────────────────────────────────────────────────────
  const [faultType,     setFaultType]     = useState('')
  const [faultCrane,    setFaultCrane]    = useState('CRANE-1')
  const [faultBanner,   setFaultBanner]   = useState<string | null>(null)
  const [faultedCraneId, setFaultedCraneId] = useState<string | null>(null)

  // ── Settings state ─────────────────────────────────────────────────────────
  const [overrides,     setOverridesState]     = useState<SensorOverrides>(INITIAL_SENSOR_OVERRIDES)
  const [timerSettings, setTimerSettingsState] = useState<TimerSettings>(DEFAULT_TIMER_SETTINGS)

  // ── View state ─────────────────────────────────────────────────────────────
  const [view,        setView]        = useState<'synoptic' | 'table'>('synoptic')
  const [eventFilter, setEventFilter] = useState<'ALL' | SimEventType>('ALL')

  // ── Mutable refs (for inside interval callbacks) ───────────────────────────
  const statusRef      = useRef<SimStatus>('stopped')
  const speedRef       = useRef<SimSpeed>(1)
  const tickRef        = useRef(2847)
  const elapsedRef     = useRef(2843)
  const eventCountRef  = useRef(0)
  const scenarioRef    = useRef('normal-line1')

  useEffect(() => { statusRef.current   = status   }, [status])
  useEffect(() => { speedRef.current    = speed    }, [speed])
  useEffect(() => { scenarioRef.current = scenario }, [scenario])

  // ── addEvent ───────────────────────────────────────────────────────────────
  const addEvent = useCallback((type: SimEventType, message: string) => {
    const evt: SimEvent = {
      id:        makeId(),
      timestamp: formatSimTime(elapsedRef.current),
      type,
      message,
    }
    setEvents(prev => [evt, ...prev].slice(0, 500))
  }, [])

  // ── Main simulation tick ───────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'running') return

    const intervalMs = Math.floor(2000 / speed)

    const id = setInterval(() => {
      if (statusRef.current !== 'running') return

      const spd = speedRef.current

      // Advance counters
      tickRef.current    += 1
      elapsedRef.current += 1
      setTick(t => t + 1)
      setElapsedSeconds(e => e + 1)

      // Update crane positions
      setCranes(prev => prev.map(crane => {
        if (!crane.enabled || crane.status === 'error') return crane
        if (crane.status !== 'moving') return crane
        const stepMm = 300 * spd
        const diff   = crane.targetPosition - crane.position
        if (Math.abs(diff) <= stepMm) {
          return { ...crane, position: crane.targetPosition, status: 'idle' }
        }
        return { ...crane, position: crane.position + Math.sign(diff) * stepMm }
      }))

      // Update tank dwell timers
      setTanks(prev => prev.map(tank => {
        if (!tank.occupied) return tank
        return { ...tank, dwellElapsed: tank.dwellElapsed + spd }
      }))

      // Re-target idle cranes occasionally
      setCranes(prev => prev.map(crane => {
        if (!crane.enabled || crane.status !== 'idle') return crane
        if (Math.random() < 0.08) {
          const targetMm = TANK_POSITION_MM_6[Math.floor(Math.random() * TANK_POSITION_MM_6.length)]
          return { ...crane, targetPosition: targetMm, status: 'moving' }
        }
        return crane
      }))

      // Generate events at varying intervals
      eventCountRef.current += 1
      const ec = eventCountRef.current

      if (ec % 5 === 0) {
        const pool = MOVEMENT_POOL
        addEvent('MOVEMENT', pool[Math.floor(Math.random() * pool.length)]())
      } else if (ec % 7 === 0) {
        const pool = DWELL_POOL
        addEvent('DWELL', pool[Math.floor(Math.random() * pool.length)]())
      } else if (ec % 15 === 0) {
        const pool = SYSTEM_POOL(tickRef.current, spd)
        addEvent('SYSTEM', pool[Math.floor(Math.random() * pool.length)])
      } else if (ec % 40 === 0) {
        addEvent('COMPLETE', `PART-${String(35 + Math.floor(Math.random() * 5)).padStart(4, '0')} completed recipe ZINC STANDARD — all steps done`)
      }

    }, intervalMs)

    return () => clearInterval(id)
  }, [status, speed, addEvent])

  // ── Controls ───────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    setStatus('running')
    addEvent('SYSTEM', `Simulation started — scenario: ${scenarioRef.current}`)
  }, [addEvent])

  const pause = useCallback(() => {
    setStatus('paused')
    addEvent('SYSTEM', `Simulation paused at tick ${tickRef.current}`)
  }, [addEvent])

  const stop = useCallback(() => {
    setStatus('stopped')
    tickRef.current    = 0
    elapsedRef.current = 0
    eventCountRef.current = 0
    setTick(0)
    setElapsedSeconds(0)
    setCranes(INITIAL_CRANES.map(c => ({ ...c, status: 'idle', position: c.targetPosition })))
    setTanks(INITIAL_TANKS)
    setEvents([])
  }, [])

  const reset = useCallback(() => {
    tickRef.current    = 0
    elapsedRef.current = 0
    eventCountRef.current = 0
    setTick(0)
    setElapsedSeconds(0)
    setCranes(INITIAL_CRANES.map(c => ({ ...c, status: 'idle', position: c.targetPosition })))
    setTanks(INITIAL_TANKS)
    setEvents([])
    addEvent('SYSTEM', 'Simulation state reset to initial configuration')
  }, [addEvent])

  const setSpeed = useCallback((s: SimSpeed) => {
    addEvent('SYSTEM', `Speed changed: ${speedRef.current}× → ${s}×`)
    speedRef.current = s
    setSpeedState(s)
  }, [addEvent])

  const applyScenario = useCallback((id: string) => {
    const cfg = SCENARIOS.find(s => s.id === id)
    if (!cfg) return
    setScenario(id)
    scenarioRef.current = id
    setActiveLine(cfg.activeLine)
    setActiveRecipeId(cfg.activeRecipeId)
    setCrane1Enabled(cfg.crane1Enabled)
    setCrane2Enabled(cfg.crane2Enabled)
    setTankCountState(cfg.tankCount)
    addEvent('SYSTEM', `Scenario applied: ${cfg.label}`)
  }, [addEvent])

  const injectFault = useCallback(() => {
    const def = FAULT_DEFINITIONS.find(f => f.id === faultType)
    if (!def) return

    const craneTarget = def.requiresCrane ? faultCrane : undefined
    const logMsg      = def.getLogMessage(craneTarget)
    const alarmMsg    = def.getAlarmMessage(craneTarget)

    // Add to simulation event log
    addEvent('FAULT', `FAULT INJECTED — ${logMsg}`)

    // Show banner for 3 seconds
    setFaultBanner(`⚠ FAULT INJECTED — ${logMsg}`)
    setTimeout(() => setFaultBanner(null), 3000)

    // Affect crane if needed
    if (def.requiresCrane && craneTarget) {
      setFaultedCraneId(craneTarget)
      setCranes(prev => prev.map(c =>
        c.id === craneTarget ? { ...c, status: 'error', faulted: true } : c
      ))
      setTimeout(() => {
        setFaultedCraneId(null)
        setCranes(prev => prev.map(c =>
          c.id === craneTarget ? { ...c, faulted: false } : c
        ))
      }, 3000)
    }

    // Push alarm to Redux alarmsSlice
    const alarm: Alarm = {
      id:           `sim-alarm-${Date.now()}`,
      severity:     def.alarmSeverity,
      category:     def.alarmCategory,
      message:      alarmMsg,
      source:       craneTarget ?? 'SIMULATION',
      acknowledged: false,
      triggeredAt:  new Date().toISOString(),
    }
    dispatch(addAlarm(alarm))
  }, [faultType, faultCrane, dispatch, addEvent])

  const addPart = useCallback((part: SimPart) => {
    setParts(prev => [...prev, part])
    addEvent('SYSTEM', `Part ${part.id} added to queue — recipe: ${part.recipeName} — priority: ${part.priority}`)
  }, [addEvent])

  const removePart = useCallback((partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId))
    addEvent('SYSTEM', `Part ${partId} removed from queue`)
  }, [addEvent])

  const setOverride = useCallback((key: keyof SensorOverrides, value: boolean | number) => {
    setOverridesState(prev => ({ ...prev, [key]: value }))
  }, [])

  const setTimerSetting = useCallback((key: keyof TimerSettings, value: number) => {
    setTimerSettingsState(prev => ({ ...prev, [key]: value }))
  }, [])

  const setTankCount = useCallback((n: number) => {
    setTankCountState(Math.max(2, Math.min(12, n)))
  }, [])

  const clearEvents = useCallback(() => setEvents([]), [])

  const exportEvents = useCallback(() => {
    const text = events
      .map(e => `[${e.timestamp}]  [${e.type.padEnd(8)}]  ${e.message}`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `simulation-events-${new Date().toISOString().slice(0, 10)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }, [events])

  return {
    // State
    status,
    tick,
    elapsedSeconds,
    elapsedFormatted: formatSimTime(elapsedSeconds),
    speed,
    scenario,
    activeLine,
    activeRecipeId,
    crane1Enabled,
    crane2Enabled,
    tankCount,
    cranes,
    tanks,
    parts,
    events,
    faultType,
    faultCrane,
    faultBanner,
    faultedCraneId,
    overrides,
    timerSettings,
    view,
    eventFilter,
    // Actions
    start,
    pause,
    stop,
    reset,
    setSpeed,
    applyScenario,
    setActiveLine,
    setActiveRecipeId,
    setCrane1Enabled,
    setCrane2Enabled,
    setTankCount,
    injectFault,
    setFaultType,
    setFaultCrane,
    addPart,
    removePart,
    setOverride,
    setTimerSetting,
    setView,
    setEventFilter,
    clearEvents,
    exportEvents,
  }
}

// Re-export for convenience
export { formatDwellRemaining }



