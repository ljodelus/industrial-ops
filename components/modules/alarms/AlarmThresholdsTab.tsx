'use client'

// Client component — uses useState for threshold number inputs

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { BadgeProps } from '@/types'

interface ThresholdRow {
  id: string
  label: string
  value: number
  unit: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
}

const SEVERITY_BADGE: Record<string, BadgeProps['variant']> = {
  Critical: 'alarm',
  High:     'warning',
  Medium:   'gold',
  Low:      'ok',
}

interface ThresholdCardProps {
  title: string
  accent: 'alarm' | 'warning' | 'gold' | 'primary'
  rows: ThresholdRow[]
  onChange: (id: string, value: number) => void
}

function ThresholdCard({ title, accent, rows, onChange }: ThresholdCardProps) {
  return (
    <Card title={title} accent={accent}>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <span className="text-text-muted text-xs uppercase font-mono w-52 shrink-0">
              {row.label}
            </span>
            <input
              type="number"
              value={row.value}
              onChange={(e) => onChange(row.id, Number(e.target.value))}
              className="w-20 bg-scada-bg border border-scada-border text-text-primary text-sm px-2 py-1 rounded-scada outline-none focus:border-accent-primary text-right"
            />
            <span className="text-text-muted text-xs font-mono w-14">{row.unit}</span>
            <span className="text-text-muted text-xs mx-1">→</span>
            <Badge variant={SEVERITY_BADGE[row.severity]} label={row.severity} />
          </div>
        ))}
      </div>
    </Card>
  )
}

interface ThresholdsState {
  crane: ThresholdRow[]
  plc: ThresholdRow[]
  process: ThresholdRow[]
  zone: ThresholdRow[]
}

const INITIAL_STATE: ThresholdsState = {
  crane: [
    { id: 'motionTimeout',    label: 'Motion Timeout',        value: 30,  unit: 'seconds', severity: 'Critical' },
    { id: 'positionError',    label: 'Position Error Margin', value: 50,  unit: 'mm',      severity: 'High'     },
    { id: 'speedDeviation',   label: 'Speed Deviation',       value: 20,  unit: '%',       severity: 'Medium'   },
    { id: 'loadOverweight',   label: 'Load Overweight',       value: 110, unit: '%',       severity: 'Critical' },
  ],
  plc: [
    { id: 'commTimeout',      label: 'Comm Timeout',          value: 5,   unit: 'seconds', severity: 'High'     },
    { id: 'retryAttempts',    label: 'Retry Attempts',        value: 3,   unit: 'retries', severity: 'Critical' },
    { id: 'packetLoss',       label: 'Packet Loss Threshold', value: 10,  unit: '%',       severity: 'Medium'   },
  ],
  process: [
    { id: 'dwellOverrun',     label: 'Dwell Time Overrun',    value: 120, unit: 'seconds', severity: 'Medium'   },
    { id: 'tempDeviation',    label: 'Tank Temperature Dev',  value: 5,   unit: '°C',      severity: 'Low'      },
    { id: 'tankLevelLow',     label: 'Tank Level Low',        value: 20,  unit: '%',       severity: 'Low'      },
  ],
  zone: [
    { id: 'collisionRisk',    label: 'Collision Risk Distance', value: 500,  unit: 'mm', severity: 'Critical' },
    { id: 'cautionZone',      label: 'Caution Zone Distance',   value: 1000, unit: 'mm', severity: 'Medium'   },
  ],
}

interface AlarmThresholdsTabProps {
  onDirty: () => void
}

export function AlarmThresholdsTab({ onDirty }: AlarmThresholdsTabProps) {
  const [thresholds, setThresholds] = useState<ThresholdsState>(INITIAL_STATE)

  function updateRow(group: keyof ThresholdsState, id: string, value: number) {
    setThresholds(prev => ({
      ...prev,
      [group]: prev[group].map(r => r.id === id ? { ...r, value } : r),
    }))
    onDirty()
  }

  return (
    <div>
      <h2 className="text-text-value text-sm font-mono uppercase font-bold mb-1">
        Severity Thresholds
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Configure the conditions that determine alarm severity levels.
      </p>

      <div className="flex flex-col gap-4">
        <ThresholdCard
          title="Crane Thresholds"
          accent="alarm"
          rows={thresholds.crane}
          onChange={(id, value) => updateRow('crane', id, value)}
        />
        <ThresholdCard
          title="PLC Communication Thresholds"
          accent="warning"
          rows={thresholds.plc}
          onChange={(id, value) => updateRow('plc', id, value)}
        />
        <ThresholdCard
          title="Process Thresholds"
          accent="gold"
          rows={thresholds.process}
          onChange={(id, value) => updateRow('process', id, value)}
        />
        <ThresholdCard
          title="Zone Thresholds"
          accent="alarm"
          rows={thresholds.zone}
          onChange={(id, value) => updateRow('zone', id, value)}
        />
      </div>
    </div>
  )
}

