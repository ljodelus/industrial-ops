'use client'

// Client component — manages row expansion and pagination state
// Receives full filtered list from parent; slices internally for display

import { useState } from 'react'
import { AlarmHistoryRow } from './AlarmHistoryRow'
import { Button }  from '@/components/ui/Button'
import { Select }  from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChevronLeft, ChevronRight, BellOff } from '@/lib/icons'
import type { AlarmHistoryEntry } from '@/types'

const PAGE_SIZE_OPTIONS = [
  { value: '15', label: '15' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
]

const COLUMNS = [
  'SEVERITY', 'MESSAGE', 'SOURCE', 'CATEGORY',
  'TRIGGERED AT', 'DURATION', 'ACKNOWLEDGED BY', 'ACKNOWLEDGED AT', 'STATUS',
]

interface AlarmHistoryTableProps {
  entries: AlarmHistoryEntry[]
}

export function AlarmHistoryTable({ entries }: AlarmHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(15)

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))

  // Clamp page when entries shrink (e.g. filter changes)
  const safePage  = Math.min(page, totalPages)

  const start    = (safePage - 1) * pageSize
  const pageRows = entries.slice(start, start + pageSize)

  function handleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  function handlePageChange(next: number) {
    setPage(Math.max(1, Math.min(next, totalPages)))
    setExpandedId(null)
  }

  function handlePageSizeChange(val: string) {
    setPageSize(Number(val))
    setPage(1)
    setExpandedId(null)
  }

  // Page number buttons — show up to 5
  function pageButtons(): number[] {
    const half  = 2
    let lo      = Math.max(1, safePage - half)
    const hi    = Math.min(totalPages, lo + 4)
    lo          = Math.max(1, hi - 4)
    const pages: number[] = []
    for (let i = lo; i <= hi; i++) pages.push(i)
    return pages
  }

  if (entries.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<BellOff size={40} className="text-text-muted" />}
          message="No alarm history records match the current filters."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="border-b border-scada-border bg-scada-panel">
              {COLUMNS.map(col => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-text-muted text-[10px] font-mono uppercase tracking-wide whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-scada-border/50">
            {pageRows.map((entry, idx) => (
              <AlarmHistoryRow
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                isOdd={idx % 2 !== 0}
                onClick={() => handleExpand(entry.id)}
                onClose={() => setExpandedId(null)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-scada-border bg-scada-surface">
        {/* Left: previous / page numbers / next */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={14} />}
            disabled={safePage <= 1}
            onClick={() => handlePageChange(safePage - 1)}
          >
            Previous
          </Button>

          {pageButtons().map(p => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 text-xs font-mono rounded-scada transition-colors
                ${p === safePage
                  ? 'bg-scada-panel border border-accent-primary text-accent-primary'
                  : 'text-text-muted hover:text-text-primary'
                }`}
            >
              {p}
            </button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={14} />}
            disabled={safePage >= totalPages}
            onClick={() => handlePageChange(safePage + 1)}
          >
            Next
          </Button>
        </div>

        {/* Right: page info + rows per page */}
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-xs font-mono whitespace-nowrap">
            Showing {start + 1}–{Math.min(start + pageSize, entries.length)} of {entries.length} alarms
          </span>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono">Rows per page</span>
            <div className="w-20">
              <Select
                value={String(pageSize)}
                onChange={handlePageSizeChange}
                options={PAGE_SIZE_OPTIONS}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

