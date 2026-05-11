'use client'

// Client component — requires 'use client' for: useAppSelector/useAppDispatch, useEffect (operator redirect),
// onClick handlers, and composition of client-only chart components

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import {
  selectPeriodFrom,
  selectPeriodTo,
  setPeriodFrom,
  setPeriodTo,
  clearTableFilters,
} from '@/store/slices/productionReportSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { StatCard, Button } from '@/components/ui'
import { FileDown, FileText, RefreshCw } from '@/lib/icons'
import { mockProductionBatches } from '@/lib/mock/reports'
import type { ProductionBatch } from '@/types'
import { ProductionVolumeChart } from './ProductionVolumeChart'
import { RecipeMixChart }        from './RecipeMixChart'
import { LineEfficiencyChart }   from './LineEfficiencyChart'
import { BatchDetailTable }      from './BatchDetailTable'

// ─── Quick period pills ────────────────────────────────────────────────────────

type QuickPill = 'today' | '7d' | '30d' | 'month'

function getQuickRange(pill: QuickPill): { from: string; to: string } {
  const to    = new Date('2026-05-10')
  const from  = new Date('2026-05-10')
  if (pill === 'today') {
    // same day
  } else if (pill === '7d') {
    from.setDate(from.getDate() - 6)
  } else if (pill === '30d') {
    from.setDate(from.getDate() - 29)
  } else {
    from.setDate(1) // first of month
  }
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  }
}

function detectActivePill(from: string, to: string): QuickPill | null {
  const r7d    = getQuickRange('7d')
  const r30d   = getQuickRange('30d')
  const rMonth = getQuickRange('month')
  const rToday = getQuickRange('today')
  if (from === rToday.from && to === rToday.to)   return 'today'
  if (from === r7d.from    && to === r7d.to)       return '7d'
  if (from === r30d.from   && to === r30d.to)      return '30d'
  if (from === rMonth.from && to === rMonth.to)    return 'month'
  return null
}

const PILL_BASE     = 'px-3 py-1 text-xs font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ACTIVE   = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_INACTIVE = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

// ─── Export helpers ────────────────────────────────────────────────────────────

function formatDateName(): string {
  return new Date('2026-05-10').toISOString().slice(0, 10)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductionReportClient() {
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const role     = useAppSelector(selectUserRole)
  const from     = useAppSelector(selectPeriodFrom)
  const to       = useAppSelector(selectPeriodTo)

  // Redirect operator to /overview
  useEffect(() => {
    if (role === 'operator') router.push('/overview')
  }, [role, router])

  if (!role || role === 'operator') return null

  const activePill = detectActivePill(from, to)

  const handleQuickPill = (pill: QuickPill) => {
    const range = getQuickRange(pill)
    dispatch(setPeriodFrom(range.from))
    dispatch(setPeriodTo(range.to))
    dispatch(clearTableFilters())
  }

  const handleExportCSV = () => {
    const filename = `production_report_${formatDateName()}.csv`
    const headers  = ['BATCH ID', 'RECIPE', 'LINE', 'CRANE', 'PARTS', 'STARTED', 'COMPLETED', 'CYCLE TIME', 'ON TIME', 'STATUS']
    const rows: string[] = [headers.join(',')]
    mockProductionBatches.forEach((b: ProductionBatch) => {
      rows.push([b.id, b.recipeName, b.line, b.crane, b.parts, b.startedAt, b.completedAt, b.cycleTime, b.onTime ? 'YES' : 'NO', b.status].join(','))
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const filename = `production_report_${formatDateName()}.pdf`
    const content  = `Production Report — ${from} to ${to}\nGenerated: ${new Date().toISOString()}\nTotal batches: 142 | Parts: 1,284 | On-time: 94.3%`
    const blob = new Blob([content], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    dispatch(pushNotification({ id: Date.now().toString(), type: 'success', message: 'Report exported successfully' }))
  }

  return (
    <div className="flex flex-col gap-4 p-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left — Title */}
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest value-display">
            PRODUCTION REPORT
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Output performance and batch analysis
          </p>
        </div>

        {/* Center — Period selector */}
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2">
            <label className="text-text-muted text-[10px] font-mono uppercase">FROM</label>
            <input
              type="date"
              value={from}
              onChange={e => dispatch(setPeriodFrom(e.target.value))}
              className="bg-scada-bg border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
            />
            <label className="text-text-muted text-[10px] font-mono uppercase">TO</label>
            <input
              type="date"
              value={to}
              onChange={e => dispatch(setPeriodTo(e.target.value))}
              className="bg-scada-bg border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
            />
          </div>
          <div className="flex gap-1">
            {([
              { key: 'today', label: 'Today'       },
              { key: '7d',    label: 'Last 7d'      },
              { key: '30d',   label: 'Last 30d'     },
              { key: 'month', label: 'This Month'   },
            ] as { key: QuickPill; label: string }[]).map(p => (
              <button
                key={p.key}
                onClick={() => handleQuickPill(p.key)}
                className={`${PILL_BASE} ${activePill === p.key ? PILL_ACTIVE : PILL_INACTIVE}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Export buttons */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<FileDown size={14} />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<FileText size={14} />} onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => {}}>
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Section A — KPI Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard
          title="TOTAL BATCHES"
          value="142"
          subtitle="completed this period"
          accent="primary"
          trend="up"
        />
        <StatCard
          title="PARTS PROCESSED"
          value="1,284"
          subtitle="across all lines"
          accent="primary"
          trend="up"
        />
        <StatCard
          title="AVG CYCLE TIME"
          value="52 min"
          subtitle="per batch"
          accent="gold"
          trend="stable"
        />
        <StatCard
          title="ON-TIME RATE"
          value="94.3%"
          subtitle="within max dwell time"
          accent="ok"
          trend="up"
        />
        <StatCard
          title="REJECTED"
          value="8"
          subtitle="timeout or fault"
          accent="alarm"
          trend="down"
        />
      </div>

      {/* ── Section B — Production Volume Chart ─────────────────────────── */}
      <ProductionVolumeChart />

      {/* ── Section C + D — Recipe Mix + Line Efficiency ────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <RecipeMixChart />
        <LineEfficiencyChart />
      </div>

      {/* ── Section E — Batch Detail Table ──────────────────────────────── */}
      <BatchDetailTable />
    </div>
  )
}



