'use client'

// Client component — requires 'use client' for: useState (pagination, expanded row),
// useAppSelector/useAppDispatch, useRouter for alarm link navigation

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectDowntimeEvents,
  selectSelectedEquipment,
  selectDowntimeCategoryFilter,
  selectEquipment,
  setCategoryFilter,
  clearDowntimeFilters,
} from '@/store/slices/downtimeReportSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { Badge, Button, Card, Select } from '@/components/ui'
import type { DowntimeEvent, DowntimeCategory } from '@/types'
import { ChevronDown, ChevronRight } from '@/lib/icons'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE_OPTIONS = [
  { value: '10', label: '10 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
]

const EQUIPMENT_OPTIONS = [
  { value: 'all',       label: 'All Equipment' },
  { value: 'CRANE-1',   label: 'CRANE-1'        },
  { value: 'CRANE-2',   label: 'CRANE-2'        },
  { value: 'CRANE-3',   label: 'CRANE-3'        },
  { value: 'CRANE-4',   label: 'CRANE-4'        },
  { value: 'PLC-LINE1', label: 'PLC-LINE1'      },
  { value: 'PLC-LINE2', label: 'PLC-LINE2'      },
]

const CATEGORY_OPTIONS = [
  { value: 'all',            label: 'All Categories'    },
  { value: 'Motion',         label: 'Motion'            },
  { value: 'Communication',  label: 'Communication'     },
  { value: 'Planned',        label: 'Planned maint.'    },
  { value: 'Process',        label: 'Process'           },
  { value: 'Sensor',         label: 'Sensor'            },
]

// ─── Category badge variant ───────────────────────────────────────────────────

type BadgeVariant = 'alarm' | 'offline' | 'warning' | 'gold' | 'info'

function getCategoryBadgeVariant(category: DowntimeCategory): BadgeVariant {
  const map: Record<DowntimeCategory, BadgeVariant> = {
    Motion:        'alarm',
    Communication: 'alarm',
    Planned:       'offline',
    Process:       'warning',
    Sensor:        'gold',
  }
  return map[category]
}

// ─── Row background ───────────────────────────────────────────────────────────

function getRowBg(category: DowntimeCategory, isExpanded: boolean): string {
  const base = isExpanded ? 'bg-scada-panel' : ''
  if (category === 'Motion' || category === 'Communication') {
    return isExpanded ? 'bg-scada-panel' : 'bg-status-alarm/5 hover:bg-scada-panel'
  }
  if (category === 'Planned') {
    return isExpanded ? 'bg-scada-panel' : 'bg-status-idle/5 hover:bg-scada-panel'
  }
  return `${base} hover:bg-scada-panel`
}

// ─── Expanded row detail ──────────────────────────────────────────────────────

interface ExpandedDetailProps {
  event:   DowntimeEvent
  onAlarmClick: (alarmRef: string) => void
}

function ExpandedDetail({ event, onAlarmClick }: ExpandedDetailProps) {
  return (
    <tr>
      <td
        colSpan={9}
        className="bg-scada-panel border-b border-scada-border px-4 py-3"
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-mono">
          {/* Full description */}
          <div className="col-span-2">
            <span className="text-text-muted uppercase text-[10px]">FULL DESCRIPTION&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="text-text-primary">{event.fullDescription}</span>
          </div>
          {/* Fault code */}
          <div>
            <span className="text-text-muted uppercase text-[10px]">FAULT CODE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="text-text-primary">{event.faultCode}</span>
          </div>
          {/* Alarm linked */}
          <div>
            <span className="text-text-muted uppercase text-[10px]">ALARM LINKED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            {event.alarmRef !== '—' ? (
              <button
                className="text-accent-primary underline cursor-pointer"
                onClick={() => onAlarmClick(event.alarmRef)}
              >
                {event.alarmRef}
              </button>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </div>
          {/* Batches affected */}
          <div>
            <span className="text-text-muted uppercase text-[10px]">BATCHES AFFECTED&nbsp;&nbsp;</span>
            <span className="text-text-primary">
              {event.batchesAffected.length > 0 ? event.batchesAffected.join(', ') : '—'}
            </span>
          </div>
          {/* Resolution */}
          <div className="col-span-2">
            <span className="text-text-muted uppercase text-[10px]">RESOLUTION&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="text-text-primary">{event.resolution}</span>
          </div>
          {/* Preventive action */}
          <div className="col-span-2">
            <span className="text-text-muted uppercase text-[10px]">PREVENTIVE ACTION&nbsp;</span>
            <span className="text-text-primary">{event.preventiveAction}</span>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DowntimeEventsTable() {
  const router   = useRouter()
  const dispatch = useAppDispatch()

  const events           = useAppSelector(selectDowntimeEvents)
  const selectedEquip    = useAppSelector(selectSelectedEquipment)
  const categoryFilter   = useAppSelector(selectDowntimeCategoryFilter)

  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [currentPage,  setCurrentPage]  = useState(1)
  const [rowsPerPage,  setRowsPerPage]  = useState(10)

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = events.filter(evt => {
    const matchEquip = selectedEquip === 'all' || evt.equipment === selectedEquip
    const matchCat   = categoryFilter === 'all' || evt.category === categoryFilter
    return matchEquip && matchCat
  })

  // ── Pagination ─────────────────────────────────────────────────────────────

  const totalPages  = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const safePage    = Math.min(currentPage, totalPages)
  const start       = (safePage - 1) * rowsPerPage
  const visible     = filtered.slice(start, start + rowsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedId(null)
  }

  const handleRowsPerPage = (val: string) => {
    setRowsPerPage(Number(val))
    setCurrentPage(1)
    setExpandedId(null)
  }

  const handleCatFilter = (val: string) => {
    dispatch(setCategoryFilter(val))
    setCurrentPage(1)
    setExpandedId(null)
  }

  const handleClear = () => {
    dispatch(clearDowntimeFilters())
    setCurrentPage(1)
    setExpandedId(null)
  }

  const handleAlarmClick = (alarmRef: string) => {
    router.push(`/alarms/history?alarm=${alarmRef}`)
  }

  const handleRowClick = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  // ── Totals for footer ──────────────────────────────────────────────────────

  const totalDowntime = filtered.reduce((acc, e) => acc + e.durationMinutes, 0)
  const avgDuration   = filtered.length > 0 ? totalDowntime / filtered.length : 0

  // ── Equipment filter via dropdown ─────────────────────────────────────────

  const handleEquipmentDropdown = (val: string) => {
    if (val === 'all') {
      dispatch(clearDowntimeFilters())
    } else {
      // The Redux selectEquipment action toggles — ensure we get to the right state
      if (selectedEquip === val) {
        dispatch(selectEquipment(val))  // deselect (toggle to 'all')
      } else {
        if (selectedEquip !== 'all') dispatch(selectEquipment(selectedEquip)) // clear previous
        dispatch(selectEquipment(val))   // select new
      }
    }
    setCurrentPage(1)
    setExpandedId(null)
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const handleExportFilteredCSV = () => {
    const headers = ['ID','DATE','START','END','DURATION','EQUIPMENT','CATEGORY','CAUSE','IMPACT','RESOLVED BY','ALARM REF']
    const rows = [headers.join(',')]
    filtered.forEach(e => {
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
    a.download = 'downtime_events.csv'
    a.click()
    URL.revokeObjectURL(url)
    dispatch(pushNotification({ id: Date.now().toString(), type: 'success', message: 'Downtime events exported as CSV' }))
  }

  // ── Action slot ────────────────────────────────────────────────────────────

  const actionSlot = (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={selectedEquip}
        onChange={handleEquipmentDropdown}
        options={EQUIPMENT_OPTIONS}
        className="w-36"
      />
      <Select
        value={categoryFilter}
        onChange={handleCatFilter}
        options={CATEGORY_OPTIONS}
        className="w-40"
      />
      <Button variant="ghost" size="sm" onClick={handleClear}>
        Clear
      </Button>
    </div>
  )

  return (
    <Card title="DOWNTIME EVENTS" accent="alarm" action={actionSlot} noPadding>
      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-scada-border bg-scada-panel">
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide w-6" />
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">START TIME</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">END TIME</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">DURATION</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">EQUIPMENT</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">CATEGORY</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">CAUSE</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">IMPACT</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">RESOLVED BY</th>
              <th className="px-3 py-2 text-left text-text-muted font-mono uppercase text-[10px] tracking-wide">ALARM REF</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-text-muted text-xs font-mono">
                  No events match the current filters.
                </td>
              </tr>
            ) : (
              visible.map(evt => {
                const isExpanded   = expandedId === evt.id
                const isLongDur    = evt.durationMinutes >= 30
                const rowBg        = getRowBg(evt.category, isExpanded)

                return (
                  <Fragment key={evt.id}>
                    <tr
                      className={`border-b border-scada-border cursor-pointer transition-colors ${rowBg}`}
                      onClick={() => handleRowClick(evt.id)}
                    >
                      {/* Expand chevron */}
                      <td className="px-3 py-2 text-text-muted">
                        {isExpanded
                          ? <ChevronDown size={12} />
                          : <ChevronRight size={12} />
                        }
                      </td>
                      {/* Start time */}
                      <td className="px-3 py-2 font-mono text-text-muted">
                        {evt.date} {evt.startTime}
                      </td>
                      {/* End time */}
                      <td className="px-3 py-2 font-mono text-text-muted">{evt.endTime}</td>
                      {/* Duration */}
                      <td className={`px-3 py-2 font-mono value-display ${isLongDur ? 'text-status-alarm font-bold' : 'text-text-value'}`}>
                        {evt.duration}
                      </td>
                      {/* Equipment */}
                      <td className="px-3 py-2 text-accent-primary font-mono">{evt.equipment}</td>
                      {/* Category badge */}
                      <td className="px-3 py-2">
                        <Badge variant={getCategoryBadgeVariant(evt.category)} label={evt.category} />
                      </td>
                      {/* Cause */}
                      <td className="px-3 py-2 text-text-primary max-w-48 truncate">{evt.cause}</td>
                      {/* Impact */}
                      <td className="px-3 py-2 text-status-warning font-mono">
                        {evt.impactedBatches > 0 ? `${evt.impactedBatches} batch${evt.impactedBatches > 1 ? 'es' : ''}` : '—'}
                      </td>
                      {/* Resolved by */}
                      <td className="px-3 py-2 text-text-muted">{evt.resolvedBy}</td>
                      {/* Alarm ref */}
                      <td className="px-3 py-2">
                        {evt.alarmRef !== '—' ? (
                          <button
                            className="text-accent-primary underline cursor-pointer font-mono"
                            onClick={e => {
                              e.stopPropagation()
                              handleAlarmClick(evt.alarmRef)
                            }}
                          >
                            {evt.alarmRef}
                          </button>
                        ) : (
                          <span className="text-text-muted font-mono">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Inline expanded detail */}
                    {isExpanded && (
                      <ExpandedDetail
                        event={evt}
                        onAlarmClick={handleAlarmClick}
                      />
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="bg-scada-panel border-t border-scada-border px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        {/* Totals */}
        <div className="flex items-center gap-6 text-xs font-mono text-text-muted">
          <span>
            TOTAL EVENTS&nbsp;&nbsp;&nbsp;<span className="text-text-primary">{filtered.length}</span>
          </span>
          <span>
            TOTAL DOWNTIME&nbsp;&nbsp;<span className="text-text-primary">{Math.round(totalDowntime)} min</span>
          </span>
          <span>
            AVG DURATION&nbsp;&nbsp;&nbsp;<span className="text-text-primary">{avgDuration.toFixed(1)} min</span>
          </span>
        </div>

        {/* Pagination + rows-per-page */}
        <div className="flex items-center gap-3">
          <Select
            value={String(rowsPerPage)}
            onChange={handleRowsPerPage}
            options={ROWS_PER_PAGE_OPTIONS}
            className="w-28"
          />
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              className="px-2 py-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
              disabled={safePage <= 1}
              onClick={() => handlePageChange(safePage - 1)}
            >
              ← Previous
            </button>
            <span className="text-text-muted px-1">
              Page <span className="text-text-primary">{safePage}</span> of{' '}
              <span className="text-text-primary">{totalPages}</span>
            </span>
            <button
              className="px-2 py-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
              disabled={safePage >= totalPages}
              onClick={() => handlePageChange(safePage + 1)}
            >
              Next →
            </button>
          </div>
          <span className="text-text-muted text-xs font-mono">
            Showing{' '}
            <span className="text-text-primary">{filtered.length === 0 ? 0 : start + 1}–{Math.min(start + rowsPerPage, filtered.length)}</span>
            {' '}of <span className="text-text-primary">{filtered.length}</span>
          </span>
        </div>

        {/* Export button */}
        <Button variant="ghost" size="sm" onClick={handleExportFilteredCSV}>
          Export CSV
        </Button>
      </div>
    </Card>
  )
}




