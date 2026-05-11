'use client'

// Client component — controlled PLC config forms with test connection simulation

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { StatusDot } from '@/components/ui/StatusDot'
import { Wifi } from '@/lib/icons'

interface PLCConfig {
  id: string
  displayName: string
  ip: string
  port: string
  rack: string
  slot: string
  protocol: string
  timeout: string
  retryAttempts: string
  pollInterval: string
  enabled: boolean
}

interface TestResult {
  success: boolean
  message: string
}

const DEFAULTS: PLCConfig[] = [
  {
    id: 'plc1',
    displayName: 'PLC LINE-1',
    ip: '192.168.1.10',
    port: '102',
    rack: '0',
    slot: '1',
    protocol: 'opcua',
    timeout: '5000',
    retryAttempts: '3',
    pollInterval: '500',
    enabled: true,
  },
  {
    id: 'plc2',
    displayName: 'PLC LINE-2',
    ip: '192.168.1.20',
    port: '102',
    rack: '0',
    slot: '1',
    protocol: 'opcua',
    timeout: '5000',
    retryAttempts: '3',
    pollInterval: '500',
    enabled: true,
  },
]

const PROTOCOL_OPTIONS = [
  { value: 'opcua', label: 'OPC UA' },
  { value: 'snap7', label: 'Snap7' },
  { value: 'mqtt',  label: 'MQTT' },
]

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/

interface PLCConnectionsTabProps {
  onDirty: () => void
  onCritical: () => void
}

export function PLCConnectionsTab({ onDirty, onCritical }: PLCConnectionsTabProps) {
  const [plcs, setPlcs] = useState<PLCConfig[]>(DEFAULTS)
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [ipErrors, setIpErrors] = useState<Record<string, string>>({})

  function updatePLC(id: string, field: keyof PLCConfig, value: string | boolean) {
    setPlcs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    onDirty()
    if (field === 'ip' || field === 'port') {
      onCritical()
      if (field === 'ip') {
        const v = value as string
        setIpErrors(prev => ({
          ...prev,
          [id]: IPV4_REGEX.test(v) ? '' : 'Invalid IPv4 address',
        }))
      }
    }
  }

  function testConnection(plc: PLCConfig) {
    setTesting(prev => ({ ...prev, [plc.id]: true }))
    setTestResults(prev => { const n = { ...prev }; delete n[plc.id]; return n })
    setTimeout(() => {
      const success = plc.id === 'plc1' ? true : Math.random() > 0.3
      setTestResults(prev => ({
        ...prev,
        [plc.id]: success
          ? { success: true,  message: '● Connection successful — 2ms' }
          : { success: false, message: '✘ Connection failed — timeout after 5000ms' },
      }))
      setTesting(prev => ({ ...prev, [plc.id]: false }))
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">PLC Connections</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">Configure Siemens S7-1500 PLC communication settings</p>
      </div>

      {plcs.map(plc => (
        <Card
          key={plc.id}
          accent={plc.enabled ? 'ok' : 'offline'}
          className={plc.enabled ? '' : 'opacity-60'}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi size={16} className="text-text-muted" />
              <span className="text-text-primary font-mono text-sm uppercase tracking-wide">{plc.displayName}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={plc.enabled ? 'ok' : 'offline'} size="md" />
              <span className={`text-xs font-mono uppercase ${plc.enabled ? 'text-status-ok' : 'text-status-offline'}`}>
                {plc.enabled ? 'CONNECTED' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={plc.displayName}
              onChange={e => updatePLC(plc.id, 'displayName', e.target.value)}
            />
            <Input
              label="IP Address"
              value={plc.ip}
              onChange={e => updatePLC(plc.id, 'ip', e.target.value)}
              error={ipErrors[plc.id]}
            />
            <Input
              label="Port"
              type="number"
              value={plc.port}
              onChange={e => updatePLC(plc.id, 'port', e.target.value)}
              unit="OPC UA"
            />
            <Input
              label="Rack"
              type="number"
              value={plc.rack}
              onChange={e => updatePLC(plc.id, 'rack', e.target.value)}
            />
            <Input
              label="Slot"
              type="number"
              value={plc.slot}
              onChange={e => updatePLC(plc.id, 'slot', e.target.value)}
            />
            <Select
              label="Protocol"
              value={plc.protocol}
              onChange={v => updatePLC(plc.id, 'protocol', v)}
              options={PROTOCOL_OPTIONS}
            />
            <Input
              label="Timeout"
              type="number"
              value={plc.timeout}
              onChange={e => updatePLC(plc.id, 'timeout', e.target.value)}
              unit="ms"
            />
            <Input
              label="Retry Attempts"
              type="number"
              value={plc.retryAttempts}
              onChange={e => updatePLC(plc.id, 'retryAttempts', e.target.value)}
            />
            <Input
              label="Poll Interval"
              type="number"
              value={plc.pollInterval}
              onChange={e => updatePLC(plc.id, 'pollInterval', e.target.value)}
              unit="ms"
            />
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Enabled</span>
              <div className="flex items-center gap-2 py-2">
                <Toggle
                  checked={plc.enabled}
                  onChange={v => updatePLC(plc.id, 'enabled', v)}
                />
                <span className="text-text-muted text-xs font-mono">{plc.enabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              loading={testing[plc.id]}
              onClick={() => testConnection(plc)}
            >
              Test Connection
            </Button>
            {testResults[plc.id] && (
              <span className={`text-xs font-mono ${testResults[plc.id].success ? 'text-status-ok' : 'text-status-alarm'}`}>
                {testResults[plc.id].message}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}



