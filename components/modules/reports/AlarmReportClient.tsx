'use client'

// Client component — requires Redux hooks (useAppSelector, useAppDispatch),
// useRouter for operator redirect, date inputs, and pill toggle interactions

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectAlarmReportKpis,
  selectAlarmReportPeriodFrom,
  selectAlarmReportPeriodTo,
  setPeriodFrom,
  setPeriodTo,
} from '@/store/slices/alarmReportSlice'
import { selectUserRole } from '@/store/slices/authSlice'
import { Button, StatCard } from '@/components/ui'
import {
  AlarmFrequencyChart,
  ResponseTimeChart,
  AlarmSourceRanking,
  AlarmHeatmap,
  RecurringAlarmsTable,
} from '@/components/modules/reports'
import { FileDown, FileText, RefreshCw } from '@/lib/icons'
import { useRouter } from 'next/navigation'

// ─── Types & constants ────────────────────────────────────────────────────────

type QuickPill = 'today' | '7d' | '30d' | 'month'

const PILL       = 'px-2.5 py-1 text-[10px] font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_OFF   = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

function getQuickDates(pill: QuickPill): { from: string; to: string } {
  switch (pill) {
    case 'today': return { from: '2026-05-10', to: '2026-05-10' }
    case '7d':    return { from: '2026-05-03', to: '2026-05-09' }
    case '30d':   return { from: '2026-04-10', to: '2026-05-09' }
    case 'month': return { from: '2026-05-01', to: '2026-05-09' }
  }
}

function downloadCSV() {
  const rows: string[][] = [
    ['SECTION', 'FIELD', 'VALUE'],
    ['KPIs', 'Total Alarms',     '48'    ],
    ['KPIs', 'Avg Response',     '4m 32s'],
    ['KPIs', 'Nuisance Alarms',  '7'     ],
    ['KPIs', 'Critical Rate',    '16.7%' ],
    ['KPIs', 'Unresolved',       '2'     ],
    [],
    ['Daily Frequency', 'Date',     'Critical', 'High', 'Medium', 'Low', 'Total'],
    ['Daily Frequency', 'May 03',   '1', '1', '1', '1', '4'],
    ['Daily Frequency', 'May 04',   '2', '2', '2', '1', '7'],
    ['Daily Frequency', 'May 05',   '1', '0', '1', '1', '3'],
    ['Daily Frequency', 'May 06',   '2', '1', '4', '2', '9'],
    ['Daily Frequency', 'May 07',   '1', '1', '2', '1', '5'],
    ['Daily Frequency', 'May 08',   '1', '1', '3', '1', '6'],
    ['Daily Frequency', 'May 09',   '0', '2', '4', '2', '8'],
  ]
  const csv  = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'alarm-report.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AlarmReportClient() {
  const dispatch    = useAppDispatch()
  const router      = useRouter()
  const role        = useAppSelector(selectUserRole)
  const kpis        = useAppSelector(selectAlarmReportKpis)
  const periodFrom  = useAppSelector(selectAlarmReportPeriodFrom)
  const periodTo    = useAppSelector(selectAlarmReportPeriodTo)

  // Role guard — operator directed to /alarms
  if (role === 'operator') {
    router.replace('/alarms')
    return null
  }

  function handleQuickPill(pill: QuickPill) {
    const { from, to } = getQuickDates(pill)
    dispatch(setPeriodFrom(from))
    dispatch(setPeriodTo(to))
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-scada-bg min-h-screen">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">

        {/* Left — title + subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest value-display">
            Alarm Report
          </h1>
          <p className="text-text-muted text-xs font-mono">
            Alarm frequency, patterns, and response analysis
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
                className={`${PILL} ${PILL_OFF}`}
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
          <Button
            variant="secondary" size="sm" icon={<FileText size={14} />}
            onClick={() => alert('PDF export simulated — feature available in production build.')}
          >
            Export PDF
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Section A — KPI Summary Row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="TOTAL ALARMS"
          value={kpis.totalAlarms}
          subtitle="triggered this period"
          accent="primary"
          trend="down"
        />
        <StatCard
          title="AVG RESPONSE"
          value={kpis.avgResponseTime}
          subtitle="time to acknowledge"
          accent="gold"
          trend="down"
        />
        <StatCard
          title="NUISANCE ALARMS"
          value={kpis.nuisanceAlarms}
          subtitle="> 5 triggers same cause"
          accent="warning"
          trend="up"
        />
        <StatCard
          title="CRITICAL RATE"
          value={kpis.criticalRate}
          subtitle="of all alarms"
          accent="alarm"
          trend="stable"
        />
        <StatCard
          title="UNRESOLVED"
          value={kpis.unresolved}
          subtitle="still unacknowledged"
          accent={kpis.unresolved > 0 ? 'alarm' : 'ok'}
          trend="down"
        />
      </div>

      {/* ── Sections B + C — Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
        <div className="lg:col-span-6">
          <AlarmFrequencyChart />
        </div>
        <div className="lg:col-span-5">
          <ResponseTimeChart />
        </div>
      </div>

      {/* ── Section D — Top Alarm Sources ────────────────────────────────── */}
      <AlarmSourceRanking />

      {/* ── Section E — Alarm Frequency Heatmap ──────────────────────────── */}
      <AlarmHeatmap />

      {/* ── Section F — Recurring Alarms Table ───────────────────────────── */}
      <RecurringAlarmsTable />

    </div>
  )
}

