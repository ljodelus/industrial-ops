'use client'

// Client component — requires Redux hooks (useAppSelector, useAppDispatch),
// date input handlers, pill toggles, scroll interactions, and toast dispatch

import { useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectCraneUtilization,
  selectCUPeriodFrom,
  selectCUPeriodTo,
  selectCULineFilter,
  selectHighlightedCrane,
  setPeriodFrom,
  setPeriodTo,
  setLineFilter,
  highlightCrane,
} from '@/store/slices/craneUtilizationSlice'
import { selectUserRole } from '@/store/slices/authSlice'
import { Button, StatCard, Card } from '@/components/ui'
import {
  CraneUtilizationRow,
  ActivityBreakdownChart,
  LoadDistributionChart,
  CraneComparisonTable,
  MovementHeatmap,
} from '@/components/modules/reports'
import { FileDown, FileText, RefreshCw } from '@/lib/icons'
import { useRouter } from 'next/navigation'

type QuickPill = 'today' | '7d' | '30d' | 'month'
type LineFilter = 'all' | 'LINE-1' | 'LINE-2'

const PILL_BASE     = 'px-2.5 py-1 text-[10px] font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ACTIVE   = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_INACTIVE = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

function getQuickDates(pill: QuickPill): { from: string; to: string } {
  const to = new Date('2026-05-10')
  let from = new Date('2026-05-10')
  switch (pill) {
    case 'today':
      from = new Date('2026-05-10')
      break
    case '7d':
      from = new Date('2026-05-03')
      break
    case '30d':
      from = new Date('2026-04-10')
      break
    case 'month':
      from = new Date('2026-05-01')
      break
  }
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  }
}

function downloadCSV() {
  const rows = [
    ['METRIC', 'CRANE-1', 'CRANE-2', 'CRANE-3', 'CRANE-4', 'FLEET AVG'],
    ['Utilization',    '87.4%',   '79.1%',   '84.2%',   '68.9%',   '79.9%'  ],
    ['Active Time',    '59.4h',   '53.8h',   '57.3h',   '46.8h',   '54.3h'  ],
    ['Idle Time',       '5.6h',   '12.6h',    '8.4h',   '11.4h',    '9.5h'  ],
    ['Fault Time',      '3.0h',    '1.6h',    '2.4h',    '9.7h',    '4.2h'  ],
    ['Total Movements', '842',     '654',      '731',     '620',     '711.8' ],
    ['Total Distance', '48.2 km', '38.5 km', '52.1 km', '45.5 km', '46.1 km'],
    ['Avg Load',       '435 kg',  '398 kg',  '421 kg',  '384 kg',  '409 kg' ],
    ['Max Load',       '820 kg',  '760 kg',  '810 kg',  '740 kg',  '782 kg' ],
    ['Faults',          '6',       '2',        '3',       '8',       '4.75'  ],
    ['MTBF',           '26h 30m', '36h 00m', '32h 00m', '10h 30m', '26h 15m'],
  ]
  const csv  = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'crane-utilization.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function CraneUtilizationClient() {
  const dispatch         = useAppDispatch()
  const router           = useRouter()
  const role             = useAppSelector(selectUserRole)
  const cranes           = useAppSelector(selectCraneUtilization)
  const periodFrom       = useAppSelector(selectCUPeriodFrom)
  const periodTo         = useAppSelector(selectCUPeriodTo)
  const lineFilter       = useAppSelector(selectCULineFilter)
  const highlightedCrane = useAppSelector(selectHighlightedCrane)

  const sectionBRef = useRef<HTMLDivElement>(null)
  const sectionERef = useRef<HTMLDivElement>(null)

  // Role guard — operator redirected by the page
  if (role === 'operator') {
    router.replace('/overview')
    return null
  }

  const filteredCranes = lineFilter === 'all'
    ? cranes
    : cranes.filter(c => c.line === lineFilter)

  function handleCraneRowClick(craneId: string) {
    dispatch(highlightCrane(craneId))
    // Scroll to Section E comparison column header
    sectionERef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => dispatch(highlightCrane(null)), 2000)
  }

  function handleQuickPill(pill: QuickPill) {
    const { from, to } = getQuickDates(pill)
    dispatch(setPeriodFrom(from))
    dispatch(setPeriodTo(to))
  }

  function handleExportPDF() {
    alert('PDF export simulated — feature available in production build.')
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-scada-bg min-h-screen">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left — title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest value-display">
            Crane Utilization
          </h1>
          <p className="text-text-muted text-xs font-mono">
            Crane activity, load, and efficiency analysis
          </p>
        </div>

        {/* Center — period selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-[10px] font-mono">FROM</span>
            <input
              type="date"
              value={periodFrom}
              onChange={e => dispatch(setPeriodFrom(e.target.value))}
              className="bg-scada-surface border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada"
            />
            <span className="text-text-muted text-[10px] font-mono">TO</span>
            <input
              type="date"
              value={periodTo}
              onChange={e => dispatch(setPeriodTo(e.target.value))}
              className="bg-scada-surface border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada"
            />
          </div>
          <div className="flex gap-1">
            {([
              { pill: 'today' as QuickPill, label: 'Today'      },
              { pill: '7d'    as QuickPill, label: 'Last 7d'    },
              { pill: '30d'   as QuickPill, label: 'Last 30d'   },
              { pill: 'month' as QuickPill, label: 'This Month' },
            ]).map(({ pill, label }) => (
              <button
                key={pill}
                onClick={() => handleQuickPill(pill)}
                className={`${PILL_BASE} ${PILL_INACTIVE}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<FileDown size={14} />} onClick={downloadCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<FileText size={14} />} onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Section A — KPI Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="FLEET UTILIZATION"
          value="83.4%"
          subtitle="avg across all cranes"
          accent="ok"
          trend="up"
        />
        <StatCard
          title="TOTAL MOVEMENTS"
          value="2,847"
          subtitle="transfers completed"
          accent="primary"
          trend="up"
        />
        <StatCard
          title="TOTAL DISTANCE"
          value="184.3 km"
          subtitle="combined rail travel"
          accent="gold"
          trend="stable"
        />
        <StatCard
          title="AVG LOAD"
          value="412 kg"
          subtitle="per transfer cycle"
          accent="primary"
          trend="stable"
        />
      </div>

      {/* ── Section B — Crane Utilization Overview ─────────────────────────── */}
      <div ref={sectionBRef}>
        <Card
          title="UTILIZATION BY CRANE"
          accent="primary"
          noPadding
          action={
            <div className="flex gap-1">
              {(['all', 'LINE-1', 'LINE-2'] as LineFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => dispatch(setLineFilter(f))}
                  className={`${PILL_BASE} ${lineFilter === f ? PILL_ACTIVE : PILL_INACTIVE}`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          }
        >
          {filteredCranes.map(crane => (
            <div key={crane.id} id={`crane-row-${crane.id}`}>
              <CraneUtilizationRow
                crane={crane}
                isHighlighted={highlightedCrane === crane.id}
                onClick={handleCraneRowClick}
              />
            </div>
          ))}
          {filteredCranes.length === 0 && (
            <div className="px-4 py-6 text-text-muted text-xs font-mono text-center">
              No cranes for selected line.
            </div>
          )}
        </Card>
      </div>

      {/* ── Sections C + D — Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ActivityBreakdownChart />
        </div>
        <div className="lg:col-span-2">
          <LoadDistributionChart />
        </div>
      </div>

      {/* ── Section E — Crane Comparison Table ────────────────────────────── */}
      <div ref={sectionERef}>
        <CraneComparisonTable />
      </div>

      {/* ── Section F — Movement Heatmap ──────────────────────────────────── */}
      <MovementHeatmap />
    </div>
  )
}

