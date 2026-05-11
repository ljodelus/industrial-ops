'use client'

// Client component — orchestrates the full Alarm History page:
// - Role guard: redirects operator to /alarms
// - Reads items + filters from Redux (alarmHistorySlice)
// - Filters data with useMemo
// - Renders Header, AlarmHistoryFilters, AlarmSummaryCards, AlarmHistoryTable, AlarmTrendChart

import { useEffect, useMemo } from 'react'
import { useRouter }          from 'next/navigation'
import { useAppSelector }     from '@/store/hooks'
import { selectAlarmHistoryItems, selectAlarmHistoryFilters } from '@/store/slices/alarmHistorySlice'
import { selectUserRole }  from '@/store/slices/authSlice'
import { mockAlarmTrendData } from '@/lib/mock/alarms'

import { AlarmHistoryFilters } from './AlarmHistoryFilters'
import { AlarmSummaryCards }   from './AlarmSummaryCards'
import { AlarmHistoryTable }   from './AlarmHistoryTable'
import { AlarmTrendChart }     from './AlarmTrendChart'

import { Button } from '@/components/ui/Button'
import { FileDown, FileText } from '@/lib/icons'
import type { AlarmHistoryEntry } from '@/types'

// ─── CSV Export ───────────────────────────────────────────────────────────────

function downloadCSV(entries: AlarmHistoryEntry[]) {
  const headers = [
    'ID', 'Severity', 'Message', 'Source', 'Category',
    'Triggered At', 'Duration', 'Acknowledged By', 'Acknowledged At', 'Status',
  ]
  const rows = entries.map(e => [
    e.id, e.severity, `"${e.message}"`, e.source, e.category,
    e.triggeredAt, e.duration, e.acknowledgedBy ?? '', e.acknowledgedAt ?? '',
    e.acknowledged ? 'ACKED' : 'UNACKED',
  ])
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `alarm-history-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPDF(entries: AlarmHistoryEntry[]) {
  // Simulated PDF export — downloads a text file with .pdf extension
  const lines = [
    'ALARM HISTORY REPORT',
    `Generated: ${new Date().toISOString()}`,
    `Total records: ${entries.length}`,
    '',
    ...entries.map(e =>
      `[${e.severity.toUpperCase()}] ${e.triggeredAt.slice(0, 10)} ${e.triggeredAt.slice(11, 19)} | ${e.source} | ${e.message} | ${e.acknowledged ? `ACKED by ${e.acknowledgedBy}` : 'UNACKED'}`
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `alarm-history-${new Date().toISOString().slice(0, 10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(
  items:   AlarmHistoryEntry[],
  filters: ReturnType<typeof selectAlarmHistoryFilters>,
): AlarmHistoryEntry[] {
  return items.filter(e => {
    // Date range
    if (filters.dateFrom) {
      const entryDate = e.triggeredAt.slice(0, 10)
      if (entryDate < filters.dateFrom) return false
    }
    if (filters.dateTo) {
      const entryDate = e.triggeredAt.slice(0, 10)
      if (entryDate > filters.dateTo) return false
    }
    // Search (message or source)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!e.message.toLowerCase().includes(q) && !e.source.toLowerCase().includes(q)) return false
    }
    // Severity
    if (filters.severity && e.severity !== filters.severity) return false
    // Category
    if (filters.category && e.category !== filters.category) return false
    // Source (partial match)
    if (filters.source && e.source !== filters.source) return false
    // Status
    if (filters.status === 'acknowledged'   && !e.acknowledged) return false
    if (filters.status === 'unacknowledged' &&  e.acknowledged) return false
    return true
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE_DEFAULT = 15

export function AlarmHistoryClient() {
  const router  = useRouter()
  const role    = useAppSelector(selectUserRole)
  const items   = useAppSelector(selectAlarmHistoryItems)
  const filters = useAppSelector(selectAlarmHistoryFilters)

  // ── Role guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (role === 'operator') router.replace('/alarms')
  }, [role, router])

  // ── Filtered entries ───────────────────────────────────────────────────────
  const filtered = useMemo(() => applyFilters(items, filters), [items, filters])

  // Rough pagination info for the filter bar counter (actual pagination in table)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE_DEFAULT))

  if (role === 'operator') return null   // prevent flash while redirecting

  return (
    <div className="flex flex-col gap-0 min-h-0">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-6 pt-4 pb-4 border-b border-scada-border">
        {/* Title */}
        <div className="flex-1">
          <h1 className="text-text-value text-xl font-mono font-semibold uppercase tracking-wide">
            Alarm History
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Historical alarm records and analysis
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileDown size={14} />}
            onClick={() => downloadCSV(filtered)}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<FileText size={14} />}
            onClick={() => downloadPDF(filtered)}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* ── Section A — Filter Bar ─────────────────────────────────────────── */}
      <AlarmHistoryFilters
        filteredCount={filtered.length}
        totalCount={items.length}
        currentPage={1}
        totalPages={totalPages}
      />

      {/* ── Section B — Summary Cards ─────────────────────────────────────── */}
      <AlarmSummaryCards entries={filtered} />

      {/* ── Section C — History Table ─────────────────────────────────────── */}
      <div className="px-6 pb-4">
        <div className="border border-scada-border rounded-scada overflow-hidden">
          <AlarmHistoryTable entries={filtered} />
        </div>
      </div>

      {/* ── Section D — Trend Chart ───────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <AlarmTrendChart data={mockAlarmTrendData} />
      </div>
    </div>
  )
}

