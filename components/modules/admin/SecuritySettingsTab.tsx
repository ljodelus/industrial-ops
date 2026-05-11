'use client'

// Client component — session/auth and access logging security settings

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'

interface SessionConfig {
  sessionTimeout: string
  maxFailedLogins: string
  lockoutDuration: string
  passwordMinLength: string
  passwordExpiry: string
  requireUppercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  mfaEnabled: boolean
}

interface AccessLoggingConfig {
  logAllLogins: boolean
  logFailedLogins: boolean
  logConfigChanges: boolean
  logAlarmActions: boolean
  logJobActions: boolean
  auditRetention: string
  ipWhitelist: boolean
  allowedIPs: string
}

const DEFAULT_SESSION: SessionConfig = {
  sessionTimeout: '480',
  maxFailedLogins: '5',
  lockoutDuration: '30',
  passwordMinLength: '6',
  passwordExpiry: '90',
  requireUppercase: false,
  requireNumbers: true,
  requireSymbols: false,
  mfaEnabled: false,
}

const DEFAULT_LOGGING: AccessLoggingConfig = {
  logAllLogins: true,
  logFailedLogins: true,
  logConfigChanges: true,
  logAlarmActions: true,
  logJobActions: true,
  auditRetention: '365',
  ipWhitelist: false,
  allowedIPs: '',
}

interface SecuritySettingsTabProps {
  onDirty: () => void
}

export function SecuritySettingsTab({ onDirty }: SecuritySettingsTabProps) {
  const [session, setSession] = useState<SessionConfig>({ ...DEFAULT_SESSION })
  const [logging, setLogging] = useState<AccessLoggingConfig>({ ...DEFAULT_LOGGING })

  function updSession<K extends keyof SessionConfig>(field: K, value: SessionConfig[K]) {
    setSession(prev => ({ ...prev, [field]: value }))
    onDirty()
  }

  function updLogging<K extends keyof AccessLoggingConfig>(field: K, value: AccessLoggingConfig[K]) {
    setLogging(prev => ({ ...prev, [field]: value }))
    onDirty()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">Security Settings</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">Authentication, session, and access control settings</p>
      </div>

      {/* Session & Auth */}
      <Card title="Session &amp; Auth" accent="primary">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Session Timeout"
            type="number"
            value={session.sessionTimeout}
            onChange={e => updSession('sessionTimeout', e.target.value)}
            unit="min"
          />
          <Input
            label="Max Failed Logins"
            type="number"
            value={session.maxFailedLogins}
            onChange={e => updSession('maxFailedLogins', e.target.value)}
            unit="attempts"
          />
          <Input
            label="Lockout Duration"
            type="number"
            value={session.lockoutDuration}
            onChange={e => updSession('lockoutDuration', e.target.value)}
            unit="min"
          />
          <Input
            label="Password Min Length"
            type="number"
            value={session.passwordMinLength}
            onChange={e => updSession('passwordMinLength', e.target.value)}
            unit="chars"
          />
          <Input
            label="Password Expiry"
            type="number"
            value={session.passwordExpiry}
            onChange={e => updSession('passwordExpiry', e.target.value)}
            unit="days"
          />
          <div />

          {(
            [
              { field: 'requireUppercase' as const, label: 'Require Uppercase' },
              { field: 'requireNumbers'  as const, label: 'Require Numbers' },
              { field: 'requireSymbols'  as const, label: 'Require Symbols' },
              { field: 'mfaEnabled'      as const, label: 'MFA Enabled' },
            ]
          ).map(({ field, label }) => (
            <div key={field} className="flex flex-col gap-1">
              <span className="text-text-muted text-xs uppercase tracking-wide font-mono">{label}</span>
              <div className="flex items-center gap-2 py-2">
                <Toggle checked={session[field] as boolean} onChange={v => updSession(field, v)} />
                <span className="text-text-muted text-xs font-mono">{(session[field] as boolean) ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Access Logging */}
      <Card title="Access Logging" accent="gold">
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              { field: 'logAllLogins'      as const, label: 'Log All Logins' },
              { field: 'logFailedLogins'   as const, label: 'Log Failed Logins' },
              { field: 'logConfigChanges'  as const, label: 'Log Config Changes' },
              { field: 'logAlarmActions'   as const, label: 'Log Alarm Actions' },
              { field: 'logJobActions'     as const, label: 'Log Job Actions' },
              { field: 'ipWhitelist'       as const, label: 'IP Whitelist' },
            ]
          ).map(({ field, label }) => (
            <div key={field} className="flex flex-col gap-1">
              <span className="text-text-muted text-xs uppercase tracking-wide font-mono">{label}</span>
              <div className="flex items-center gap-2 py-2">
                <Toggle checked={logging[field] as boolean} onChange={v => updLogging(field, v)} />
                <span className="text-text-muted text-xs font-mono">{(logging[field] as boolean) ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          ))}

          <Input
            label="Audit Retention"
            type="number"
            value={logging.auditRetention}
            onChange={e => updLogging('auditRetention', e.target.value)}
            unit="days"
          />
          <Input
            label="Allowed IPs"
            value={logging.allowedIPs}
            onChange={e => updLogging('allowedIPs', e.target.value)}
            placeholder="192.168.1.0/24"
            disabled={!logging.ipWhitelist}
          />
        </div>
      </Card>
    </div>
  )
}



