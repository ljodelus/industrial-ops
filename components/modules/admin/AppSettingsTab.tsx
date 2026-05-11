'use client'

// Client component — application display, production defaults, and data storage settings

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'

interface DisplayConfig {
  appName: string
  dateFormat: string
  timeFormat: string
  timezone: string
  language: string
  refreshInterval: string
}

interface ProductionConfig {
  defaultLine: string
  defaultRecipe: string
  autoAssignCrane: boolean
  maxQueueSize: string
  jobTimeout: string
  shiftDuration: string
  shiftStartTime: string
}

interface StorageConfig {
  dataRetention: string
  maxAlarmHistory: string
  maxJobHistory: string
  autoBackup: boolean
  backupInterval: string
  exportFormat: string
}

const DEFAULT_DISPLAY: DisplayConfig = {
  appName: 'Industrial Ops UI',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:MM:SS',
  timezone: 'UTC',
  language: 'English',
  refreshInterval: '2000',
}

const DEFAULT_PRODUCTION: ProductionConfig = {
  defaultLine: 'LINE-1',
  defaultRecipe: 'ZINC STANDARD',
  autoAssignCrane: true,
  maxQueueSize: '50',
  jobTimeout: '120',
  shiftDuration: '8',
  shiftStartTime: '06:00',
}

const DEFAULT_STORAGE: StorageConfig = {
  dataRetention: '90',
  maxAlarmHistory: '10000',
  maxJobHistory: '5000',
  autoBackup: true,
  backupInterval: '24',
  exportFormat: 'CSV',
}

interface AppSettingsTabProps {
  onDirty: () => void
}

export function AppSettingsTab({ onDirty }: AppSettingsTabProps) {
  const [display, setDisplay]       = useState<DisplayConfig>({ ...DEFAULT_DISPLAY })
  const [production, setProduction] = useState<ProductionConfig>({ ...DEFAULT_PRODUCTION })
  const [storage, setStorage]       = useState<StorageConfig>({ ...DEFAULT_STORAGE })

  function upd<T>(setter: React.Dispatch<React.SetStateAction<T>>, field: keyof T, value: T[keyof T]) {
    setter(prev => ({ ...prev, [field]: value }))
    onDirty()
  }

  const DATE_OPTS = [
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  ]
  const TIME_OPTS = [
    { value: 'HH:MM:SS', label: 'HH:MM:SS' },
    { value: 'HH:MM',    label: 'HH:MM' },
  ]
  const TZ_OPTS = ['UTC','UTC+1','UTC+2','UTC+3','UTC-5','UTC-8'].map(v => ({ value: v, label: v }))
  const LINE_OPTS = [
    { value: 'LINE-1', label: 'LINE-1' },
    { value: 'LINE-2', label: 'LINE-2' },
  ]
  const RECIPE_OPTS = [
    { value: 'ZINC STANDARD', label: 'ZINC STANDARD' },
    { value: 'ZINC LIGHT',    label: 'ZINC LIGHT' },
    { value: 'PHOSPHATE STD', label: 'PHOSPHATE STD' },
  ]
  const EXPORT_OPTS = [
    { value: 'CSV',   label: 'CSV' },
    { value: 'JSON',  label: 'JSON' },
    { value: 'Excel', label: 'Excel' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">Application Settings</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">UI, display, and behavior preferences</p>
      </div>

      {/* Display */}
      <Card title="Display" accent="primary">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Application Name"
            value={display.appName}
            onChange={e => upd(setDisplay, 'appName', e.target.value)}
          />
          <Select
            label="Date Format"
            value={display.dateFormat}
            onChange={v => upd(setDisplay, 'dateFormat', v)}
            options={DATE_OPTS}
          />
          <Select
            label="Time Format"
            value={display.timeFormat}
            onChange={v => upd(setDisplay, 'timeFormat', v)}
            options={TIME_OPTS}
          />
          <Select
            label="Timezone"
            value={display.timezone}
            onChange={v => upd(setDisplay, 'timezone', v)}
            options={TZ_OPTS}
          />
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Language</span>
            <span className="text-text-value font-mono text-sm value-display py-2">English</span>
          </div>
          <Input
            label="Refresh Interval"
            type="number"
            value={display.refreshInterval}
            onChange={e => upd(setDisplay, 'refreshInterval', e.target.value)}
            unit="ms"
          />
        </div>
      </Card>

      {/* Production Defaults */}
      <Card title="Production Defaults" accent="gold">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Default Line"
            value={production.defaultLine}
            onChange={v => upd(setProduction, 'defaultLine', v)}
            options={LINE_OPTS}
          />
          <Select
            label="Default Recipe"
            value={production.defaultRecipe}
            onChange={v => upd(setProduction, 'defaultRecipe', v)}
            options={RECIPE_OPTS}
          />
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Auto Assign Crane</span>
            <div className="flex items-center gap-2 py-2">
              <Toggle checked={production.autoAssignCrane} onChange={v => upd(setProduction, 'autoAssignCrane', v)} />
              <span className="text-text-muted text-xs font-mono">{production.autoAssignCrane ? 'ON' : 'OFF'}</span>
            </div>
          </div>
          <Input
            label="Max Queue Size"
            type="number"
            value={production.maxQueueSize}
            onChange={e => upd(setProduction, 'maxQueueSize', e.target.value)}
            unit="jobs"
          />
          <Input
            label="Job Timeout"
            type="number"
            value={production.jobTimeout}
            onChange={e => upd(setProduction, 'jobTimeout', e.target.value)}
            unit="min"
          />
          <Input
            label="Shift Duration"
            type="number"
            value={production.shiftDuration}
            onChange={e => upd(setProduction, 'shiftDuration', e.target.value)}
            unit="h"
          />
          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs uppercase tracking-wide font-mono">Shift Start Time</label>
            <input
              type="time"
              value={production.shiftStartTime}
              onChange={e => upd(setProduction, 'shiftStartTime', e.target.value)}
              className="w-full bg-scada-bg border border-scada-border text-text-primary text-sm px-3 py-2 rounded-scada outline-none transition-colors focus:border-accent-primary"
            />
          </div>
        </div>
      </Card>

      {/* Data & Storage */}
      <Card title="Data &amp; Storage" accent="primary">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data Retention"
            type="number"
            value={storage.dataRetention}
            onChange={e => upd(setStorage, 'dataRetention', e.target.value)}
            unit="days"
          />
          <Input
            label="Max Alarm History"
            type="number"
            value={storage.maxAlarmHistory}
            onChange={e => upd(setStorage, 'maxAlarmHistory', e.target.value)}
            unit="rec"
          />
          <Input
            label="Max Job History"
            type="number"
            value={storage.maxJobHistory}
            onChange={e => upd(setStorage, 'maxJobHistory', e.target.value)}
            unit="rec"
          />
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Auto Backup</span>
            <div className="flex items-center gap-2 py-2">
              <Toggle checked={storage.autoBackup} onChange={v => upd(setStorage, 'autoBackup', v)} />
              <span className="text-text-muted text-xs font-mono">{storage.autoBackup ? 'ON' : 'OFF'}</span>
            </div>
          </div>
          <Input
            label="Backup Interval"
            type="number"
            value={storage.backupInterval}
            onChange={e => upd(setStorage, 'backupInterval', e.target.value)}
            unit="h"
            disabled={!storage.autoBackup}
          />
          <Select
            label="Export Format"
            value={storage.exportFormat}
            onChange={v => upd(setStorage, 'exportFormat', v)}
            options={EXPORT_OPTS}
          />
        </div>
      </Card>
    </div>
  )
}




