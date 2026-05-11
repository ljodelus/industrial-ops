'use client'

import { useState } from 'react'
import type { TableProps, Column } from '@/types'
import { EmptyState } from './EmptyState'

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found.',
  className = '',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return
    const key = col.key as string
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = (a as Record<string, unknown>)[sortKey]
    const bv = (b as Record<string, unknown>)[sortKey]
    if (av === bv) return 0
    const cmp = av! > bv! ? 1 : -1
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="w-full text-sm text-text-primary border-collapse">
        <thead>
          <tr className="bg-scada-panel border-b border-scada-border">
            {columns.map((col) => (
              <th
                key={col.key as string}
                onClick={() => handleSort(col)}
                className={`px-4 py-3 text-left text-text-muted text-xs uppercase tracking-wider font-mono ${col.width ?? ''} ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className={sortKey === col.key ? 'text-accent-primary' : 'text-text-muted opacity-40'}>
                      {sortKey === col.key && sortDir === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12">
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`border-l-2 border-transparent hover:border-accent-primary hover:bg-scada-panel transition-colors
                  ${i % 2 === 0 ? 'bg-scada-bg' : 'bg-scada-surface'}
                  ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key as string} className="px-4 py-3">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
