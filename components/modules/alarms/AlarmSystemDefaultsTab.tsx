'use client'

// Client component — uses useState for display / data settings

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'

interface AlarmSystemDefaultsTabProps {
  onDirty: () => void
}

interface DisplaySettings {
  soundAlerts:          boolean
  blinkUnacknowledged:  boolean
  showAlarmBanner:      boolean
  autoScrollOnNew:      boolean
  maxVisibleInTopbar:   number
  timestampFormat:      string
}

interface DataSettings {
  historyRetention: number
  exportFormat:     string
  maxExportRows:    number
  alarmIdPrefix:    string
}

const INITIAL_DISPLAY: DisplaySettings = {
  soundAlerts:         false,
  blinkUnacknowledged: true,
  showAlarmBanner:     true,
  autoScrollOnNew:     true,
  maxVisibleInTopbar:  5,
  timestampFormat:     'HH:MM:SS',
}

const INITIAL_DATA: DataSettings = {
  historyRetention: 90,
  exportFormat:     'CSV',
  maxExportRows:    10000,
  alarmIdPrefix:    'ALM-',
}

const TIMESTAMP_OPTIONS = [
  { value: 'HH:MM:SS', label: 'HH:MM:SS' },
  { value: 'HH:MM',    label: 'HH:MM'    },
  { value: 'Relative', label: 'Relative' },
]

const EXPORT_FORMAT_OPTIONS = [
  { value: 'CSV',   label: 'CSV'   },
  { value: 'JSON',  label: 'JSON'  },
  { value: 'Excel', label: 'Excel' },
]

export function AlarmSystemDefaultsTab({ onDirty }: AlarmSystemDefaultsTabProps) {
  const [display, setDisplay] = useState<DisplaySettings>(INITIAL_DISPLAY)
  const [data, setData]       = useState<DataSettings>(INITIAL_DATA)

  function updateDisplay<K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) {
    setDisplay(prev => ({ ...prev, [key]: value }))
    onDirty()
  }

  function updateData<K extends keyof DataSettings>(key: K, value: DataSettings[K]) {
    setData(prev => ({ ...prev, [key]: value }))
    onDirty()
  }

  return (
    <div>
      <h2 className="text-text-value text-sm font-mono uppercase font-bold mb-1">
        System Defaults
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Global alarm system behavior and display settings.
      </p>

      <div className="flex flex-col gap-4">
        {/* Display Settings */}
        <Card title="Display Settings" accent="primary">
          <div className="flex flex-col gap-4">
            {/* Boolean toggles */}
            {(
              [
                { key: 'soundAlerts',         label: 'Sound Alerts'         },
                { key: 'blinkUnacknowledged', label: 'Blink Unacknowledged' },
                { key: 'showAlarmBanner',     label: 'Show Alarm Banner'    },
                { key: 'autoScrollOnNew',     label: 'Auto-Scroll on New'   },
              ] as { key: keyof DisplaySettings; label: string }[]
            ).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-text-muted text-xs uppercase font-mono">{label}</span>
                <Toggle
                  checked={display[key] as boolean}
                  onChange={(val) => updateDisplay(key, val)}
                />
              </div>
            ))}

            {/* Max visible in topbar */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase font-mono">Max Visible in Topbar</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={display.maxVisibleInTopbar}
                  min={1}
                  max={20}
                  onChange={(e) => updateDisplay('maxVisibleInTopbar', Number(e.target.value))}
                  className="w-16 bg-scada-bg border border-scada-border text-text-primary text-sm px-2 py-1 rounded-scada outline-none focus:border-accent-primary text-right"
                />
                <span className="text-text-muted text-xs font-mono">alarms</span>
              </div>
            </div>

            {/* Timestamp format */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase font-mono">Timestamp Format</span>
              <Select
                value={display.timestampFormat}
                onChange={(val) => updateDisplay('timestampFormat', val)}
                options={TIMESTAMP_OPTIONS}
                className="w-36"
              />
            </div>
          </div>
        </Card>

        {/* Data Settings */}
        <Card title="Data Settings" accent="gold">
          <div className="flex flex-col gap-4">
            {/* History retention */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase font-mono">History Retention</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.historyRetention}
                  onChange={(e) => updateData('historyRetention', Number(e.target.value))}
                  className="w-20 bg-scada-bg border border-scada-border text-text-primary text-sm px-2 py-1 rounded-scada outline-none focus:border-accent-primary text-right"
                />
                <span className="text-text-muted text-xs font-mono">days</span>
              </div>
            </div>

            {/* Export format */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase font-mono">Export Format</span>
              <Select
                value={data.exportFormat}
                onChange={(val) => updateData('exportFormat', val)}
                options={EXPORT_FORMAT_OPTIONS}
                className="w-36"
              />
            </div>

            {/* Max export rows */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase font-mono">Max Export Rows</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.maxExportRows}
                  onChange={(e) => updateData('maxExportRows', Number(e.target.value))}
                  className="w-24 bg-scada-bg border border-scada-border text-text-primary text-sm px-2 py-1 rounded-scada outline-none focus:border-accent-primary text-right"
                />
                <span className="text-text-muted text-xs font-mono">rows</span>
              </div>
            </div>

            {/* Alarm ID prefix */}
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs uppercase font-mono">Alarm ID Prefix</span>
              <input
                type="text"
                value={data.alarmIdPrefix}
                onChange={(e) => updateData('alarmIdPrefix', e.target.value)}
                className="w-28 bg-scada-bg border border-scada-border text-text-primary text-sm px-2 py-1 rounded-scada outline-none focus:border-accent-primary font-mono"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

