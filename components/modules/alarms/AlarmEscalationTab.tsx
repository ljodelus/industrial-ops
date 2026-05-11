'use client'

// Client component — uses useState for escalation steps, inputs, toggles, and master switch

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'

interface EscalationStep {
  id: string
  delayMinutes: number
  description: string
  enabled: boolean
}

const INITIAL_STEPS: EscalationStep[] = [
  { id: 'step1', delayMinutes: 5,  description: 'Severity increases by 1 level',               enabled: true  },
  { id: 'step2', delayMinutes: 10, description: 'Repeat notification',                          enabled: true  },
  { id: 'step3', delayMinutes: 20, description: 'Escalate to SUPERVISOR role',                  enabled: true  },
  { id: 'step4', delayMinutes: 30, description: 'Escalate to ENGINEER role',                    enabled: true  },
  { id: 'step5', delayMinutes: 60, description: 'Mark as CRITICAL regardless of original severity', enabled: true },
]

interface AlarmEscalationTabProps {
  onDirty: () => void
}

export function AlarmEscalationTab({ onDirty }: AlarmEscalationTabProps) {
  const [escalationEnabled, setEscalationEnabled] = useState(true)
  const [steps, setSteps] = useState<EscalationStep[]>(INITIAL_STEPS)

  function toggleMaster(val: boolean) {
    setEscalationEnabled(val)
    onDirty()
  }

  function updateDelay(id: string, delayMinutes: number) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, delayMinutes } : s))
    onDirty()
  }

  function updateStepEnabled(id: string, enabled: boolean) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, enabled } : s))
    onDirty()
  }

  return (
    <div>
      <h2 className="text-text-value text-sm font-mono uppercase font-bold mb-1">
        Escalation Rules
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Define how unacknowledged alarms escalate over time.
      </p>

      <Card accent="alarm">
        {/* Master toggle */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-scada-border">
          <span className="text-text-primary text-xs font-mono uppercase font-bold">
            Escalation Enabled
          </span>
          <Toggle checked={escalationEnabled} onChange={toggleMaster} />
        </div>

        {/* Escalation ladder */}
        <div className={`flex flex-col gap-0 ${!escalationEnabled ? 'opacity-40' : ''}`}>
          {/* Trigger */}
          <div className="text-text-muted text-xs font-mono uppercase mb-2">
            Alarm Triggered
          </div>

          {steps.map((step, idx) => (
            <div key={step.id}>
              {/* Connector arrow */}
              <div className="flex items-center gap-2 py-1">
                <div className="w-5 text-center text-text-muted text-sm">↓</div>
                <div className="flex-1 border-l border-scada-border ml-1" />
              </div>

              {/* Step row */}
              <div className="flex items-center gap-3 pl-6 py-2 bg-scada-bg border border-scada-border rounded-scada">
                {/* Delay input */}
                <input
                  type="number"
                  value={step.delayMinutes}
                  disabled={!escalationEnabled || !step.enabled}
                  onChange={(e) => updateDelay(step.id, Number(e.target.value))}
                  className={`w-14 bg-scada-surface border border-scada-border text-text-primary text-sm px-2 py-1 rounded-scada outline-none focus:border-accent-primary text-right
                    ${(!escalationEnabled || !step.enabled) ? 'cursor-not-allowed opacity-60' : ''}`}
                />
                <span className="text-text-muted text-xs font-mono">min</span>
                <span className="text-text-muted text-xs mx-1">→</span>
                <span className="text-text-muted text-xs flex-1">{step.description}</span>
                <Toggle
                  checked={step.enabled}
                  onChange={(val) => updateStepEnabled(step.id, val)}
                  disabled={!escalationEnabled}
                />
              </div>

              {/* Final label */}
              {idx === steps.length - 1 && (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-5 text-center text-text-muted text-sm">↓</div>
                  </div>
                  <div className="pl-6 text-status-alarm text-xs font-mono uppercase">
                    Alarm Resolved or Manually Cleared
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

