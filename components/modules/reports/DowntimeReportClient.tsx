'use client'

// Client component — requires 'use client' for: useAppSelector/useAppDispatch,
// useEffect (operator redirect), onClick handlers, useRouter

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import {
  selectDowntimeEquipmentStats,
  selectDowntimePeriodFrom,
  selectDowntimePeriodTo,
  selectSelectedEquipment,
  setDowntimePeriodFrom,
  setDowntimePeriodTo,
  selectEquipment,
  clearDowntimeFilters,
} from '@/store/slices/downtimeReportSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { StatCard, Button } from '@/components/ui'
import { FileDown, FileText, RefreshCw } from '@/lib/icons'
import { mockDowntimeEvents } from '@/lib/mock/reports'
import type { DowntimeEvent } from '@/types'
import { DowntimeTimelineChart } from './DowntimeTimelineChart'
import { DowntimeCategoryChart } from './DowntimeCategoryChart'
import { EquipmentDowntimeCard } from './EquipmentDowntimeCard'
import { DowntimeEventsTable }   from './DowntimeEventsTable'

// ─── Quick period pills ────────────────────────────────────────────────────────

type QuickPill = 'today' | '7d' | '30d' | 'month'

function getQuickRange(pill: QuickPill): { from: string; to: string } {
  const to   = new Date('2026-05-10')
  const from = new Date('2026-05-10')
  if      (pill === 'today') { /* same day */ }
  else if (pill === '7d')    { from.setDate(from.getDate() - 6) }
  else if (pill === '30d')   { from.setDate(from.getDate() - 29) }
  else                       { from.setDate(1) }
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  }
}

function detectActivePill(from: string, to: string): QuickPill | null {
  if (from === getQuickRange('today').from && to === getQuickRange('today').to) return 'today'
  if (from === getQuickRange('7d').from    && to === getQuickRange('7d').to)    return '7d'
  if (from === getQuickRange('30d').from   && to === getQuickRange('30d').to)   return '30d'
  if (from === getQuickRange('month').from && to === getQuickRange('month').to) return 'month'
  return null
}

const PILL_BASE     = 'px-3 py-1 text-xs font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ACTIVE   = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_INACTIVE = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

// ─── Component ────────────────────────────────────────────────────────────────

export function DowntimeReportClient() {
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const role     = useAppSelector(selectUserRole)
  const from     = useAppSelector(selectDowntimePeriodFrom)
  const to       = useAppSelector(selectDowntimePeriodTo)
  const equipStats       = useAppSelector(selectDowntimeEquipmentStats)
  const selectedEquipId  = useAppSelector(selectSelectedEquipment)

  // Redirect operator to /overview
  useEffect(() => {
    if (role === 'operator') router.push('/overview')
  }, [role, router])

  if (!role || role === 'operator') return null

  const activePill = detectActivePill(from, to)

  const handleQuickPill = (pill: QuickPill) => {
    const range = getQuickRange(pill)
    dispatch(setDowntimePeriodFrom(range.from))
    dispatch(setDowntimePeriodTo(range.to))
    dispatch(clearDowntimeFilters())
  }

  const handleEquipmentCardClick = (id: string) => {
    dispatch(selectEquipment(id))
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    const headers = ['ID','DATE','START','END','DURATION','EQUIPMENT','CATEGORY','CAUSE','IMPACT','RESOLVED BY','ALARM REF']
    const rows    = [headers.join(',')]
    mockDowntimeEvents.forEach((e: DowntimeEvent) => {
      rows.push([
        e.id, e.date, e.startTime, e.endTime, e.duration,
        e.equipment, e.category, `"${e.cause}"`, e.impactedBatches,
        e.resolvedBy, e.alarmRef,
      ].join(','))
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `downtime_report_${from}_to_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
    dispatch(pushNotification({ id: Date.now().toString(), type: 'success', message: 'Downtime report exported as CSV' }))
  }

  // ── Export PDF (simulated) ─────────────────────────────────────────────────

  const handleExportPDF = () => {
    const content = `Downtime Report — ${from} to ${to}\nGenerated: ${new Date().toISOString()}\nTotal events: 23 | Total downtime: 272 min | Availability: 97.3%`
    const blob    = new Blob([content], { type: 'application/pdf' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = `downtime_report_${from}_to_${to}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    dispatch(pushNotification({ id: Date.now().toString(), type: 'success', message: 'Downtime report exported as PDF' }))
  }

  return (
    <div className="flex flex-col gap-4 p-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left — Title */}
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest value-display">
            DOWNTIME REPORT
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Equipment availability and fault analysis
          </p>
        </div>

        {/* Center — Period selector */}
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2">
            <label className="text-text-muted text-[10px] font-mono uppercase">FROM</label>
            <input
              type="date"
              value={from}
              onChange={e => dispatch(setDowntimePeriodFrom(e.target.value))}
              className="bg-scada-bg border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
            />
            <label className="text-text-muted text-[10px] font-mono uppercase">TO</label>
            <input
              type="date"
              value={to}
              onChange={e => dispatch(setDowntimePeriodTo(e.target.value))}
              className="bg-scada-bg border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada outline-none focus:border-accent-primary"
            />
          </div>
          <div className="flex gap-1">
            {([
              { key: 'today', label: 'Today'      },
              { key: '7d',    label: 'Last 7d'    },
              { key: '30d',   label: 'Last 30d'   },
              { key: 'month', label: 'This Month' },
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

        {/* Right — Export + Refresh */}
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

      {/* ── Section A — KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          title="TOTAL DOWNTIME"
          value="4h 32m"
          subtitle="across all equipment"
          accent="alarm"
          trend="down"
        />
        <StatCard
          title="AVAILABILITY"
          value="97.3%"
          subtitle="uptime this period"
          accent="ok"
          trend="up"
        />
        <StatCard
          title="MTBF"
          value="18h 24m"
          subtitle="mean time between failures"
          accent="gold"
          trend="up"
        />
        <StatCard
          title="MTTR"
          value="5m 42s"
          subtitle="mean time to restore"
          accent="primary"
          trend="down"
        />
      </div>

      {/* ── Section B + C — Timeline + Category charts ───────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <DowntimeTimelineChart />
        </div>
        <div className="col-span-2">
          <DowntimeCategoryChart />
        </div>
      </div>

      {/* ── Section D — Equipment Breakdown ─────────────────────────────────── */}
      <div className="bg-scada-surface border border-scada-border border-t-2 border-t-accent-primary rounded-scada">
        <div className="flex items-center justify-between border-b border-scada-border px-4 py-3">
          <span className="text-text-primary text-sm font-medium uppercase tracking-wide">
            EQUIPMENT BREAKDOWN
          </span>
          {selectedEquipId !== 'all' && (
            <button
              className="text-text-muted text-xs font-mono hover:text-text-primary transition-colors"
              onClick={() => dispatch(selectEquipment(selectedEquipId))}
            >
              ✕ Clear selection
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {equipStats.map(equip => (
              <EquipmentDowntimeCard
                key={equip.id}
                equipment={equip}
                isSelected={selectedEquipId === equip.id}
                onClick={handleEquipmentCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Section E — Events Table ─────────────────────────────────────────── */}
      <DowntimeEventsTable />

    </div>
  )
}

