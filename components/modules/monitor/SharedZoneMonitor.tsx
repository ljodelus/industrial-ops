'use client'

// Client component: receives live zone data and renders status + distances

import type { ZoneStatus } from '@/lib/hooks/useMonitorSimulation'
import { Card }  from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

// ─── Utilities ────────────────────────────────────────────────────────────────

type ZoneBadgeVariant = 'ok' | 'warning' | 'alarm'

function getZoneBadge(distance: number): { variant: ZoneBadgeVariant; label: string } {
  if (distance < 500)  return { variant: 'alarm',   label: 'RISK'    }
  if (distance < 1000) return { variant: 'warning',  label: 'CAUTION' }
  return                      { variant: 'ok',       label: 'CLEAR'   }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SharedZoneMonitorProps {
  zones: ZoneStatus[]
}

export function SharedZoneMonitor({ zones }: SharedZoneMonitorProps) {
  return (
    <Card title="SHARED ZONES" accent="gold">
      <div className="space-y-0 divide-y divide-scada-border">
        {zones.map(zone => {
          const badge = getZoneBadge(zone.distance)

          return (
            <div
              key={zone.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              {/* Zone identity */}
              <div className="flex flex-col min-w-0">
                <span className="text-text-primary font-mono text-xs font-medium">
                  {zone.name}
                </span>
                <span className="text-text-muted text-xs">{zone.cranePair}</span>
              </div>

              {/* Status + distance */}
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={badge.variant} label={badge.label} />
                <span className="value-display text-xs text-text-muted tabular-nums">
                  {zone.distance.toLocaleString()}mm
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

