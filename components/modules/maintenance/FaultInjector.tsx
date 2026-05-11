'use client'

// Client component — fault type selector, crane selector (when needed), and inject button

import { Button, Select } from '@/components/ui'
import { Zap } from '@/lib/icons'
import { FAULT_DEFINITIONS } from '@/lib/simulation/faults'

interface FaultInjectorProps {
  faultType:    string
  faultCrane:   string
  onFaultType:  (t: string) => void
  onFaultCrane: (c: string) => void
  onInject:     () => void
  disabled?:    boolean
}

const CRANE_OPTIONS = [
  { value: 'CRANE-1', label: 'CRANE-1' },
  { value: 'CRANE-2', label: 'CRANE-2' },
  { value: 'CRANE-3', label: 'CRANE-3' },
  { value: 'CRANE-4', label: 'CRANE-4' },
]

const FAULT_OPTIONS = [
  { value: '', label: 'Select fault type' },
  ...FAULT_DEFINITIONS.map(f => ({ value: f.id, label: f.label })),
]

export function FaultInjector({
  faultType,
  faultCrane,
  onFaultType,
  onFaultCrane,
  onInject,
  disabled = false,
}: FaultInjectorProps) {
  const selected = FAULT_DEFINITIONS.find(f => f.id === faultType)

  return (
    <div className="space-y-3">
      <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
        INJECT FAULT
      </div>

      <Select
        value={faultType}
        onChange={onFaultType}
        options={FAULT_OPTIONS}
        disabled={disabled}
      />

      {selected?.requiresCrane && (
        <Select
          label="TARGET CRANE"
          value={faultCrane}
          onChange={onFaultCrane}
          options={CRANE_OPTIONS}
          disabled={disabled}
        />
      )}

      <Button
        variant="secondary"
        size="sm"
        icon={<Zap size={14} className="text-status-alarm" />}
        onClick={onInject}
        disabled={disabled || !faultType}
        className="w-full border-status-alarm/40 text-status-alarm hover:border-status-alarm"
      >
        Inject Fault
      </Button>
    </div>
  )
}


