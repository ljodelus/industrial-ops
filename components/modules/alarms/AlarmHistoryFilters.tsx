'use client'

// Client component — manages date picker inputs, quick-range pills, search and selects
// Uses useAppDispatch/useAppSelector to interact with alarmHistorySlice filters

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAlarmHistoryFilters,
  setHistorySearch,
  setHistorySeverity,
  setHistoryCategory,
  setHistorySource,
  setHistoryStatus,
  setHistoryDateFrom,
  setHistoryDateTo,
  clearHistoryFilters,
} from '@/store/slices/alarmHistorySlice'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search } from '@/lib/icons'
import { useState } from 'react'

type QuickRange = 'today' | '7d' | '30d' | 'month' | ''

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
  { value: 'info',     label: 'Info' },
]

const CATEGORY_OPTIONS = [
  { value: '',              label: 'All Categories' },
  { value: 'Motion',        label: 'Motion' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Process',       label: 'Process' },
  { value: 'Recipe',        label: 'Recipe' },
  { value: 'Sensor',        label: 'Sensor' },
  { value: 'Collision',     label: 'Collision' },
  { value: 'System',        label: 'System' },
]

const SOURCE_OPTIONS = [
  { value: '',          label: 'All Sources' },
  { value: 'CRANE-1',  label: 'CRANE-1' },
  { value: 'CRANE-2',  label: 'CRANE-2' },
  { value: 'CRANE-3',  label: 'CRANE-3' },
  { value: 'CRANE-4',  label: 'CRANE-4' },
  { value: 'PLC-LINE1',label: 'PLC-LINE1' },
  { value: 'PLC-LINE2',label: 'PLC-LINE2' },
]

const STATUS_OPTIONS = [
  { value: '',               label: 'All Status' },
  { value: 'acknowledged',   label: 'Acknowledged' },
  { value: 'unacknowledged', label: 'Unacknowledged' },
]

interface AlarmHistoryFiltersProps {
  filteredCount: number
  totalCount:    number
  currentPage:   number
  totalPages:    number
}

export function AlarmHistoryFilters({
  filteredCount,
  totalCount,
  currentPage,
  totalPages,
}: AlarmHistoryFiltersProps) {
  const dispatch = useAppDispatch()
  const filters  = useAppSelector(selectAlarmHistoryFilters)
  const [activeQuick, setActiveQuick] = useState<QuickRange>('7d')

  const today = () => new Date().toISOString().slice(0, 10)
  const daysAgo = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
  }
  const monthStart = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }

  function applyQuickRange(range: QuickRange) {
    setActiveQuick(range)
    const to = today()
    if (range === 'today') {
      dispatch(setHistoryDateFrom(to))
      dispatch(setHistoryDateTo(to))
    } else if (range === '7d') {
      dispatch(setHistoryDateFrom(daysAgo(7)))
      dispatch(setHistoryDateTo(to))
    } else if (range === '30d') {
      dispatch(setHistoryDateFrom(daysAgo(30)))
      dispatch(setHistoryDateTo(to))
    } else if (range === 'month') {
      dispatch(setHistoryDateFrom(monthStart()))
      dispatch(setHistoryDateTo(to))
    }
  }

  const hasActiveFilter =
    filters.search   !== '' ||
    filters.severity !== '' ||
    filters.category !== '' ||
    filters.source   !== '' ||
    filters.status   !== ''

  function handleClear() {
    dispatch(clearHistoryFilters())
    setActiveQuick('7d')
  }

  const quickPillBase = 'px-3 py-1 text-xs font-mono uppercase rounded-scada border transition-colors cursor-pointer'
  const quickActive   = 'bg-accent-primary text-scada-bg border-accent-primary'
  const quickInactive = 'bg-scada-panel text-text-muted border-scada-border hover:text-text-primary'

  return (
    <div className="bg-scada-surface border-b border-scada-border px-6 py-3 flex flex-col gap-3">

      {/* ── Date range row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs uppercase font-mono">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => { dispatch(setHistoryDateFrom(e.target.value)); setActiveQuick('') }}
              className="bg-scada-bg border border-scada-border text-text-primary text-sm px-3 py-2 rounded-scada outline-none focus:border-accent-primary transition-colors font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs uppercase font-mono">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => { dispatch(setHistoryDateTo(e.target.value)); setActiveQuick('') }}
              className="bg-scada-bg border border-scada-border text-text-primary text-sm px-3 py-2 rounded-scada outline-none focus:border-accent-primary transition-colors font-mono"
            />
          </div>
        </div>

        {/* Quick range pills */}
        <div className="flex items-center gap-1 pb-0.5">
          {(['today', '7d', '30d', 'month'] as QuickRange[]).map(range => (
            <button
              key={range}
              onClick={() => applyQuickRange(range)}
              className={`${quickPillBase} ${activeQuick === range ? quickActive : quickInactive}`}
            >
              {range === 'today' ? 'Today' : range === '7d' ? 'Last 7d' : range === '30d' ? 'Last 30d' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter row ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-40">
          <Input
            type="search"
            placeholder="Search message or source..."
            value={filters.search}
            onChange={e => dispatch(setHistorySearch(e.target.value))}
            icon={<Search size={14} />}
          />
        </div>
        <div className="w-36">
          <Select
            value={filters.severity}
            onChange={v => dispatch(setHistorySeverity(v))}
            options={SEVERITY_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.category}
            onChange={v => dispatch(setHistoryCategory(v))}
            options={CATEGORY_OPTIONS}
          />
        </div>
        <div className="w-36">
          <Select
            value={filters.source}
            onChange={v => dispatch(setHistorySource(v))}
            options={SOURCE_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.status}
            onChange={v => dispatch(setHistoryStatus(v))}
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Results counter + clear */}
        <div className="flex items-center gap-3 pb-1.5">
          <span className="text-text-muted text-xs font-mono whitespace-nowrap">
            Showing {filteredCount} of {totalCount} alarms · Page {currentPage} of {totalPages || 1}
          </span>
          {hasActiveFilter && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

