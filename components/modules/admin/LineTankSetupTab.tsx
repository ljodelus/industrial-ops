'use client'

// Client component — line & tank setup with add/remove/reorder tanks

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { StatusDot } from '@/components/ui/StatusDot'
import { Plus, Trash2, ChevronUp, ChevronDown } from '@/lib/icons'

interface Tank {
  id: string
  name: string
  position: string
  minDwell: string
  maxDwell: string
}

interface LineConfig {
  id: string
  displayName: string
  description: string
  assignedCranes: string
  enabled: boolean
  tanks: Tank[]
}

const DEFAULT_LINES: LineConfig[] = [
  {
    id: 'line1',
    displayName: 'LINE-1',
    description: 'Zinc plating line',
    assignedCranes: 'CRANE-1, CRANE-2',
    enabled: true,
    tanks: [
      { id: 't1', name: 'LOAD',      position: '0',    minDwell: '0',   maxDwell: '0' },
      { id: 't2', name: 'DEGREASE',  position: '1000', minDwell: '300', maxDwell: '420' },
      { id: 't3', name: 'RINSE 1',   position: '2000', minDwell: '60',  maxDwell: '120' },
      { id: 't4', name: 'ZINC BATH', position: '3000', minDwell: '600', maxDwell: '900' },
      { id: 't5', name: 'RINSE 2',   position: '4000', minDwell: '60',  maxDwell: '120' },
      { id: 't6', name: 'UNLOAD',    position: '5000', minDwell: '0',   maxDwell: '0' },
    ],
  },
  {
    id: 'line2',
    displayName: 'LINE-2',
    description: 'Phosphate treatment line',
    assignedCranes: 'CRANE-3, CRANE-4',
    enabled: true,
    tanks: [
      { id: 't7', name: 'LOAD',       position: '0',    minDwell: '0',   maxDwell: '0' },
      { id: 't8', name: 'DEGREASE',   position: '1000', minDwell: '300', maxDwell: '420' },
      { id: 't9', name: 'PHOSPHATE',  position: '2000', minDwell: '180', maxDwell: '300' },
      { id: 't10', name: 'RINSE',     position: '3000', minDwell: '60',  maxDwell: '120' },
      { id: 't11', name: 'UNLOAD',    position: '4000', minDwell: '0',   maxDwell: '0' },
    ],
  },
]

let nextTankId = 20

interface LineTankSetupTabProps {
  onDirty: () => void
}

export function LineTankSetupTab({ onDirty }: LineTankSetupTabProps) {
  const [lines, setLines] = useState<LineConfig[]>(DEFAULT_LINES.map(l => ({
    ...l, tanks: l.tanks.map(t => ({ ...t })),
  })))

  function updateLine(id: string, field: keyof Omit<LineConfig, 'tanks'>, value: string | boolean) {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
    onDirty()
  }

  function updateTank(lineId: string, tankId: string, field: keyof Tank, value: string) {
    setLines(prev => prev.map(l =>
      l.id === lineId
        ? { ...l, tanks: l.tanks.map(t => t.id === tankId ? { ...t, [field]: value } : t) }
        : l
    ))
    onDirty()
  }

  function addTank(lineId: string) {
    setLines(prev => prev.map(l => {
      if (l.id !== lineId) return l
      const lastPos = l.tanks.length > 0 ? parseInt(l.tanks[l.tanks.length - 1].position, 10) : -1000
      const newId = `t${nextTankId++}`
      return {
        ...l,
        tanks: [...l.tanks, { id: newId, name: 'NEW TANK', position: String(lastPos + 1000), minDwell: '0', maxDwell: '0' }],
      }
    }))
    onDirty()
  }

  function removeTank(lineId: string, tankId: string) {
    setLines(prev => prev.map(l => {
      if (l.id !== lineId) return l
      if (l.tanks.length <= 2) return l
      return { ...l, tanks: l.tanks.filter(t => t.id !== tankId) }
    }))
    onDirty()
  }

  function moveTank(lineId: string, tankId: string, direction: 'up' | 'down') {
    setLines(prev => prev.map(l => {
      if (l.id !== lineId) return l
      const idx = l.tanks.findIndex(t => t.id === tankId)
      if (direction === 'up' && idx === 0) return l
      if (direction === 'down' && idx === l.tanks.length - 1) return l
      const newTanks = [...l.tanks]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      ;[newTanks[idx], newTanks[swapIdx]] = [newTanks[swapIdx], newTanks[idx]]
      return { ...l, tanks: newTanks }
    }))
    onDirty()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">Line &amp; Tank Setup</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">Configure production lines and tank positions</p>
      </div>

      {lines.map(line => (
        <Card key={line.id} accent={line.enabled ? 'ok' : 'offline'} className={line.enabled ? '' : 'opacity-60'}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-primary font-mono text-sm uppercase tracking-wide">{line.displayName}</span>
            <div className="flex items-center gap-2">
              <StatusDot status={line.enabled ? 'ok' : 'offline'} size="md" />
              <span className={`text-xs font-mono uppercase ${line.enabled ? 'text-status-ok' : 'text-status-offline'}`}>
                {line.enabled ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Display Name"
              value={line.displayName}
              onChange={e => updateLine(line.id, 'displayName', e.target.value)}
            />
            <Input
              label="Description"
              value={line.description}
              onChange={e => updateLine(line.id, 'description', e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Assigned Cranes</span>
              <span className="text-text-value font-mono text-sm value-display py-2">{line.assignedCranes}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Enabled</span>
              <div className="flex items-center gap-2 py-2">
                <Toggle checked={line.enabled} onChange={v => updateLine(line.id, 'enabled', v)} />
                <span className="text-text-muted text-xs font-mono">{line.enabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

          {/* Tank Table */}
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Tanks</span>
            <div className="mt-2 border border-scada-border rounded-scada overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-scada-border bg-scada-bg">
                    <th className="text-left text-text-muted px-2 py-2 w-8">#</th>
                    <th className="text-left text-text-muted px-2 py-2">Name</th>
                    <th className="text-left text-text-muted px-2 py-2">Position</th>
                    <th className="text-left text-text-muted px-2 py-2">Min Dwell</th>
                    <th className="text-left text-text-muted px-2 py-2">Max Dwell</th>
                    <th className="text-left text-text-muted px-2 py-2 w-20">Order</th>
                    <th className="w-8 px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {line.tanks.map((tank, idx) => (
                    <tr key={tank.id} className="border-b border-scada-border last:border-0">
                      <td className="px-2 py-1.5 text-text-muted">{idx + 1}</td>
                      <td className="px-1 py-1">
                        <input
                          value={tank.name}
                          onChange={e => updateTank(line.id, tank.id, 'name', e.target.value)}
                          className="w-full bg-scada-bg border border-scada-border text-text-primary text-xs px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
                        />
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tank.position}
                            onChange={e => updateTank(line.id, tank.id, 'position', e.target.value)}
                            className="w-20 bg-scada-bg border border-scada-border text-text-primary text-xs px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
                          />
                          <span className="text-text-muted text-xs">mm</span>
                        </div>
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tank.minDwell}
                            onChange={e => updateTank(line.id, tank.id, 'minDwell', e.target.value)}
                            className="w-16 bg-scada-bg border border-scada-border text-text-primary text-xs px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
                          />
                          <span className="text-text-muted text-xs">s</span>
                        </div>
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tank.maxDwell}
                            onChange={e => updateTank(line.id, tank.id, 'maxDwell', e.target.value)}
                            className="w-16 bg-scada-bg border border-scada-border text-text-primary text-xs px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
                          />
                          <span className="text-text-muted text-xs">s</span>
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveTank(line.id, tank.id, 'up')}
                            disabled={idx === 0}
                            className="text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTank(line.id, tank.id, 'down')}
                            disabled={idx === line.tanks.length - 1}
                            className="text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => removeTank(line.id, tank.id)}
                          disabled={line.tanks.length <= 2}
                          className="text-text-muted hover:text-status-alarm disabled:opacity-30 transition-colors"
                          title={line.tanks.length <= 2 ? 'Minimum 2 tanks required' : 'Remove tank'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => addTank(line.id)}
              >
                Add Tank
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}




