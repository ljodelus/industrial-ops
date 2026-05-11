'use client'

// Client component — useState/useEffect for duration timer; useAppSelector/useAppDispatch for actions
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { acknowledge } from '@/store/slices/alarmsSlice'
import { selectCurrentUser, selectUserRole } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'
import type { Alarm } from '@/types'
import { Card }   from '@/components/ui/Card'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Clock, Trash2 } from '@/lib/icons'

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info' | 'gold'

const SEVERITY_VARIANT: Record<string, BadgeVariant> = {
  critical: 'alarm',
  high:     'alarm',
  medium:   'warning',
  low:      'gold',
  info:     'info',
}

const SEVERITY_ACCENT: Record<string, 'alarm' | 'warning' | 'primary' | 'gold' | 'ok' | 'offline'> = {
  critical: 'alarm',
  high:     'alarm',
  medium:   'warning',
  low:      'gold',
  info:     'primary',
}

const RECOMMENDED_ACTIONS: Record<string, string> = {
  Motion:        'Check crane drive VFD. Inspect rail section for obstruction. Verify encoder feedback.',
  Communication: 'Check PLC network cable and IP configuration. Verify switch port status. Test ping to PLC.',
  Process:       'Check tank level and temperature sensor reading. Verify chemical concentrations.',
  Sensor:        'Check sensor wiring and connections. Verify calibration data. Replace sensor if faulty.',
  Recipe:        'Verify recipe step times vs. actual dwell. Check tank availability and part positioning.',
  Collision:     'Check zone configuration and crane speed limits. Review inter-crane spacing rules.',
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

interface InfoRowProps { label: string; children: React.ReactNode }
function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4 py-1.5 border-b border-scada-border last:border-0">
      <span className="text-text-muted text-xs uppercase font-mono tracking-wide w-32 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-text-primary text-sm flex-1">{children}</span>
    </div>
  )
}

interface AlarmDetailPanelProps {
  alarm:         Alarm
  onClose?:      () => void
  onAlarmDelete: (id: string) => void
}

export function AlarmDetailPanel({ alarm, onAlarmDelete }: AlarmDetailPanelProps) {
  const dispatch  = useAppDispatch()
  const router    = useRouter()
  const user      = useAppSelector(selectCurrentUser)
  const role      = useAppSelector(selectUserRole)

  const canDelete = role === 'engineer' || role === 'admin'

  // Duration counter — seconds since triggeredAt (initialized in effect to avoid impure render)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const triggered = new Date(alarm.triggeredAt).getTime()
    setDuration(Math.floor((Date.now() - triggered) / 1000))
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - triggered) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [alarm.triggeredAt])

  const handleAcknowledge = () => {
    dispatch(acknowledge({ id: alarm.id, acknowledgedBy: user?.name ?? 'Unknown' }))
  }

  const handleDelete = () => {
    onAlarmDelete(alarm.id)
  }

  const recommendedAction =
    RECOMMENDED_ACTIONS[alarm.category] ??
    'Review alarm details and consult the operator manual for guidance.'

  return (
    <Card
      title="Alarm Detail"
      accent={SEVERITY_ACCENT[alarm.severity] ?? 'primary'}
      noPadding
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Badge variant={SEVERITY_VARIANT[alarm.severity]} label={alarm.severity} />
          <div className="flex-1 min-w-0">
            <p className="text-text-value text-base font-medium leading-snug">
              {alarm.message}
            </p>
            <p className="text-text-muted text-xs font-mono mt-0.5">{alarm.id}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="border border-scada-border rounded-scada px-3 py-1">
          <InfoRow label="Source">
            <span className="text-accent-primary font-mono">{alarm.source}</span>
          </InfoRow>
          <InfoRow label="Category">{alarm.category}</InfoRow>
          <InfoRow label="Triggered at">
            <span className="font-mono text-xs">{formatDateTime(alarm.triggeredAt)}</span>
          </InfoRow>
          <InfoRow label="Duration">
            <span className="value-display text-accent-primary font-mono text-sm">
              {formatDuration(duration)}
            </span>
          </InfoRow>
          <InfoRow label="Status">
            {alarm.acknowledged
              ? <span className="text-status-ok">Acknowledged</span>
              : <span className="text-status-alarm">Unacknowledged</span>
            }
          </InfoRow>
          {alarm.acknowledged && alarm.acknowledgedBy && (
            <>
              <InfoRow label="Acked by">
                <span className="font-mono">{alarm.acknowledgedBy}</span>
              </InfoRow>
              {alarm.acknowledgedAt && (
                <InfoRow label="Acked at">
                  <span className="font-mono text-xs">{formatDateTime(alarm.acknowledgedAt)}</span>
                </InfoRow>
              )}
            </>
          )}
        </div>

        {/* Recommended action */}
        <div>
          <p className="text-text-muted text-[10px] uppercase font-mono tracking-wide mb-1">
            Recommended Action
          </p>
          <div className="border-t border-scada-border pt-2">
            <p className="text-text-muted text-xs leading-relaxed">{recommendedAction}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCircle size={14} />}
            disabled={alarm.acknowledged}
            onClick={handleAcknowledge}
          >
            Acknowledge
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Clock size={14} />}
            onClick={() => router.push('/alarms/history')}
          >
            View in History
          </Button>
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}



