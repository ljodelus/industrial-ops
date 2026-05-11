'use client'

// Client component: uses onClick handler to navigate to /production/cranes

import type { Crane } from '@/types'
import { Card }         from '@/components/ui/Card'
import { Button }       from '@/components/ui/Button'
import { StatusDot }    from '@/components/ui/StatusDot'
import { ValueDisplay } from '@/components/ui/ValueDisplay'

// ─── Maps ─────────────────────────────────────────────────────────────────────

type CardAccent   = 'ok' | 'warning' | 'alarm' | 'offline' | 'primary' | 'gold'
type DotStatus    = 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'

const STATUS_ACCENT: Record<string, CardAccent> = {
  moving:  'gold',
  loading: 'primary',
  idle:    'offline',
  error:   'alarm',
  offline: 'offline',
}

const STATUS_DOT: Record<string, DotStatus> = {
  moving:  'warning',
  loading: 'ok',
  idle:    'idle',
  error:   'alarm',
  offline: 'offline',
}

const STATUS_SPEED: Record<string, string> = {
  moving:  '12 m/min',
  loading: '3 m/min',
  idle:    '0 m/min',
  error:   '0 m/min',
  offline: '—',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CraneDetailCardProps {
  crane:     Crane
  onDetails: () => void
}

export function CraneDetailCard({ crane, onDetails }: CraneDetailCardProps) {
  const accent    = STATUS_ACCENT[crane.status] ?? 'offline'
  const dotStatus = STATUS_DOT[crane.status]    ?? 'offline'
  const isError   = crane.status === 'error'
  const isAnimated = crane.status === 'moving' || crane.status === 'loading'

  return (
    <Card
      accent={accent}
      className={isError ? 'alarm-blink border-status-alarm/60' : ''}
    >
      <div className="space-y-3">

        {/* Header — name + status */}
        <div className="flex items-center justify-between">
          <span className="text-text-value font-mono font-bold text-sm uppercase tracking-wider">
            {crane.name}
          </span>
          <div className="flex items-center gap-1.5">
            <StatusDot status={dotStatus} animated={isAnimated} size="sm" />
            <span className="text-text-muted text-xs font-mono uppercase">
              {crane.status}
            </span>
          </div>
        </div>

        {/* Live values */}
        <div className="space-y-1.5">
          <ValueDisplay
            label="POSITION"
            value={crane.position.toLocaleString()}
            unit="mm"
            layout="horizontal"
          />
          <ValueDisplay
            label="LOAD"
            value={crane.load}
            unit="kg"
            layout="horizontal"
          />
          <ValueDisplay
            label="SPEED"
            value={STATUS_SPEED[crane.status] ?? '—'}
            layout="horizontal"
          />
        </div>

        {/* Current job */}
        {crane.currentJob && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
              JOB
            </span>
            <span className="text-accent-primary font-mono text-xs">
              {crane.currentJob.toUpperCase()}
            </span>
          </div>
        )}

        {/* Error message */}
        {isError && (
          <div className="text-status-alarm text-xs font-mono">
            ERR: Motion timeout at {crane.position.toLocaleString()}mm
          </div>
        )}

        {/* Navigate button */}
        <div className="pt-1 border-t border-scada-border">
          <Button variant="ghost" size="sm" onClick={onDetails}>
            Details
          </Button>
        </div>
      </div>
    </Card>
  )
}

