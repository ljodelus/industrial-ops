// Pure display component — receives pre-computed stats as props
import { StatCard } from '@/components/ui/StatCard'
import type { AlarmHistoryEntry } from '@/types'

interface AlarmSummaryCardsProps {
  entries: AlarmHistoryEntry[]
}

function formatAvgResolution(entries: AlarmHistoryEntry[]): string {
  const acked = entries.filter(e => e.acknowledged && e.duration)
  if (acked.length === 0) return '—'

  const totalSec = acked.reduce((acc, e) => {
    const parts = e.duration.split(':').map(Number)
    return acc + (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0)
  }, 0)

  const avg = Math.round(totalSec / acked.length)
  const m   = Math.floor(avg / 60)
  const s   = avg % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

function topSource(entries: AlarmHistoryEntry[]): { name: string; count: number } {
  if (entries.length === 0) return { name: '—', count: 0 }
  const counts: Record<string, number> = {}
  entries.forEach(e => { counts[e.source] = (counts[e.source] ?? 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return { name: top?.[0] ?? '—', count: top?.[1] ?? 0 }
}

export function AlarmSummaryCards({ entries }: AlarmSummaryCardsProps) {
  const total         = entries.length
  const criticalHigh  = entries.filter(e => e.severity === 'critical' || e.severity === 'high').length
  const avgResolution = formatAvgResolution(entries)
  const topSrc        = topSource(entries)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4">
      <StatCard
        title="Total Alarms"
        value={total}
        subtitle="in selected period"
        accent="primary"
        trend="stable"
      />
      <StatCard
        title="Critical &amp; High"
        value={criticalHigh}
        subtitle="requires attention"
        accent="alarm"
        trend="down"
      />
      <StatCard
        title="Avg Resolution"
        value={avgResolution}
        subtitle="time to acknowledge"
        accent="gold"
        trend="up"
      />
      <StatCard
        title="Top Source"
        value={topSrc.name}
        subtitle={`${topSrc.count} alarm${topSrc.count !== 1 ? 's' : ''} this period`}
        accent="primary"
        trend="stable"
      />
    </div>
  )
}

