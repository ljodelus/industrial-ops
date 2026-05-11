'use client'

// Client component — crane configuration cards with shared zones management

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { StatusDot } from '@/components/ui/StatusDot'
import { Plus, Trash2 } from '@/lib/icons'

interface SharedZone {
  id: string
  withCrane: string
  fromMm: string
  toMm: string
}

interface CraneConfig {
  id: string
  displayName: string
  line: string
  maxSpeed: string
  maxLoad: string
  railLength: string
  homePosition: string
  acceleration: string
  deceleration: string
  enabled: boolean
  sharedZones: SharedZone[]
}

const DEFAULT_CRANES: CraneConfig[] = [
  {
    id: 'crane1',
    displayName: 'CRANE-1',
    line: 'LINE-1',
    maxSpeed: '18',
    maxLoad: '1000',
    railLength: '8000',
    homePosition: '0',
    acceleration: '2',
    deceleration: '3',
    enabled: true,
    sharedZones: [{ id: 'z1', withCrane: 'CRANE-3', fromMm: '800', toMm: '1600' }],
  },
  {
    id: 'crane2',
    displayName: 'CRANE-2',
    line: 'LINE-1',
    maxSpeed: '18',
    maxLoad: '1000',
    railLength: '8000',
    homePosition: '0',
    acceleration: '2',
    deceleration: '3',
    enabled: true,
    sharedZones: [],
  },
  {
    id: 'crane3',
    displayName: 'CRANE-3',
    line: 'LINE-2',
    maxSpeed: '15',
    maxLoad: '800',
    railLength: '6000',
    homePosition: '0',
    acceleration: '1.5',
    deceleration: '2.5',
    enabled: true,
    sharedZones: [],
  },
  {
    id: 'crane4',
    displayName: 'CRANE-4',
    line: 'LINE-2',
    maxSpeed: '15',
    maxLoad: '800',
    railLength: '6000',
    homePosition: '0',
    acceleration: '1.5',
    deceleration: '2.5',
    enabled: true,
    sharedZones: [],
  },
]

const LINE_OPTIONS = [
  { value: 'LINE-1', label: 'LINE-1' },
  { value: 'LINE-2', label: 'LINE-2' },
]

interface CraneConfigTabProps {
  onDirty: () => void
  onCritical: () => void
}

let nextZoneId = 10
let nextCraneId = 5

export function CraneConfigTab({ onDirty, onCritical }: CraneConfigTabProps) {
  const [cranes, setCranes] = useState<CraneConfig[]>(DEFAULT_CRANES.map(c => ({
    ...c,
    sharedZones: c.sharedZones.map(z => ({ ...z })),
  })))

  function updateCrane(id: string, field: keyof CraneConfig, value: string | boolean) {
    setCranes(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    onDirty()
    if (field === 'railLength') onCritical()
  }

  function addZone(craneId: string) {
    const id = `z${nextZoneId++}`
    setCranes(prev => prev.map(c =>
      c.id === craneId
        ? { ...c, sharedZones: [...c.sharedZones, { id, withCrane: 'CRANE-3', fromMm: '0', toMm: '0' }] }
        : c
    ))
    onDirty()
  }

  function removeZone(craneId: string, zoneId: string) {
    setCranes(prev => prev.map(c =>
      c.id === craneId
        ? { ...c, sharedZones: c.sharedZones.filter(z => z.id !== zoneId) }
        : c
    ))
    onDirty()
  }

  function updateZone(craneId: string, zoneId: string, field: keyof SharedZone, value: string) {
    setCranes(prev => prev.map(c =>
      c.id === craneId
        ? { ...c, sharedZones: c.sharedZones.map(z => z.id === zoneId ? { ...z, [field]: value } : z) }
        : c
    ))
    onDirty()
  }

  function addCrane() {
    if (cranes.length >= 8) return
    const id = `crane${nextCraneId++}`
    setCranes(prev => [...prev, {
      id,
      displayName: `CRANE-${nextCraneId - 1}`,
      line: 'LINE-1',
      maxSpeed: '18',
      maxLoad: '1000',
      railLength: '8000',
      homePosition: '0',
      acceleration: '2',
      deceleration: '3',
      enabled: true,
      sharedZones: [],
    }])
    onDirty()
    onCritical()
  }

  const craneNames = cranes.map(c => ({ value: c.displayName, label: c.displayName }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">Crane Configuration</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">Define crane properties and operational limits</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cranes.map(crane => (
          <Card key={crane.id} accent={crane.enabled ? 'ok' : 'offline'} className={crane.enabled ? '' : 'opacity-60'}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-primary font-mono text-sm uppercase tracking-wide">{crane.displayName}</span>
              <div className="flex items-center gap-2">
                <StatusDot status={crane.enabled ? 'ok' : 'offline'} size="md" />
                <span className={`text-xs font-mono uppercase ${crane.enabled ? 'text-status-ok' : 'text-status-offline'}`}>
                  {crane.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Display Name"
                value={crane.displayName}
                onChange={e => updateCrane(crane.id, 'displayName', e.target.value)}
              />
              <Select
                label="Production Line"
                value={crane.line}
                onChange={v => updateCrane(crane.id, 'line', v)}
                options={LINE_OPTIONS}
              />
              <Input
                label="Max Speed"
                type="number"
                value={crane.maxSpeed}
                onChange={e => updateCrane(crane.id, 'maxSpeed', e.target.value)}
                unit="m/min"
              />
              <Input
                label="Max Load"
                type="number"
                value={crane.maxLoad}
                onChange={e => updateCrane(crane.id, 'maxLoad', e.target.value)}
                unit="kg"
              />
              <Input
                label="Rail Length"
                type="number"
                value={crane.railLength}
                onChange={e => updateCrane(crane.id, 'railLength', e.target.value)}
                unit="mm"
              />
              <Input
                label="Home Position"
                type="number"
                value={crane.homePosition}
                onChange={e => updateCrane(crane.id, 'homePosition', e.target.value)}
                unit="mm"
              />
              <Input
                label="Acceleration"
                type="number"
                value={crane.acceleration}
                onChange={e => updateCrane(crane.id, 'acceleration', e.target.value)}
                unit="m/s²"
              />
              <Input
                label="Deceleration"
                type="number"
                value={crane.deceleration}
                onChange={e => updateCrane(crane.id, 'deceleration', e.target.value)}
                unit="m/s²"
              />
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Enabled</span>
                <div className="flex items-center gap-2 py-2">
                  <Toggle checked={crane.enabled} onChange={v => updateCrane(crane.id, 'enabled', v)} />
                  <span className="text-text-muted text-xs font-mono">{crane.enabled ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>

            {/* Shared Zones */}
            <div className="mt-4">
              <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Shared Zones</span>
              <div className="mt-2 flex flex-col gap-2">
                {crane.sharedZones.map(zone => (
                  <div key={zone.id} className="flex items-center gap-2">
                    <span className="text-text-muted text-xs font-mono">with</span>
                    <Select
                      value={zone.withCrane}
                      onChange={v => updateZone(crane.id, zone.id, 'withCrane', v)}
                      options={craneNames.filter(n => n.value !== crane.displayName)}
                      className="flex-1"
                    />
                    <span className="text-text-muted text-xs font-mono">from</span>
                    <Input
                      type="number"
                      value={zone.fromMm}
                      onChange={e => updateZone(crane.id, zone.id, 'fromMm', e.target.value)}
                      unit="mm"
                      className="w-24"
                    />
                    <span className="text-text-muted text-xs font-mono">to</span>
                    <Input
                      type="number"
                      value={zone.toMm}
                      onChange={e => updateZone(crane.id, zone.id, 'toMm', e.target.value)}
                      unit="mm"
                      className="w-24"
                    />
                    <button
                      type="button"
                      onClick={() => removeZone(crane.id, zone.id)}
                      className="text-text-muted hover:text-status-alarm transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => addZone(crane.id)}
                  className="self-start mt-1"
                >
                  Add Zone
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={addCrane}
          disabled={cranes.length >= 8}
        >
          Add Crane
        </Button>
        {cranes.length >= 8 && (
          <span className="text-text-muted text-xs font-mono">Maximum 8 cranes reached</span>
        )}
      </div>
    </div>
  )
}



