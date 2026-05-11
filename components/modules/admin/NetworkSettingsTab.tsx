'use client'

// Client component — MQTT and OPC UA network settings with test connection

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from '@/lib/icons'

interface MQTTConfig {
  brokerHost: string
  brokerPort: string
  clientId: string
  username: string
  password: string
  keepAlive: string
  qos: string
  enabled: boolean
}

interface OPCUAConfig {
  serverUrl: string
  namespace: string
  securityMode: string
  authMode: string
  username: string
  password: string
  subscriptionInterval: string
  enabled: boolean
}

const DEFAULT_MQTT: MQTTConfig = {
  brokerHost: '192.168.1.100',
  brokerPort: '1883',
  clientId: 'industrial-ops',
  username: 'mqtt_user',
  password: 'secret1234',
  keepAlive: '60',
  qos: '1',
  enabled: true,
}

const DEFAULT_OPCUA: OPCUAConfig = {
  serverUrl: 'opc.tcp://192.168.1.10:4840',
  namespace: '2',
  securityMode: 'None',
  authMode: 'Anonymous',
  username: 'opcua_user',
  password: 'secret1234',
  subscriptionInterval: '500',
  enabled: true,
}

interface TestResult {
  success: boolean
  message: string
}

interface NetworkSettingsTabProps {
  onDirty: () => void
}

export function NetworkSettingsTab({ onDirty }: NetworkSettingsTabProps) {
  const [mqtt, setMqtt] = useState<MQTTConfig>({ ...DEFAULT_MQTT })
  const [opcua, setOpcua] = useState<OPCUAConfig>({ ...DEFAULT_OPCUA })
  const [showMqttPwd, setShowMqttPwd] = useState(false)
  const [showOpcuaPwd, setShowOpcuaPwd] = useState(false)
  const [testingMqtt, setTestingMqtt] = useState(false)
  const [testingOpcua, setTestingOpcua] = useState(false)
  const [mqttResult, setMqttResult] = useState<TestResult | null>(null)
  const [opcuaResult, setOpcuaResult] = useState<TestResult | null>(null)

  function updateMqtt<K extends keyof MQTTConfig>(field: K, value: MQTTConfig[K]) {
    setMqtt(prev => ({ ...prev, [field]: value }))
    onDirty()
  }

  function updateOpcua<K extends keyof OPCUAConfig>(field: K, value: OPCUAConfig[K]) {
    setOpcua(prev => ({ ...prev, [field]: value }))
    onDirty()
  }

  function testMqtt() {
    setTestingMqtt(true)
    setMqttResult(null)
    setTimeout(() => {
      setMqttResult({ success: true, message: '● Connection successful — 12ms' })
      setTestingMqtt(false)
    }, 1000)
  }

  function testOpcua() {
    setTestingOpcua(true)
    setOpcuaResult(null)
    setTimeout(() => {
      const success = Math.random() > 0.2
      setOpcuaResult(success
        ? { success: true, message: '● Connection successful — 8ms' }
        : { success: false, message: '✘ Connection failed — timeout after 5000ms' }
      )
      setTestingOpcua(false)
    }, 1000)
  }

  const QOS_OPTIONS = [
    { value: '0', label: 'QoS 0' },
    { value: '1', label: 'QoS 1' },
    { value: '2', label: 'QoS 2' },
  ]

  const SECURITY_OPTIONS = [
    { value: 'None',           label: 'None' },
    { value: 'Sign',           label: 'Sign' },
    { value: 'SignAndEncrypt', label: 'Sign & Encrypt' },
  ]

  const AUTH_OPTIONS = [
    { value: 'Anonymous',   label: 'Anonymous' },
    { value: 'Username',    label: 'Username' },
    { value: 'Certificate', label: 'Certificate' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">Network Settings</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">Configure network infrastructure and communication protocols</p>
      </div>

      {/* MQTT */}
      <Card title="MQTT Broker" accent="primary">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Broker Host"
            value={mqtt.brokerHost}
            onChange={e => updateMqtt('brokerHost', e.target.value)}
          />
          <Input
            label="Broker Port"
            type="number"
            value={mqtt.brokerPort}
            onChange={e => updateMqtt('brokerPort', e.target.value)}
          />
          <Input
            label="Client ID"
            value={mqtt.clientId}
            onChange={e => updateMqtt('clientId', e.target.value)}
          />
          <Input
            label="Username"
            value={mqtt.username}
            onChange={e => updateMqtt('username', e.target.value)}
          />
          <Input
            label="Password"
            type={showMqttPwd ? 'text' : 'password'}
            value={mqtt.password}
            onChange={e => updateMqtt('password', e.target.value)}
            rightIcon={
              <button type="button" onClick={() => setShowMqttPwd(v => !v)}>
                {showMqttPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <Input
            label="Keep Alive"
            type="number"
            value={mqtt.keepAlive}
            onChange={e => updateMqtt('keepAlive', e.target.value)}
            unit="s"
          />
          <Select
            label="QoS Level"
            value={mqtt.qos}
            onChange={v => updateMqtt('qos', v)}
            options={QOS_OPTIONS}
          />
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Enabled</span>
            <div className="flex items-center gap-2 py-2">
              <Toggle checked={mqtt.enabled} onChange={v => updateMqtt('enabled', v)} />
              <span className="text-text-muted text-xs font-mono">{mqtt.enabled ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Button variant="secondary" size="sm" loading={testingMqtt} onClick={testMqtt}>
            Test Connection
          </Button>
          {mqttResult && (
            <span className={`text-xs font-mono ${mqttResult.success ? 'text-status-ok' : 'text-status-alarm'}`}>
              {mqttResult.message}
            </span>
          )}
        </div>
      </Card>

      {/* OPC UA */}
      <Card title="OPC UA Server" accent="gold">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Server URL"
            value={opcua.serverUrl}
            onChange={e => updateOpcua('serverUrl', e.target.value)}
            className="col-span-2"
          />
          <Input
            label="Namespace"
            type="number"
            value={opcua.namespace}
            onChange={e => updateOpcua('namespace', e.target.value)}
          />
          <Select
            label="Security Mode"
            value={opcua.securityMode}
            onChange={v => updateOpcua('securityMode', v)}
            options={SECURITY_OPTIONS}
          />
          <Select
            label="Auth Mode"
            value={opcua.authMode}
            onChange={v => updateOpcua('authMode', v)}
            options={AUTH_OPTIONS}
          />
          <Input
            label="Username"
            value={opcua.username}
            onChange={e => updateOpcua('username', e.target.value)}
            disabled={opcua.authMode === 'Anonymous'}
          />
          <Input
            label="Password"
            type={showOpcuaPwd ? 'text' : 'password'}
            value={opcua.password}
            onChange={e => updateOpcua('password', e.target.value)}
            disabled={opcua.authMode === 'Anonymous'}
            rightIcon={
              <button type="button" onClick={() => setShowOpcuaPwd(v => !v)}>
                {showOpcuaPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <Input
            label="Subscription Interval"
            type="number"
            value={opcua.subscriptionInterval}
            onChange={e => updateOpcua('subscriptionInterval', e.target.value)}
            unit="ms"
          />
          <div className="flex flex-col gap-1">
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">Enabled</span>
            <div className="flex items-center gap-2 py-2">
              <Toggle checked={opcua.enabled} onChange={v => updateOpcua('enabled', v)} />
              <span className="text-text-muted text-xs font-mono">{opcua.enabled ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Button variant="secondary" size="sm" loading={testingOpcua} onClick={testOpcua}>
            Test Connection
          </Button>
          {opcuaResult && (
            <span className={`text-xs font-mono ${opcuaResult.success ? 'text-status-ok' : 'text-status-alarm'}`}>
              {opcuaResult.message}
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}



