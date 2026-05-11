'use client'

// Client component — role-based redirect, PLC selection, IO map, force panel, monitor, log
// Requires: useEffect (redirect, simulation), useState (banner, filters, selected signal)

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUserRole, selectCurrentUser } from '@/store/slices/authSlice'
import {
  selectSelectedPlc,
  selectActiveSignals,
  selectForcedOutputs,
  selectMonitoredAddresses,
  selectIOLog,
  selectPlc,
  forceOutput,
  releaseForce,
  addToMonitor,
  removeFromMonitor,
  clearMonitor,
  appendLogEntry,
  clearLog,
  updateSignalValue,
  updateSignalStatus,
} from '@/store/slices/ioSlice'
import { selectAllCranes } from '@/store/slices/cranesSlice'
import { selectAllTanks }  from '@/store/slices/tanksSlice'
import { Card, Button, Badge, StatusDot } from '@/components/ui'
import { AlertTriangle, X } from '@/lib/icons'

import { IOFilterBar }       from './IOFilterBar'
import { DigitalInputGrid }  from './DigitalInputGrid'
import { DigitalOutputGrid } from './DigitalOutputGrid'
import { AnalogSignalGrid }  from './AnalogSignalGrid'
import { ForcePanel }        from './ForcePanel'
import { SignalMonitorChart } from './SignalMonitorChart'
import { IOTestLog }         from './IOTestLog'

import type { IOFilters }  from './IOFilterBar'
import type { IOSignal, PLCLine } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BANNER_KEY = 'io-safety-banner-dismissed'

function matchesStatusFilter(sig: IOSignal, filter: string): boolean {
  if (!filter) return true
  switch (filter) {
    case 'Active':   return sig.status === 'HIGH'
    case 'Inactive': return sig.status === 'LOW'
    case 'Forced':   return sig.status === 'FORCED'
    case 'Fault':    return sig.status === 'FAULT' || sig.status === 'CAUTION'
    default:         return true
  }
}

// ─── PLC Pill Selector ────────────────────────────────────────────────────────

interface PLCPillProps {
  selected: PLCLine
  onChange: (plc: PLCLine) => void
}

function PLCPillSelector({ selected, onChange }: PLCPillProps) {
  return (
    <div className="flex gap-1">
      {(['LINE-1', 'LINE-2'] as PLCLine[]).map(plc => (
        <button
          key={plc}
          type="button"
          onClick={() => onChange(plc)}
          className={`px-3 py-1.5 text-xs font-mono uppercase rounded-scada border transition-colors
            ${selected === plc
              ? 'bg-accent-primary text-scada-bg border-accent-primary'
              : 'text-text-muted border-scada-border hover:border-accent-primary hover:text-text-primary'
            }`}
        >
          PLC {plc}
        </button>
      ))}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-scada-border mb-3 pb-1">
      <span className="text-text-muted text-xs uppercase font-mono tracking-wide">{label}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IOTestingClient() {
  const router   = useRouter()
  const dispatch = useAppDispatch()

  const role             = useAppSelector(selectUserRole)
  const user             = useAppSelector(selectCurrentUser)
  const selectedPlc      = useAppSelector(selectSelectedPlc)
  const activeSignals    = useAppSelector(selectActiveSignals)
  const forcedOutputs    = useAppSelector(selectForcedOutputs)
  const monitoredAddrs   = useAppSelector(selectMonitoredAddresses)
  const logEntries       = useAppSelector(selectIOLog)
  const cranes           = useAppSelector(selectAllCranes)
  const tanks            = useAppSelector(selectAllTanks)

  // Role-based redirect
  useEffect(() => {
    if (role === 'operator' || role === 'supervisor') {
      router.replace('/overview')
    }
  }, [role, router])

  // Safety banner — initialize from sessionStorage directly (lazy initializer is client-safe)
  const [bannerVisible, setBannerVisible] = useState<boolean>(true)
  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && sessionStorage.getItem(BANNER_KEY)
    if (dismissed) setBannerVisible(false)
  }, [])
  function dismissBanner() {
    sessionStorage.setItem(BANNER_KEY, '1')
    setBannerVisible(false)
  }

  // Filters
  const [filters, setFilters] = useState<IOFilters>({ search: '', type: '', device: '', status: '' })

  // Selected signal for force panel
  const [selectedSignal, setSelectedSignal] = useState<IOSignal | undefined>(undefined)

  // Handle PLC switch
  function handleSelectPlc(plc: PLCLine) {
    dispatch(selectPlc(plc))
    setSelectedSignal(undefined)
  }

  // Filtered signals
  const filtered = useMemo(() => {
    return activeSignals.filter(sig => {
      const q = filters.search.toLowerCase()
      if (q && !sig.name.toLowerCase().includes(q) && !sig.address.toLowerCase().includes(q)) return false
      if (filters.type   && sig.type   !== filters.type)   return false
      if (filters.device && sig.device !== filters.device) return false
      if (!matchesStatusFilter(sig, filters.status))       return false
      return true
    })
  }, [activeSignals, filters])

  const diSignals = useMemo(() => filtered.filter(s => s.type === 'DI'), [filtered])
  const doSignals = useMemo(() => filtered.filter(s => s.type === 'DO'), [filtered])
  const anSignals = useMemo(() => filtered.filter(s => s.type === 'AI' || s.type === 'AO'), [filtered])

  // PLC connection labels
  const plcStatus = selectedPlc === 'LINE-1'
    ? { dot: 'ok' as const, label: '● CONNECTED (2ms)' }
    : { dot: 'warning' as const, label: '● CONNECTED (48ms)' }

  // ── Simulation: update IO values every 2 seconds from crane/tank state ──────
  useEffect(() => {
    const id = setInterval(() => {
      // Update crane encoder positions and speed feedback from crane store (LINE-1 only)
      if (selectedPlc === 'LINE-1') {
        const c1 = cranes.find(c => c.id === 'CRANE-1' || c.name === 'CRANE-1')
        const c2 = cranes.find(c => c.id === 'CRANE-2' || c.name === 'CRANE-2')

        if (c1) {
          dispatch(updateSignalValue({ address: '%IW0', value: c1.position }))
          dispatch(updateSignalValue({ address: '%IW2', value: c1.load }))
          dispatch(updateSignalValue({ address: '%IW4', value: c1.status === 'moving' ? 12.0 : 0.0 }))
          dispatch(updateSignalValue({ address: '%QW0', value: c1.status === 'moving' ? 12.0 : 0.0 }))
        }
        if (c2) {
          dispatch(updateSignalValue({ address: '%IW6', value: c2.position }))
          dispatch(updateSignalValue({ address: '%IW8', value: c2.load }))
          dispatch(updateSignalValue({ address: '%IW10', value: c2.status === 'moving' ? 8.0 : 0.0 }))
          dispatch(updateSignalValue({ address: '%QW2', value: c2.status === 'moving' ? 8.0 : 0.0 }))
        }

        // Update tank occupied signals
        const tankMap: Record<string, string> = {
          'TANK-1': '%I1.0', 'TANK-2': '%I1.1', 'TANK-3': '%I1.2',
          'TANK-4': '%I1.3', 'TANK-5': '%I1.4', 'TANK-6': '%I1.5',
        }
        tanks.forEach(t => {
          const addr = tankMap[t.name]
          if (addr) {
            dispatch(updateSignalStatus({
              address: addr,
              plc: 'LINE-1',
              status: t.occupied ? 'HIGH' : 'LOW',
            }))
          }
        })
      }

      // Append READ entries for monitored signals
      monitoredAddrs.forEach(addr => {
        const sig = activeSignals.find(s => s.address === addr)
        if (!sig) return
        const detail = sig.type === 'AI' || sig.type === 'AO'
          ? `→ ${sig.value?.toFixed(1)} ${sig.unit ?? ''}`
          : `→ ${sig.status}`
        dispatch(appendLogEntry({
          type:       'READ',
          address:    sig.address,
          signalName: sig.name,
          detail,
        }))
      })
    }, 2000)

    return () => clearInterval(id)
    // monitoredAddrs.join is used as a stable string dep to avoid array reference churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedPlc, cranes, tanks, monitoredAddrs, activeSignals])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleForce = useCallback((signal: IOSignal, value: number, name: string) => {
    dispatch(forceOutput({
      address:    signal.address,
      plc:        selectedPlc,
      value,
      userName:   name,
      signalName: signal.name,
    }))
  }, [dispatch, selectedPlc])

  const handleRelease = useCallback((signal: IOSignal) => {
    dispatch(releaseForce({
      address:    signal.address,
      plc:        selectedPlc,
      signalName: signal.name,
    }))
    // Deselect if we released the currently selected signal
    setSelectedSignal(prev => prev?.address === signal.address ? undefined : prev)
  }, [dispatch, selectedPlc])

  const handleMonitor = useCallback((signal: IOSignal) => {
    if (monitoredAddrs.includes(signal.address)) return
    dispatch(addToMonitor({ address: signal.address, signalName: signal.name }))
  }, [dispatch, monitoredAddrs])

  const handleRemoveMonitor = useCallback((address: string) => {
    dispatch(removeFromMonitor(address))
  }, [dispatch])

  const handleClearMonitor = useCallback(() => {
    dispatch(clearMonitor())
  }, [dispatch])

  const handleClearLog = useCallback(() => {
    dispatch(clearLog())
  }, [dispatch])

  // Guard unauthorized roles immediately (redirect runs async)
  if (role === 'operator' || role === 'supervisor') return null

  const forcedOutputsTyped = forcedOutputs as Record<string, number>

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: Title */}
          <div>
            <h1 className="text-text-value text-xl font-mono uppercase tracking-widest">IO TESTING</h1>
            <p className="text-text-muted text-xs font-mono mt-1">Direct PLC input/output verification</p>
          </div>

          {/* Right: PLC selector + connection status */}
          <div className="flex flex-col items-end gap-2">
            <PLCPillSelector selected={selectedPlc} onChange={handleSelectPlc} />
            <div className="flex items-center gap-1.5">
              <StatusDot
                status={plcStatus.dot}
                size="sm"
                animated={plcStatus.dot === 'ok'}
              />
              <span className={`text-xs font-mono ${selectedPlc === 'LINE-2' ? 'text-status-warning' : 'text-text-muted'}`}>
                {plcStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Safety warning banner */}
        {bannerVisible && (
          <div className="flex items-start justify-between gap-3 px-4 py-3 bg-status-warning/10 border border-status-warning/40 rounded-scada">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-status-warning shrink-0 mt-0.5" />
              <div className="text-status-warning text-xs font-mono">
                <span className="font-semibold">CAUTION — </span>
                Forcing outputs may cause unexpected crane movement.
                <span className="block text-[10px] mt-0.5 text-status-warning/80">
                  Ensure all personnel are clear of the production area before activating any digital output.
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" icon={<X size={12} />} onClick={dismissBanner}>
              Got it
            </Button>
          </div>
        )}
      </div>

      {/* ── SECTION A — IO Test Panel ─────────────────────────────────────── */}
      <Card
        title={`IO MAP — PLC ${selectedPlc}`}
        accent="primary"
        action={
          <Badge
            variant={selectedPlc === 'LINE-2' ? 'warning' : 'ok'}
            label={selectedPlc === 'LINE-1' ? 'CONNECTED' : 'CONNECTED (SLOW)'}
          />
        }
      >
        {/* Filter bar */}
        <IOFilterBar
          filters={filters}
          onChange={setFilters}
          totalCount={activeSignals.length}
          showCount={filtered.length}
        />

        {/* DI section */}
        {(filters.type === '' || filters.type === 'DI') && (
          <div className="mb-6">
            <SectionHeader label={`Digital Inputs (DI) — ${diSignals.length} signals`} />
            <DigitalInputGrid
              signals={diSignals}
              onMonitor={handleMonitor}
              monitoredAddresses={monitoredAddrs}
            />
          </div>
        )}

        {/* DO section */}
        {(filters.type === '' || filters.type === 'DO') && (
          <div className="mb-6">
            <SectionHeader label={`Digital Outputs (DO) — ${doSignals.length} signals`} />
            <DigitalOutputGrid
              signals={doSignals}
              forcedOutputs={forcedOutputsTyped}
              selectedAddress={selectedSignal?.address}
              onForce={sig => setSelectedSignal(sig)}
              onMonitor={handleMonitor}
              monitoredAddresses={monitoredAddrs}
            />
          </div>
        )}

        {/* Analog section */}
        {(filters.type === '' || filters.type === 'AI' || filters.type === 'AO') && (
          <div>
            <SectionHeader label={`Analog Signals (AI/AO) — ${anSignals.length} signals`} />
            <AnalogSignalGrid
              signals={anSignals}
              onForce={sig => setSelectedSignal(sig)}
              onMonitor={handleMonitor}
              monitoredAddresses={monitoredAddrs}
            />
          </div>
        )}
      </Card>

      {/* ── SECTIONS B + C — Force Panel + Signal Monitor ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 items-start">

        {/* Section B — Force Panel */}
        <Card title="FORCE OUTPUT" accent="gold">
          <ForcePanel
            signal={selectedSignal}
            userName={user?.name ?? 'Unknown'}
            plc={selectedPlc}
            forcedOutputs={forcedOutputsTyped}
            onForce={handleForce}
            onRelease={handleRelease}
          />
        </Card>

        {/* Section C — Signal Monitor */}
        <Card
          title="SIGNAL MONITOR"
          accent="primary"
          action={
            <span className="text-text-muted text-[10px] font-mono">
              {monitoredAddrs.length} / 6 signals
            </span>
          }
        >
          <SignalMonitorChart
            monitoredAddresses={monitoredAddrs}
            signals={activeSignals}
            onRemove={handleRemoveMonitor}
            onClearAll={handleClearMonitor}
          />
        </Card>
      </div>

      {/* ── SECTION D — IO Test Log ──────────────────────────────────────── */}
      <Card
        title="IO TEST LOG"
        accent="primary"
        action={
          <span className="text-text-muted text-[10px] font-mono">
            {logEntries.length} entries
          </span>
        }
      >
        <IOTestLog entries={logEntries} onClear={handleClearLog} />
      </Card>

    </div>
  )
}

