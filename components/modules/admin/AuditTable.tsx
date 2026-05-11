'use client'
// Client component — paginated audit log table with inline expand

import { useState } from 'react'
import { Card } from '@/components/ui'
import { AuditRow } from './AuditRow'
import { ChevronLeft, ChevronRight } from '@/lib/icons'
import type { AuditEntry } from '@/types'

const ROWS_OPTIONS = [20, 50, 100]

const COLUMNS = [
  'TIMESTAMP', 'CATEGORY', 'USER', 'ACTION', 'TARGET', 'IP ADDRESS', 'RESULT', 'SEVERITY', '',
]

interface AuditTableProps {
  entries:     AuditEntry[]
  page:        number
  rowsPerPage: number
  onPage:      (p: number) => void
  onRowsPerPage: (n: number) => void
}

export function AuditTable({ entries, page, rowsPerPage, onPage, onRowsPerPage }: AuditTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(entries.length / rowsPerPage))
  const start      = (page - 1) * rowsPerPage
  const pageRows   = entries.slice(start, start + rowsPerPage)

  function toggleRow(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  function handlePage(p: number) {
    setExpandedId(null)
    onPage(p)
  }

  return (
    <Card title="AUDIT EVENTS" accent="primary" noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-scada-border bg-scada-panel">
              {COLUMNS.map(col => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-[10px] font-mono text-text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-text-muted text-xs font-mono">
                  No audit entries match the current filters.
                </td>
              </tr>
            ) : (
              pageRows.map((entry, i) => (
                <AuditRow
                  key={entry.id}
                  entry={entry}
                  isEven={i % 2 === 0}
                  isExpanded={expandedId === entry.id}
                  onToggle={() => toggleRow(entry.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-scada-border">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono">Rows per page:</span>
          {ROWS_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => { onRowsPerPage(n); handlePage(1) }}
              className={`px-2 py-0.5 rounded-scada text-xs font-mono border transition-colors ${
                rowsPerPage === n
                  ? 'bg-accent-primary text-scada-bg border-accent-primary'
                  : 'text-text-muted border-scada-border hover:border-accent-primary'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-text-muted text-xs font-mono">
            Showing {entries.length === 0 ? 0 : start + 1}–{Math.min(start + rowsPerPage, entries.length)} of {entries.length}
          </span>

          <button
            onClick={() => handlePage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 text-xs font-mono text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} className="text-text-muted" />
            Previous
          </button>

          <span className="text-text-value text-xs font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => handlePage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-xs font-mono text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={14} className="text-text-muted" />
          </button>
        </div>
      </div>
    </Card>
  )
}

