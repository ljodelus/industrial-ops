'use client'

// Client hook — manages all diagnostics simulation state via useEffect + useState

import { useState, useEffect, useRef, useCallback } from 'react'
import type { DiagnosticLogEntry, LatencyPoint } from '@/types'

// ─── Utilities ────────────────────────────────────────────────────────────────

function nowTimestamp(): string {
  const d = new Date()
  return [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join(':')
}

function formatNum(n: number): string {
  return n.toFixed(1)
}

// ─── Initial Log ──────────────────────────────────────────────────────────────

const INITIAL_LOG: DiagnosticLogEntry[] = [
  { id: 'l1',  timestamp: '08:14:32', level: 'INFO',  message: 'OPC UA: Tag ns=2;s=LINE1.CRANE1.Position updated → 3200.0mm' },
  { id: 'l2',  timestamp: '08:14:30', level: 'WARN',  message: 'PLC LINE-2: Latency spike detected — 72ms (threshold: 50ms)' },
  { id: 'l3',  timestamp: '08:14:28', level: 'INFO',  message: 'MQTT: Message received on topic crane/line1/crane1/position' },
  { id: 'l4',  timestamp: '08:14:25', level: 'ERROR', message: 'CRANE-4: Encoder feedback lost at position 2400mm' },
  { id: 'l5',  timestamp: '08:14:20', level: 'INFO',  message: 'Database: Query completed in 18ms (alarms.getActive)' },
  { id: 'l6',  timestamp: '08:14:15', level: 'WARN',  message: 'QR Scanner: USB connection unstable — retry 1/3' },
  { id: 'l7',  timestamp: '08:14:10', level: 'INFO',  message: 'Auth: User Marc Dupont session refreshed' },
  { id: 'l8',  timestamp: '08:14:05', level: 'INFO',  message: 'OPC UA: Subscription heartbeat — 248 nodes active' },
  { id: 'l9',  timestamp: '08:14:00', level: 'INFO',  message: 'MQTT Broker: 24 messages/sec (avg 22.1)' },
  { id: 'l10', timestamp: '08:13:55', level: 'WARN',  message: 'PLC LINE-2: 6 tags returned stale data (>2s old)' },
  { id: 'l11', timestamp: '08:13:50', level: 'ERROR', message: 'CRANE-4: VFD temperature warning — 78°C (limit: 75°C)' },
  { id: 'l12', timestamp: '08:13:45', level: 'INFO',  message: 'Simulation: Tick 2847 — crane positions updated' },
]

const INFO_FNS: (() => string)[] = [
  () => `OPC UA: Tag ns=2;s=LINE1.CRANE1.Position updated → ${Math.floor(Math.random() * 4000 + 500)}.0mm`,
  () => 'MQTT: Message received on topic crane/line1/crane1/position',
  () => `Database: Query completed in ${Math.floor(Math.random() * 30 + 5)}ms (alarms.getActive)`,
  () => 'OPC UA: Subscription heartbeat — 248 nodes active',
  () => `MQTT Broker: ${formatNum(Math.random() * 10 + 20)} messages/sec`,
  () => 'Auth: Session heartbeat — 3 active sessions',
  () => `Simulation: Tick ${Math.floor(Math.random() * 1000 + 2800)} — crane positions updated`,
]

function randomInfo(): string {
  return INFO_FNS[Math.floor(Math.random() * INFO_FNS.length)]()
}

// ─── Initial Latency History ──────────────────────────────────────────────────

function buildInitialHistory(): LatencyPoint[] {
  return Array.from({ length: 60 }, (_, i) => ({
    second: i,
    plc1:   Math.floor(Math.random() * 4 + 1),
    plc2:   Math.floor(Math.random() * 20 + 40),
  }))
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiagnosticsSimState {
  healthScore:    number
  lastScanTime:   string
  autoRefresh:    boolean
  scanning:       boolean
  plc1Latency:    number
  plc2Latency:    number
  plc2PacketLoss: number
  plc2ActiveTags: number
  mqttMsgPerSec:  number
  latencyHistory: LatencyPoint[]
  logEntries:     DiagnosticLogEntry[]
  cpu:            number
  qrWarning:      boolean
  uptimeSeconds:  number
}

export interface DiagnosticsSimActions {
  setAutoRefresh: (v: boolean) => void
  triggerScan:    () => void
  clearLog:       () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDiagnosticsSimulation(): DiagnosticsSimState & DiagnosticsSimActions {
  const [healthScore,    setHealthScore]    = useState(94.2)
  const [lastScanTime,   setLastScanTime]   = useState(nowTimestamp)
  const [autoRefresh,    setAutoRefresh]    = useState(true)
  const [scanning,       setScanning]       = useState(false)
  const [plc1Latency,    setPlc1Latency]    = useState(2)
  const [plc2Latency,    setPlc2Latency]    = useState(48)
  const [plc2ActiveTags, setPlc2ActiveTags] = useState(118)
  const [mqttMsgPerSec,  setMqttMsgPerSec]  = useState(24.3)
  const [latencyHistory, setLatencyHistory] = useState<LatencyPoint[]>(buildInitialHistory)
  const [logEntries,     setLogEntries]     = useState<DiagnosticLogEntry[]>(INITIAL_LOG)
  const [cpu,            setCpu]            = useState(38.2)
  const [qrWarning,      setQrWarning]      = useState(false)
  const [uptimeSeconds,  setUptimeSeconds]  = useState(0)

  const autoRefreshRef  = useRef(autoRefresh)
  const counterRef      = useRef(60)
  const plc2SpikingRef  = useRef(false)
  const spikeTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { autoRefreshRef.current = autoRefresh }, [autoRefresh])

  // ── addLog ──────────────────────────────────────────────────────────────────
  const addLog = useCallback((level: DiagnosticLogEntry['level'], message: string) => {
    const entry: DiagnosticLogEntry = {
      id:        `log-${Date.now()}-${Math.random().toFixed(6)}`,
      timestamp: nowTimestamp(),
      level,
      message,
    }
    setLogEntries(prev => [entry, ...prev].slice(0, 200))
  }, [])

  const clearLog = useCallback(() => setLogEntries([]), [])

  const triggerScan = useCallback(() => {
    setScanning(true)
    setLastScanTime(nowTimestamp())
    setTimeout(() => setScanning(false), 800)
  }, [])

  // ── Every 1 second — log entry + time + uptime ───────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!autoRefreshRef.current) return
      setLastScanTime(nowTimestamp())
      setUptimeSeconds(p => p + 1)
      addLog('INFO', randomInfo())
    }, 1000)
    return () => clearInterval(id)
  }, [addLog])

  // ── Every 2 seconds — CPU, latency, MQTT, health, chart ──────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!autoRefreshRef.current) return

      // CPU oscillates 30–50%
      setCpu(prev => parseFloat(Math.max(30, Math.min(50, prev + (Math.random() - 0.5) * 10)).toFixed(1)))

      // PLC LINE-1 latency: 1–5ms
      setPlc1Latency(Math.floor(Math.random() * 4 + 1))

      // PLC LINE-2 latency: 40–60ms (unless spiking)
      if (!plc2SpikingRef.current) {
        const lat = Math.floor(Math.random() * 20 + 40)
        setPlc2Latency(lat)
        // Intermittent tag availability
        setPlc2ActiveTags(Math.random() > 0.3 ? 118 : Math.floor(Math.random() * 10 + 114))
      }

      // MQTT messages/sec: 20–30
      setMqttMsgPerSec(prev =>
        parseFloat(Math.max(20, Math.min(30, prev + (Math.random() - 0.5) * 4)).toFixed(1))
      )

      // Health score ±0.3%
      setHealthScore(prev =>
        parseFloat(Math.max(80, Math.min(99, prev + (Math.random() - 0.5) * 0.6)).toFixed(1))
      )

      // Rolling latency chart (60-point window — newest appended, oldest dropped)
      const sec = counterRef.current++
      setLatencyHistory(prev => [
        ...prev.slice(1),
        {
          second: sec,
          plc1:   Math.floor(Math.random() * 4 + 1),
          plc2:   plc2SpikingRef.current
            ? Math.floor(Math.random() * 10 + 65)
            : Math.floor(Math.random() * 20 + 40),
        },
      ])
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // ── Every 10 seconds — PLC LINE-2 latency spike ───────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!autoRefreshRef.current) return
      plc2SpikingRef.current = true
      const spike = Math.floor(Math.random() * 10 + 65)
      setPlc2Latency(spike)
      addLog('WARN', `PLC LINE-2: Latency spike detected — ${spike}ms (threshold: 50ms)`)
      if (spikeTimerRef.current) clearTimeout(spikeTimerRef.current)
      spikeTimerRef.current = setTimeout(() => {
        plc2SpikingRef.current = false
        setPlc2Latency(Math.floor(Math.random() * 20 + 40))
      }, 3000)
    }, 10000)
    return () => {
      clearInterval(id)
      if (spikeTimerRef.current) clearTimeout(spikeTimerRef.current)
    }
  }, [addLog])

  // ── Every 30 seconds — QR Scanner warning toggle ─────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!autoRefreshRef.current) return
      setQrWarning(prev => {
        const next = !prev
        addLog(
          next ? 'WARN' : 'INFO',
          next
            ? 'QR Scanner: USB connection unstable — retry attempt'
            : 'QR Scanner: USB connection restored',
        )
        return next
      })
    }, 30000)
    return () => clearInterval(id)
  }, [addLog])

  return {
    healthScore,
    lastScanTime,
    autoRefresh,
    scanning,
    plc1Latency,
    plc2Latency,
    plc2PacketLoss: 0.8,
    plc2ActiveTags,
    mqttMsgPerSec,
    latencyHistory,
    logEntries,
    cpu,
    qrWarning,
    uptimeSeconds,
    setAutoRefresh,
    triggerScan,
    clearLog,
  }
}

