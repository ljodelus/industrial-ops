'use client'

// Client component: uses useRouter for row-click navigation + renders a custom table
// to support per-row flashing state (row-level bg not possible through shared Table component)

import { useRouter } from 'next/navigation'
import type { ETARow } from '@/lib/hooks/useMonitorSimulation'
import { Card }  from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'ok' | 'warning' | 'alarm' | 'offline' | 'idle' | 'info' | 'gold'

const STATUS_BADGE: Record<string, BadgeVariant> = {
  'IN PROGRESS':  'info',
  'PENDING':      'idle',
  'TRANSFERRING': 'gold',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ETATableProps {
  rows:          ETARow[]
  formatSeconds: (s: number) => string
}

export function ETATable({ rows, formatSeconds }: ETATableProps) {
  const router = useRouter()

  const handleRowClick = (_row: ETARow) => {
    // Navigate to jobs page; a real app would pass a filter query param
    router.push('/production/jobs')
  }

  return (
    <Card title="ESTIMATED TRANSFER TIMES" accent="primary" noPadding>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-scada-panel border-b border-scada-border">
              {['JOB', 'RECIPE', 'CURRENT TANK', 'NEXT TANK', 'DWELL TIME', 'ETA TRANSFER', 'CRANE', 'STATUS'].map(
                header => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-text-muted text-xs uppercase tracking-wider font-mono whitespace-nowrap"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row)}
                className={`border-l-2 border-transparent hover:border-accent-primary cursor-pointer transition-colors group
                  ${row.flashing
                    ? 'bg-accent-primary/10'
                    : i % 2 === 0
                    ? 'bg-scada-bg hover:bg-scada-panel'
                    : 'bg-scada-surface hover:bg-scada-panel'
                  }`}
              >
                {/* JOB */}
                <td className="px-4 py-3">
                  <span className="text-accent-gold font-mono text-xs">{row.job}</span>
                </td>
                {/* RECIPE */}
                <td className="px-4 py-3">
                  <span className="text-text-primary text-xs whitespace-nowrap">{row.recipe}</span>
                </td>
                {/* CURRENT TANK */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-text-primary whitespace-nowrap">{row.currentTank}</span>
                </td>
                {/* NEXT TANK */}
                <td className="px-4 py-3">
                  <span className="text-text-muted text-xs whitespace-nowrap">{row.nextTank}</span>
                </td>
                {/* DWELL TIME */}
                <td className="px-4 py-3">
                  <span className="value-display text-accent-primary text-xs">
                    {row.dwellSeconds < 0 ? '—' : formatSeconds(row.dwellSeconds)}
                  </span>
                </td>
                {/* ETA TRANSFER */}
                <td className="px-4 py-3">
                  <span className="value-display text-text-value text-xs">{row.etaTransfer}</span>
                </td>
                {/* CRANE */}
                <td className="px-4 py-3">
                  <span className="text-accent-primary font-mono text-xs">{row.crane}</span>
                </td>
                {/* STATUS */}
                <td className="px-4 py-3">
                  <Badge
                    variant={STATUS_BADGE[row.status] ?? 'idle'}
                    label={row.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}


