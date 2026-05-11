'use client'

// Client component — uses useState for time limit fields and toggles

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'

interface TimeLimitSetting {
  id: string
  label: string
  value: number
  unit: string
  enabled: boolean
  descriptionBefore: string
  descriptionAfter: string
}

const INITIAL_SETTINGS: TimeLimitSetting[] = [
  {
    id:                'ackTimeout',
    label:             'Acknowledge Timeout',
    value:             10,
    unit:              'minutes',
    enabled:           true,
    descriptionBefore: 'After',
    descriptionAfter:  'minutes, escalate unacknowledged alarms by one severity level.',
  },
  {
    id:                'autoClear',
    label:             'Auto-Clear Acknowledged',
    value:             60,
    unit:              'minutes',
    enabled:           true,
    descriptionBefore: 'Clear acknowledged alarms from Active view after',
    descriptionAfter:  'minutes.',
  },
  {
    id:                'shiftReport',
    label:             'Shift Report Window',
    value:             8,
    unit:              'hours',
    enabled:           false,
    descriptionBefore: 'Generate automatic alarm summary every',
    descriptionAfter:  'hours.',
  },
  {
    id:                'retention',
    label:             'Alarm Retention',
    value:             90,
    unit:              'days',
    enabled:           true,
    descriptionBefore: 'Keep alarm history for',
    descriptionAfter:  'days before archiving.',
  },
]

interface AlarmTimeLimitsTabProps {
  onDirty: () => void
}

export function AlarmTimeLimitsTab({ onDirty }: AlarmTimeLimitsTabProps) {
  const [settings, setSettings] = useState<TimeLimitSetting[]>(INITIAL_SETTINGS)

  function updateValue(id: string, value: number) {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s))
    onDirty()
  }

  function updateEnabled(id: string, enabled: boolean) {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled } : s))
    onDirty()
  }

  return (
    <div>
      <h2 className="text-text-value text-sm font-mono uppercase font-bold mb-1">
        Time Limits
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Configure time-based alarm triggers and auto-actions.
      </p>

      <Card accent="primary">
        <div className="flex flex-col divide-y divide-scada-border">
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex-1">
                <p className="text-text-primary text-xs font-mono uppercase font-bold mb-1">
                  {setting.label}
                </p>
                <p className="text-text-muted text-sm flex items-center flex-wrap gap-1">
                  <span>{setting.descriptionBefore}</span>
                  <input
                    type="number"
                    value={setting.value}
                    disabled={!setting.enabled}
                    onChange={(e) => updateValue(setting.id, Number(e.target.value))}
                    className={`w-16 bg-scada-bg border border-scada-border text-text-primary text-sm px-2 py-0.5 rounded-scada outline-none focus:border-accent-primary text-center
                      ${!setting.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  />
                  <span>{setting.descriptionAfter}</span>
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <Toggle
                  checked={setting.enabled}
                  onChange={(val) => updateEnabled(setting.id, val)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

