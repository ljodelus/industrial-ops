'use client'

// Client component — uses useState (pagination, expanded row), useEffect (reset page on filter change),
// useAppSelector / useAppDispatch for filter state, and inline event handlers

import { Fragment, useState, useRef, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectAllBatches,
  selectTableSearch,
  selectTableRecipeFilter,
  selectTableLineFilter,
  selectTableStatusFilter,
  setTableSearch,
  setTableRecipeFilter,
  setTableLineFilter,
  setTableStatusFilter,
  clearTableFilters,
} from '@/store/slices/productionReportSlice'
import { Badge, Button, Input, Select, Card } from '@/components/ui'
import { Search, ChevronLeft, ChevronRight } from '@/lib/icons'
import type { ProductionBatch } from '@/types'

// ─── Row status styling ───────────────────────────────────────────────────────

function rowBg(batch: ProductionBatch, idx: number): string {
  if (batch.status === 'failed')    return 'bg-status-alarm/5'
  if (batch.status === 'cancelled') return 'bg-status-offline/5'
  return idx % 2 === 0 ? 'bg-scada-surface' : 'bg-scada-bg'
}

function statusBadgeVariant(status: ProductionBatch['status']): 'ok' | 'alarm' | 'offline' {
  if (status === 'completed') return 'ok'
  if (status === 'failed')    return 'alarm'
  return 'offline'
}

// ─── Expanded row detail ──────────────────────────────────────────────────────

function ExpandedDetail({ batch }: { batch: ProductionBatch }) {
  const partStart = 42
  const partEnd   = partStart + batch.parts - 1
  return (
    <tr className="bg-scada-panel">
      <td colSpan={10} className="px-6 py-3 border-t border-scada-border">
        <div className="grid grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <div className="text-text-muted uppercase tracking-wide mb-1">PARTS DETAIL</div>
            <div className="text-text-primary">
              {batch.parts} parts processed · Part IDs: PART-{String(partStart).padStart(4,'0')} to PART-{String(partEnd).padStart(4,'0')}
            </div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wide mb-1">RECIPE STEPS</div>
            <div className="text-text-primary">
              6 steps completed · Avg dwell accuracy: 96.4%
            </div>
          </div>
          <div>
            <div className="text-text-muted uppercase tracking-wide mb-1">NOTES</div>
            <div className="text-text-muted">—</div>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Recipe filter options ────────────────────────────────────────────────────

const RECIPE_OPTIONS = [
  { value: 'all',              label: 'All Recipes'      },
  { value: 'ZINC STANDARD',    label: 'ZINC STANDARD'    },
  { value: 'PHOSPHATE LIGHT',  label: 'PHOSPHATE LIGHT'  },
  { value: 'HEAVY DEGREASING', label: 'HEAVY DEGREASING' },
]

const LINE_OPTIONS = [
  { value: 'all',    label: 'All Lines' },
  { value: 'LINE-1', label: 'LINE-1'    },
  { value: 'LINE-2', label: 'LINE-2'    },
]

const STATUS_OPTIONS = [
  { value: 'all',       label: 'All Status' },
  { value: 'completed', label: 'Completed'  },
  { value: 'failed',    label: 'Failed'     },
  { value: 'cancelled', label: 'Cancelled'  },
]

const ROWS_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function BatchDetailTable() {
  const dispatch      = useAppDispatch()
  const batches       = useAppSelector(selectAllBatches)
  const search        = useAppSelector(selectTableSearch)
  const recipeFilter  = useAppSelector(selectTableRecipeFilter)
  const lineFilter    = useAppSelector(selectTableLineFilter)
  const statusFilter  = useAppSelector(selectTableStatusFilter)

  const [page, setPage]               = useState(1)
  const [rowsPerPage, setRowsPerPage]  = useState(10)
  const [expandedRow, setExpandedRow]  = useState<string | null>(null)

  // "Adjusting state while rendering" pattern (React docs) — reset page when filters change
  // without using useEffect, which triggers a cascading re-render warning
  const filtersSignature = `${search}|${recipeFilter}|${lineFilter}|${statusFilter}`
  const prevFiltersRef   = useRef(filtersSignature)
  if (prevFiltersRef.current !== filtersSignature) {
    prevFiltersRef.current = filtersSignature
    if (page !== 1) setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return batches.filter(b => {
      if (q && !b.id.toLowerCase().includes(q) && !b.recipeName.toLowerCase().includes(q) && !b.crane.toLowerCase().includes(q)) return false
      if (recipeFilter !== 'all' && b.recipeName !== recipeFilter) return false
      if (lineFilter   !== 'all' && b.line      !== lineFilter)    return false
      if (statusFilter !== 'all' && b.status    !== statusFilter)  return false
      return true
    })
  }, [batches, search, recipeFilter, lineFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const pageStart  = (page - 1) * rowsPerPage
  const pageEnd    = Math.min(pageStart + rowsPerPage, filtered.length)
  const paginated  = filtered.slice(pageStart, pageEnd)

  const handleRowClick = (id: string) => {
    setExpandedRow(prev => (prev === id ? null : id))
  }

  const action = (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        type="search"
        placeholder="Search batches..."
        value={search}
        onChange={e => dispatch(setTableSearch(e.target.value))}
        icon={<Search size={12} />}
        className="w-44"
      />
      <Select
        value={recipeFilter}
        onChange={v => dispatch(setTableRecipeFilter(v))}
        options={RECIPE_OPTIONS}
        className="w-40"
      />
      <Select
        value={lineFilter}
        onChange={v => dispatch(setTableLineFilter(v))}
        options={LINE_OPTIONS}
        className="w-32"
      />
      <Select
        value={statusFilter}
        onChange={v => dispatch(setTableStatusFilter(v))}
        options={STATUS_OPTIONS}
        className="w-32"
      />
      <Button variant="ghost" size="sm" onClick={() => dispatch(clearTableFilters())}>
        Clear
      </Button>
    </div>
  )

  return (
    <Card title="BATCH DETAILS" accent="primary" action={action} noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-scada-panel border-b border-scada-border">
              {['BATCH ID', 'RECIPE', 'LINE', 'CRANE', 'PARTS', 'STARTED', 'COMPLETED', 'CYCLE TIME', 'ON TIME', 'STATUS'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-text-muted font-mono uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-text-muted font-mono text-xs">
                  No batches match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((batch, idx) => (
                <Fragment key={batch.id}>
                  <tr
                    onClick={() => handleRowClick(batch.id)}
                    className={`border-b border-scada-border cursor-pointer hover:bg-scada-panel transition-colors ${rowBg(batch, idx)}`}
                  >
                    <td className="px-3 py-2 text-accent-gold font-mono">{batch.id}</td>
                    <td className="px-3 py-2 text-text-primary whitespace-nowrap">{batch.recipeName}</td>
                    <td className="px-3 py-2 font-mono text-text-primary">{batch.line}</td>
                    <td className="px-3 py-2 text-accent-primary font-mono">{batch.crane}</td>
                    <td className="px-3 py-2 value-display text-text-value">{batch.parts}</td>
                    <td className="px-3 py-2 font-mono text-text-muted whitespace-nowrap">{batch.startedAt}</td>
                    <td className="px-3 py-2 font-mono text-text-muted whitespace-nowrap">{batch.completedAt}</td>
                    <td className="px-3 py-2 value-display text-text-value">{batch.cycleTime}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={batch.onTime ? 'ok' : 'alarm'}
                        label={batch.onTime ? 'YES' : 'NO'}
                        className={!batch.onTime ? 'text-status-alarm' : ''}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={statusBadgeVariant(batch.status)} label={batch.status} />
                    </td>
                  </tr>
                  {expandedRow === batch.id && <ExpandedDetail batch={batch} />}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-scada-border bg-scada-bg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={12} />}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-text-muted text-xs font-mono">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight size={12} />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-xs font-mono">
            Showing {filtered.length === 0 ? 0 : pageStart + 1}–{pageEnd} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-text-muted text-xs font-mono">Rows per page:</span>
            <Select
              value={String(rowsPerPage)}
              onChange={v => { setRowsPerPage(Number(v)); setPage(1) }}
              options={ROWS_OPTIONS}
              className="w-16"
            />
          </div>
        </div>
      </div>

      {/* Table footer summary */}
      <div className="flex items-center gap-4 px-4 py-2 bg-scada-panel border-t border-scada-border text-xs font-mono">
        <span className="text-text-muted">TOTAL</span>
        <span className="text-text-primary">142 batches</span>
        <span className="text-text-muted">·</span>
        <span className="text-text-primary">1,284 parts</span>
        <span className="text-text-muted">·</span>
        <span className="text-text-muted">Avg:</span>
        <span className="text-text-primary">52 min</span>
        <span className="text-text-muted">·</span>
        <span className="text-text-primary">94.3%</span>
        <span className="text-text-muted">on time</span>
      </div>
    </Card>
  )
}





