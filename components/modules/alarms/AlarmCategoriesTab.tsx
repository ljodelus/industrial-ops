'use client'

// Client component — uses useState for category field edits and toggle interactions

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  MoveHorizontal,
  Wifi,
  FlaskConical,
  ClipboardList,
  Activity,
  AlertOctagon,
} from '@/lib/icons'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'

type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

interface CategoryConfig {
  id: string
  name: string
  Icon: LucideIcon
  description: string
  defaultSeverity: Severity
  autoAcknowledge: boolean
  notifyOnTrigger: boolean
  enabled: boolean
}

const SEVERITY_OPTIONS = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High',     label: 'High' },
  { value: 'Medium',   label: 'Medium' },
  { value: 'Low',      label: 'Low' },
  { value: 'Info',     label: 'Info' },
]

const SEVERITY_BADGE: Record<Severity, 'alarm' | 'warning' | 'gold' | 'ok' | 'offline'> = {
  Critical: 'alarm',
  High:     'warning',
  Medium:   'gold',
  Low:      'ok',
  Info:     'offline',
}

const INITIAL_CATEGORIES: CategoryConfig[] = [
  {
    id: 'motion',
    name: 'Motion',
    Icon: MoveHorizontal,
    description: 'Motion timeout, rail obstruction, encoder failure',
    defaultSeverity: 'Critical',
    autoAcknowledge: false,
    notifyOnTrigger: true,
    enabled: true,
  },
  {
    id: 'communication',
    name: 'Communication',
    Icon: Wifi,
    description: 'PLC timeout, network loss, protocol errors',
    defaultSeverity: 'High',
    autoAcknowledge: false,
    notifyOnTrigger: true,
    enabled: true,
  },
  {
    id: 'process',
    name: 'Process',
    Icon: FlaskConical,
    description: 'Dwell time overrun, temperature deviation, level anomaly',
    defaultSeverity: 'Medium',
    autoAcknowledge: false,
    notifyOnTrigger: true,
    enabled: true,
  },
  {
    id: 'recipe',
    name: 'Recipe',
    Icon: ClipboardList,
    description: 'Invalid recipe, parameter mismatch, version conflict',
    defaultSeverity: 'Medium',
    autoAcknowledge: true,
    notifyOnTrigger: false,
    enabled: true,
  },
  {
    id: 'sensor',
    name: 'Sensor',
    Icon: Activity,
    description: 'Signal loss, out-of-range reading, calibration fault',
    defaultSeverity: 'Low',
    autoAcknowledge: false,
    notifyOnTrigger: true,
    enabled: true,
  },
  {
    id: 'collision',
    name: 'Collision',
    Icon: AlertOctagon,
    description: 'Zone intrusion, collision risk, barrier breach',
    defaultSeverity: 'Critical',
    autoAcknowledge: false,
    notifyOnTrigger: true,
    enabled: true,
  },
]

interface AlarmCategoriesTabProps {
  onDirty: () => void
}

export function AlarmCategoriesTab({ onDirty }: AlarmCategoriesTabProps) {
  const [categories, setCategories] = useState<CategoryConfig[]>(INITIAL_CATEGORIES)

  function updateCategory<K extends keyof CategoryConfig>(
    id: string,
    field: K,
    value: CategoryConfig[K]
  ) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    onDirty()
  }

  return (
    <div>
      <h2 className="text-text-value text-sm font-mono uppercase font-bold mb-1">
        Alarm Categories
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Define which conditions generate alarms and their default severity.
      </p>

      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const { Icon } = cat
          return (
            <Card key={cat.id} className={cat.enabled ? '' : 'opacity-50'}>
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-text-muted" />
                  <span className="text-text-value text-sm font-mono uppercase font-bold">
                    {cat.name}
                  </span>
                  <Badge variant={SEVERITY_BADGE[cat.defaultSeverity]} label={cat.defaultSeverity} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-xs font-mono">
                    {cat.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                  <Toggle
                    checked={cat.enabled}
                    onChange={(val) => updateCategory(cat.id, 'enabled', val)}
                  />
                </div>
              </div>

              <p className="text-text-muted text-xs mb-4">{cat.description}</p>

              <div className="flex flex-col gap-3">
                {/* Default severity */}
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs uppercase font-mono">Default Severity</span>
                  <Select
                    value={cat.defaultSeverity}
                    onChange={(val) => updateCategory(cat.id, 'defaultSeverity', val as Severity)}
                    options={SEVERITY_OPTIONS}
                    disabled={!cat.enabled}
                    className="w-36"
                  />
                </div>

                {/* Auto-acknowledge */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-text-muted text-xs uppercase font-mono">Auto-Acknowledge</span>
                    {cat.autoAcknowledge && (
                      <span className="text-text-muted text-xs font-mono ml-2">(after 5 min)</span>
                    )}
                  </div>
                  <Toggle
                    checked={cat.autoAcknowledge}
                    onChange={(val) => updateCategory(cat.id, 'autoAcknowledge', val)}
                    disabled={!cat.enabled}
                  />
                </div>

                {/* Notify on trigger */}
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs uppercase font-mono">Notify on Trigger</span>
                  <Toggle
                    checked={cat.notifyOnTrigger}
                    onChange={(val) => updateCategory(cat.id, 'notifyOnTrigger', val)}
                    disabled={!cat.enabled}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

