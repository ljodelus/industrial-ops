'use client'

// Client component — Section C: Scenario Settings (part queue + sensor overrides + timer settings)

import { useState } from 'react'
import { Card, Button, Input, Select, Toggle } from '@/components/ui'
import { Plus, Trash2 } from '@/lib/icons'
import type { SimPart, SensorOverrides, TimerSettings } from '@/lib/simulation/engine'
import type { SimulationActions } from '@/lib/hooks/useSimulationEngine'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScenarioSettingsProps {
  parts:           SimPart[]
  overrides:       SensorOverrides
  timerSettings:   TimerSettings
  addPart:         SimulationActions['addPart']
  removePart:      SimulationActions['removePart']
  setOverride:     SimulationActions['setOverride']
  setTimerSetting: SimulationActions['setTimerSetting']
}

// ─── Add Part inline form ─────────────────────────────────────────────────────

const RECIPE_OPTIONS = [
  { value: 'recipe-1', label: 'ZINC STANDARD' },
  { value: 'recipe-2', label: 'PHOSPHATE LIGHT' },
  { value: 'recipe-3', label: 'HEAVY DEGREASING' },
]

interface AddPartFormProps {
  nextPriority: number
  onAdd:        (part: SimPart) => void
}

function AddPartForm({ nextPriority, onAdd }: AddPartFormProps) {
  const [recipeId,   setRecipeId]   = useState('recipe-1')
  const [partId,     setPartId]     = useState('P-0050')
  const [priority,   setPriority]   = useState(nextPriority)

  const recipeName = RECIPE_OPTIONS.find(r => r.value === recipeId)?.label ?? 'ZINC STANDARD'

  function handleAdd() {
    onAdd({ id: partId, recipeId, recipeName, priority })
    // Generate a new part ID for the next add
    const nextId = `P-${String(Date.now()).slice(-4)}`
    setPartId(nextId)
    setPriority(p => p + 1)
  }

  return (
    <div className="bg-scada-bg border border-scada-border rounded-scada p-3 space-y-2">
      <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide mb-1">
        ADD PART
      </div>
      <Input
        label="PART ID"
        value={partId}
        onChange={e => setPartId(e.target.value)}
      />
      <Select
        label="RECIPE"
        value={recipeId}
        onChange={setRecipeId}
        options={RECIPE_OPTIONS}
      />
      <Input
        label="PRIORITY"
        type="number"
        value={priority}
        onChange={e => setPriority(Number(e.target.value))}
      />
      <Button variant="secondary" size="sm" onClick={handleAdd} className="w-full">
        Add to Queue
      </Button>
    </div>
  )
}

// ─── ScenarioSettings ─────────────────────────────────────────────────────────

export function ScenarioSettings({
  parts,
  overrides,
  timerSettings,
  addPart,
  removePart,
  setOverride,
  setTimerSetting,
}: ScenarioSettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <Card title="SCENARIO SETTINGS" accent="gold">
      <div className="space-y-6">

        {/* ── C1: Part Queue ──────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
              PARTS IN QUEUE
              <span className="ml-2 text-accent-primary">{parts.length}</span>
            </div>
          </div>

          {parts.length === 0 ? (
            <div className="text-text-muted text-xs font-mono text-center py-3">
              No parts in queue
            </div>
          ) : (
            <div className="space-y-1">
              {parts.map(part => (
                <div
                  key={part.id}
                  className="flex items-center justify-between bg-scada-bg border border-scada-border rounded-scada px-3 py-2"
                >
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="value-display text-accent-primary">{part.id}</span>
                    <span className="text-text-muted">{part.recipeName}</span>
                    <span className="text-text-muted text-[10px]">Priority {part.priority}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePart(part.id)}
                    className="text-text-muted hover:text-status-alarm transition-colors p-1"
                    aria-label={`Remove ${part.id}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAddForm ? (
            <AddPartForm
              nextPriority={parts.length + 1}
              onAdd={p => { addPart(p); setShowAddForm(false) }}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={12} />}
              onClick={() => setShowAddForm(true)}
              className="w-full border border-dashed border-scada-border"
            >
              Add Part
            </Button>
          )}
        </div>

        {/* ── C2: Sensor Overrides ──────────────────────── */}
        <div className="space-y-3">
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
            SENSOR OVERRIDES
          </div>

          {/* CRANE-1 Encoder */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                label="CRANE-1 ENCODER"
                type="number"
                value={overrides.crane1EncoderValue}
                onChange={e => setOverride('crane1EncoderValue', Number(e.target.value))}
                disabled={!overrides.crane1EncoderOverride}
                unit="mm"
              />
            </div>
            <div className="pt-5 flex items-center gap-1.5">
              <Toggle
                checked={overrides.crane1EncoderOverride}
                onChange={v => setOverride('crane1EncoderOverride', v)}
              />
              <span className="text-text-muted text-[10px] font-mono">
                {overrides.crane1EncoderOverride ? 'OVERRIDE' : 'AUTO'}
              </span>
            </div>
          </div>

          {/* CRANE-2 Encoder */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                label="CRANE-2 ENCODER"
                type="number"
                value={overrides.crane2EncoderValue}
                onChange={e => setOverride('crane2EncoderValue', Number(e.target.value))}
                disabled={!overrides.crane2EncoderOverride}
                unit="mm"
              />
            </div>
            <div className="pt-5 flex items-center gap-1.5">
              <Toggle
                checked={overrides.crane2EncoderOverride}
                onChange={v => setOverride('crane2EncoderOverride', v)}
              />
              <span className="text-text-muted text-[10px] font-mono">
                {overrides.crane2EncoderOverride ? 'OVERRIDE' : 'AUTO'}
              </span>
            </div>
          </div>

          {/* Load Cell C1 */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                label="LOAD CELL C1"
                type="number"
                value={overrides.crane1LoadValue}
                onChange={e => setOverride('crane1LoadValue', Number(e.target.value))}
                disabled={!overrides.crane1LoadOverride}
                unit="kg"
              />
            </div>
            <div className="pt-5 flex items-center gap-1.5">
              <Toggle
                checked={overrides.crane1LoadOverride}
                onChange={v => setOverride('crane1LoadOverride', v)}
              />
              <span className="text-text-muted text-[10px] font-mono">
                {overrides.crane1LoadOverride ? 'OVERRIDE' : 'AUTO'}
              </span>
            </div>
          </div>
        </div>

        {/* ── C3: Timer Acceleration Settings ────────────── */}
        <div className="space-y-3">
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
            TIMER ACCELERATION SETTINGS
          </div>

          <Input
            label="CRANE SPEED"
            type="number"
            value={timerSettings.craneSpeedMpm}
            onChange={e => setTimerSetting('craneSpeedMpm', Number(e.target.value))}
            unit="m/min"
          />
          <Input
            label="MIN DWELL TIME"
            type="number"
            value={timerSettings.minDwellPct}
            onChange={e => setTimerSetting('minDwellPct', Number(e.target.value))}
            unit="%"
          />
          <Input
            label="PREF DWELL TIME"
            type="number"
            value={timerSettings.prefDwellPct}
            onChange={e => setTimerSetting('prefDwellPct', Number(e.target.value))}
            unit="%"
          />
          <Input
            label="MAX DWELL TIME"
            type="number"
            value={timerSettings.maxDwellPct}
            onChange={e => setTimerSetting('maxDwellPct', Number(e.target.value))}
            unit="%"
          />
          <Input
            label="TRANSFER DELAY"
            type="number"
            value={timerSettings.transferDelaySec}
            onChange={e => setTimerSetting('transferDelaySec', Number(e.target.value))}
            unit="sec"
          />
          <div className="text-text-muted text-[10px] font-mono">
            Changes take effect on next simulation tick.
          </div>
        </div>

      </div>
    </Card>
  )
}

