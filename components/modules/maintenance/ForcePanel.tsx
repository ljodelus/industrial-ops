'use client'

// Client component — Force Panel for DO and AO signals with safety confirmation step

import { useState } from 'react'
import { Button, EmptyState } from '@/components/ui'
import { SlidersHorizontal, AlertTriangle } from '@/lib/icons'
import type { IOSignal } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForcePanelProps {
  signal?:         IOSignal
  userName:        string
  plc:             string
  forcedOutputs:   Record<string, number>
  onForce:         (signal: IOSignal, value: number, userName: string) => void
  onRelease:       (signal: IOSignal) => void
}

// ─── DO Force Panel ───────────────────────────────────────────────────────────

interface DOForcePanelProps {
  signal:    IOSignal
  plcKey:    string
  forcedOutputs: Record<string, number>
  onConfirm: (value: number) => void
  onRelease: () => void
}

function DOForcePanel({ signal, plcKey, forcedOutputs, onConfirm, onRelease }: DOForcePanelProps) {
  const [selectedValue, setSelectedValue] = useState<0 | 1>(1)
  const [confirmStep,   setConfirmStep]   = useState(false)
  const [check1,        setCheck1]        = useState(false)
  const [check2,        setCheck2]        = useState(false)

  const isForced    = plcKey in forcedOutputs
  const currentHigh = signal.status === 'HIGH' || signal.status === 'FORCED'

  if (confirmStep) {
    return (
      <div className="space-y-4">
        {/* Confirmation header */}
        <div className="flex items-center gap-2 text-status-warning">
          <AlertTriangle size={14} />
          <span className="text-xs font-mono uppercase tracking-wide">Force Output Confirmation</span>
        </div>

        {/* Details */}
        <div className="bg-scada-bg border border-scada-border rounded-scada p-3 space-y-1 text-xs font-mono">
          <div className="flex gap-2">
            <span className="text-text-muted w-20">Signal:</span>
            <span className="text-text-primary">{signal.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-text-muted w-20">Address:</span>
            <span className="text-accent-primary">{signal.address}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-text-muted w-20">Action:</span>
            <span className="text-status-warning">Set {selectedValue === 1 ? 'HIGH (Force ON)' : 'LOW (Force OFF)'}</span>
          </div>
        </div>

        {/* Safety checkboxes */}
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={check1}
              onChange={e => setCheck1(e.target.checked)}
              className="mt-0.5 accent-status-warning"
            />
            <span className="text-xs font-mono text-text-primary group-hover:text-text-value">
              I confirm the production area is clear
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={check2}
              onChange={e => setCheck2(e.target.checked)}
              className="mt-0.5 accent-status-warning"
            />
            <span className="text-xs font-mono text-text-primary group-hover:text-text-value">
              I understand this will activate physical hardware
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setConfirmStep(false); setCheck1(false); setCheck2(false) }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!check1 || !check2}
            onClick={() => { onConfirm(selectedValue); setConfirmStep(false); setCheck1(false); setCheck2(false) }}
          >
            Confirm Force
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Signal info */}
      <div className="space-y-1 text-xs font-mono">
        <div className="flex gap-2">
          <span className="text-text-muted w-28">SIGNAL</span>
          <span className="text-text-primary">{signal.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">ADDRESS</span>
          <span className="text-accent-primary">{signal.address}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">TYPE</span>
          <span className="text-text-primary">Digital Output</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">CURRENT VALUE</span>
          <span className={currentHigh ? 'text-status-ok' : 'text-text-muted'}>
            {currentHigh ? 'HIGH' : 'LOW'}
          </span>
        </div>
      </div>

      {/* Toggle LOW/HIGH */}
      <div>
        <div className="text-text-muted text-[10px] font-mono uppercase mb-2">Set Value</div>
        <div className="flex gap-2">
          {([0, 1] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setSelectedValue(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-scada border text-xs font-mono transition-colors
                ${selectedValue === v
                  ? v === 1
                    ? 'bg-status-ok/20 border-status-ok/50 text-status-ok'
                    : 'bg-status-offline/20 border-status-offline/50 text-text-muted'
                  : 'border-scada-border text-text-muted hover:border-accent-primary'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${v === 1 ? 'bg-status-ok' : 'bg-status-offline'}`} />
              {v === 1 ? '● HIGH (1)' : '○ LOW (0)'}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => { setSelectedValue(1); setConfirmStep(true) }}>
          Force ON
        </Button>
        <Button variant="secondary" size="sm" onClick={() => { setSelectedValue(0); setConfirmStep(true) }}>
          Force OFF
        </Button>
        {isForced && (
          <Button variant="ghost" size="sm" onClick={onRelease}>
            Release Force
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── AO Force Panel ───────────────────────────────────────────────────────────

interface AOForcePanelProps {
  signal:    IOSignal
  plcKey:    string
  forcedOutputs: Record<string, number>
  onConfirm: (value: number) => void
  onRelease: () => void
}

function AOForcePanel({ signal, plcKey, forcedOutputs, onConfirm, onRelease }: AOForcePanelProps) {
  const min = signal.min ?? 0
  const max = signal.max ?? 100
  const [inputValue,  setInputValue]  = useState<string>(String(signal.value ?? min))
  const [confirmStep, setConfirmStep] = useState(false)
  const [check1,      setCheck1]      = useState(false)
  const [check2,      setCheck2]      = useState(false)

  const isForced = plcKey in forcedOutputs
  const numVal   = parseFloat(inputValue)
  const isValid  = !isNaN(numVal) && numVal >= min && numVal <= max
  const pct      = isValid ? ((numVal - min) / (max - min)) * 100 : 0

  if (confirmStep) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-status-warning">
          <AlertTriangle size={14} />
          <span className="text-xs font-mono uppercase tracking-wide">Force Output Confirmation</span>
        </div>
        <div className="bg-scada-bg border border-scada-border rounded-scada p-3 space-y-1 text-xs font-mono">
          <div className="flex gap-2">
            <span className="text-text-muted w-20">Signal:</span>
            <span className="text-text-primary">{signal.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-text-muted w-20">Address:</span>
            <span className="text-accent-primary">{signal.address}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-text-muted w-20">Set value:</span>
            <span className="text-status-warning">{numVal} {signal.unit}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)} className="mt-0.5" />
            <span className="text-xs font-mono text-text-primary">I confirm the production area is clear</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)} className="mt-0.5" />
            <span className="text-xs font-mono text-text-primary">I understand this will activate physical hardware</span>
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setConfirmStep(false); setCheck1(false); setCheck2(false) }}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" disabled={!check1 || !check2} onClick={() => { onConfirm(numVal); setConfirmStep(false); setCheck1(false); setCheck2(false) }}>
            Confirm Force
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Signal info */}
      <div className="space-y-1 text-xs font-mono">
        <div className="flex gap-2">
          <span className="text-text-muted w-28">SIGNAL</span>
          <span className="text-text-primary">{signal.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">ADDRESS</span>
          <span className="text-accent-primary">{signal.address}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">TYPE</span>
          <span className="text-text-primary">Analog Output</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">RANGE</span>
          <span className="text-text-primary">{min} – {max} {signal.unit}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-28">CURRENT</span>
          <span className="value-display text-text-value">{signal.value?.toFixed(1)} {signal.unit}</span>
        </div>
      </div>

      {/* Value input */}
      <div>
        <div className="text-text-muted text-[10px] font-mono uppercase mb-2">Set Value</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={min}
            max={max}
            step={0.1}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-24 bg-scada-bg border border-scada-border rounded-scada text-text-value text-sm font-mono px-2 py-1 focus:outline-none focus:border-accent-primary"
          />
          <span className="text-text-muted text-xs font-mono">{signal.unit}</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={isValid ? numVal : min}
          onChange={e => setInputValue(e.target.value)}
          className="w-full mt-3"
          style={{ accentColor: 'var(--color-accent-primary)' }}
        />

        {/* Slider labels */}
        <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
          <span>{min}</span>
          <span className="text-accent-primary">{isValid ? numVal.toFixed(1) : '--'} {signal.unit}</span>
          <span>{max}</span>
        </div>

        {/* Mini progress */}
        <div className="h-1 bg-scada-border rounded-scada mt-1 overflow-hidden">
          <div
            className="h-full bg-accent-primary rounded-scada transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={!isValid}
          onClick={() => setConfirmStep(true)}
        >
          Apply Force
        </Button>
        {isForced && (
          <Button variant="ghost" size="sm" onClick={onRelease}>
            Release Force
          </Button>
        )}
      </div>

      {!isValid && (
        <p className="text-status-alarm text-[10px] font-mono">
          Value must be between {min} and {max} {signal.unit}
        </p>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ForcePanel({ signal, userName, plc, forcedOutputs, onForce, onRelease }: ForcePanelProps) {
  if (!signal) {
    return (
      <EmptyState
        icon={<SlidersHorizontal size={40} />}
        message='Click [Force] on a Digital Output or Analog Output to control it here.'
      />
    )
  }

  const plcKey = `${plc}:${signal.address}`

  function handleForce(value: number) {
    onForce(signal!, value, userName)
  }

  function handleRelease() {
    onRelease(signal!)
  }

  return (
    <div>
      {signal.type === 'DO' ? (
        <DOForcePanel
          signal={signal}
          plcKey={plcKey}
          forcedOutputs={forcedOutputs}
          onConfirm={handleForce}
          onRelease={handleRelease}
        />
      ) : (
        <AOForcePanel
          signal={signal}
          plcKey={plcKey}
          forcedOutputs={forcedOutputs}
          onConfirm={handleForce}
          onRelease={handleRelease}
        />
      )}
    </div>
  )
}

