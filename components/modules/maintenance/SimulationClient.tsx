'use client'

// Client component — role-based redirect, simulation orchestration, main page layout
// Requires: useEffect (redirect), useState (confirm dialog), all simulation engine state

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import { useSimulationEngine } from '@/lib/hooks/useSimulationEngine'
import { Card, Button, Badge, Modal } from '@/components/ui'
import { Play, Pause, Square, RefreshCw } from '@/lib/icons'

import { SimulationStatusBar }   from './SimulationStatusBar'
import { SimulationControlPanel } from './SimulationControlPanel'
import { SimulationSynoptic }    from './SimulationSynoptic'
import { SimulationTableView }   from './SimulationTableView'
import { ScenarioSettings }      from './ScenarioSettings'
import { SimulationEventLog }    from './SimulationEventLog'

export function SimulationClient() {
  const router = useRouter()
  const role   = useAppSelector(selectUserRole)

  // Role-based access: redirect operator/supervisor to /overview
  useEffect(() => {
    if (role === 'operator' || role === 'supervisor') {
      router.replace('/overview')
    }
  }, [role, router])

  const sim = useSimulationEngine()

  // Stop confirmation dialog
  const [confirmStop, setConfirmStop] = useState(false)

  function handleStop() {
    if (sim.status === 'stopped') return
    setConfirmStop(true)
  }

  function confirmAndStop() {
    sim.stop()
    setConfirmStop(false)
  }

  // Guard unauthorized roles
  if (role === 'operator' || role === 'supervisor') return null

  const isRunning = sim.status === 'running'
  const isStopped = sim.status === 'stopped'
  const isPaused  = sim.status === 'paused'

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* Left: Title + Status Bar */}
        <div className="space-y-3 flex-1 min-w-0">
          <div>
            <h1 className="text-text-value text-xl font-mono uppercase tracking-widest">
              SIMULATION MODE
            </h1>
            <p className="text-text-muted text-xs font-mono mt-1">
              Isolated test environment — no PLC connection
            </p>
          </div>
          <SimulationStatusBar
            status={sim.status}
            tick={sim.tick}
            speed={sim.speed}
            elapsedFormatted={sim.elapsedFormatted}
            activeLine={sim.activeLine}
          />
        </div>

        {/* Right: Global controls */}
        <div className="flex items-center gap-2 shrink-0 pt-8">
          <Button
            variant="primary"
            size="sm"
            icon={<Play size={14} />}
            onClick={sim.start}
            disabled={isRunning}
          >
            Start
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Pause size={14} />}
            onClick={sim.pause}
            disabled={isStopped || isPaused}
          >
            Pause
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Square size={14} />}
            onClick={handleStop}
            disabled={isStopped}
          >
            Stop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={sim.reset}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* ── SECTION A — Simulation Control Panel ───────────────────────── */}
      <SimulationControlPanel
        scenario={sim.scenario}           applyScenario={sim.applyScenario}
        speed={sim.speed}                 setSpeed={sim.setSpeed}
        activeLine={sim.activeLine}       setActiveLine={sim.setActiveLine}
        activeRecipeId={sim.activeRecipeId} setActiveRecipeId={sim.setActiveRecipeId}
        crane1Enabled={sim.crane1Enabled} setCrane1Enabled={sim.setCrane1Enabled}
        crane2Enabled={sim.crane2Enabled} setCrane2Enabled={sim.setCrane2Enabled}
        tankCount={sim.tankCount}         setTankCount={sim.setTankCount}
        faultType={sim.faultType}         setFaultType={sim.setFaultType}
        faultCrane={sim.faultCrane}       setFaultCrane={sim.setFaultCrane}
        injectFault={sim.injectFault}
        status={sim.status}
      />

      {/* ── SECTION B — Live Simulation View ───────────────────────────── */}
      <Card
        title="LIVE SIMULATION"
        accent="primary"
        action={
          <div className="flex items-center gap-3">
            <Badge variant="info" label="SIMULATED DATA" />
            <div className="flex items-center gap-1">
              {(['synoptic', 'table'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => sim.setView(v)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-scada transition-colors border
                    ${sim.view === v
                      ? 'bg-accent-primary text-scada-bg border-accent-primary'
                      : 'text-text-muted border-scada-border hover:border-accent-primary'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {/* Fault banner */}
        {sim.faultBanner && (
          <div className="mb-4 bg-status-alarm text-white text-xs font-mono px-4 py-2 rounded-scada flex items-center gap-2">
            {sim.faultBanner}
          </div>
        )}

        {/* Line name badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-text-muted text-[10px] font-mono uppercase tracking-wide">LINE:</span>
          <Badge variant="info" label={sim.activeLine} />
        </div>

        {sim.view === 'synoptic' ? (
          <SimulationSynoptic
            cranes={sim.cranes}
            tanks={sim.tanks}
            faultedCraneId={sim.faultedCraneId}
            tankCount={sim.tankCount}
          />
        ) : (
          <SimulationTableView
            cranes={sim.cranes}
            tanks={sim.tanks}
          />
        )}

      </Card>

      {/* ── SECTIONS C + D — Scenario Settings + Event Log ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 items-start">

        {/* Section C */}
        <ScenarioSettings
          parts={sim.parts}
          overrides={sim.overrides}
          timerSettings={sim.timerSettings}
          addPart={sim.addPart}
          removePart={sim.removePart}
          setOverride={sim.setOverride}
          setTimerSetting={sim.setTimerSetting}
        />

        {/* Section D */}
        <Card
          title="SIMULATION EVENT LOG"
          accent="primary"
          action={
            <span className="text-text-muted text-[10px] font-mono">
              {sim.events.length} events
            </span>
          }
        >
          <SimulationEventLog
            events={sim.events}
            eventFilter={sim.eventFilter}
            setEventFilter={sim.setEventFilter}
            clearEvents={sim.clearEvents}
            exportEvents={sim.exportEvents}
          />
        </Card>

      </div>

      {/* ── Stop Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        open={confirmStop}
        onClose={() => setConfirmStop(false)}
        title="Stop Simulation"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmStop(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmAndStop}>
              Stop & Reset
            </Button>
          </>
        }
      >
        <p className="text-text-primary text-sm font-mono">
          Stop simulation and reset all state?
        </p>
        <p className="text-text-muted text-xs font-mono mt-2">
          All crane positions, tank states, and the event log will be cleared.
          This cannot be undone.
        </p>
      </Modal>

    </div>
  )
}

