'use client'

// Client component — Section A: Simulation Control Panel (4 sub-panels)

import { Card, Select, Input, Toggle } from '@/components/ui'
import { ScenarioSelector }  from './ScenarioSelector'
import { SpeedControl }      from './SpeedControl'
import { FaultInjector }     from './FaultInjector'
import type { SimulationState, SimulationActions } from '@/lib/hooks/useSimulationEngine'

type ControlPanelProps = Pick<
  SimulationState & SimulationActions,
  | 'scenario'       | 'applyScenario'
  | 'speed'          | 'setSpeed'
  | 'activeLine'     | 'setActiveLine'
  | 'activeRecipeId' | 'setActiveRecipeId'
  | 'crane1Enabled'  | 'setCrane1Enabled'
  | 'crane2Enabled'  | 'setCrane2Enabled'
  | 'tankCount'      | 'setTankCount'
  | 'faultType'      | 'setFaultType'
  | 'faultCrane'     | 'setFaultCrane'
  | 'injectFault'
  | 'status'
>

const LINE_OPTIONS = [
  { value: 'LINE-1', label: 'LINE-1' },
  { value: 'LINE-2', label: 'LINE-2' },
]

const RECIPE_OPTIONS = [
  { value: 'recipe-1', label: 'ZINC STANDARD' },
  { value: 'recipe-2', label: 'PHOSPHATE LIGHT' },
  { value: 'recipe-3', label: 'HEAVY DEGREASING' },
]

function PanelDivider() {
  return <div className="hidden lg:block w-px bg-scada-border self-stretch" />
}

export function SimulationControlPanel(props: ControlPanelProps) {
  const {
    scenario, applyScenario,
    speed, setSpeed,
    activeLine, setActiveLine,
    activeRecipeId, setActiveRecipeId,
    crane1Enabled, setCrane1Enabled,
    crane2Enabled, setCrane2Enabled,
    tankCount, setTankCount,
    faultType, setFaultType,
    faultCrane, setFaultCrane,
    injectFault,
    status,
  } = props

  return (
    <Card title="SIMULATION CONTROLS" accent="gold">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sub-panel 1: Scenario Selection ─────────────────── */}
        <div className="space-y-3">
          <ScenarioSelector value={scenario} onChange={applyScenario} />
        </div>

        <PanelDivider />

        {/* ── Sub-panel 2: Speed Control ───────────────────────── */}
        <div className="space-y-3">
          <SpeedControl value={speed} onChange={setSpeed} />
        </div>

        <PanelDivider />

        {/* ── Sub-panel 3: Line & Recipe Config ───────────────── */}
        <div className="space-y-3">
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
            LINE & RECIPE CONFIGURATION
          </div>

          <Select
            label="ACTIVE LINE"
            value={activeLine}
            onChange={setActiveLine}
            options={LINE_OPTIONS}
          />

          <Select
            label="ACTIVE RECIPE"
            value={activeRecipeId}
            onChange={setActiveRecipeId}
            options={RECIPE_OPTIONS}
          />

          <div className="space-y-2">
            <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">CRANES</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Toggle checked={crane1Enabled} onChange={setCrane1Enabled} />
                <span className="text-text-primary text-xs font-mono">CRANE-1</span>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={crane2Enabled} onChange={setCrane2Enabled} />
                <span className="text-text-primary text-xs font-mono">CRANE-2</span>
              </div>
            </div>
          </div>

          <Input
            label="TANK COUNT"
            type="number"
            value={tankCount}
            onChange={e => setTankCount(Number(e.target.value))}
          />
          <div className="text-text-muted text-[10px] font-mono">min: 2  max: 12</div>
        </div>

        <PanelDivider />

        {/* ── Sub-panel 4: Fault Injection ─────────────────────── */}
        <div className="space-y-3">
          <FaultInjector
            faultType={faultType}
            faultCrane={faultCrane}
            onFaultType={setFaultType}
            onFaultCrane={setFaultCrane}
            onInject={injectFault}
            disabled={status === 'stopped'}
          />
        </div>

      </div>
    </Card>
  )
}


