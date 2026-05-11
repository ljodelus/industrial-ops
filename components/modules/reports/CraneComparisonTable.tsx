'use client'

// Client component — uses onClick (event listener) + useAppSelector/Dispatch

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectComparisonRows, highlightCrane } from '@/store/slices/craneUtilizationSlice'
import { Card } from '@/components/ui'
import type { CraneComparisonMetric } from '@/types'

// Rows where CRANE-4 values are explicitly alarmed regardless of best/worst
const CRANE4_ALARM_METRICS = new Set(['Fault Time', 'Faults', 'MTBF'])

const COLUMN_HEADERS = ['METRIC', 'CRANE-1', 'CRANE-2', 'CRANE-3', 'CRANE-4', 'FLEET AVG']

const HEADER_STYLE: Record<string, string> = {
  'CRANE-1':   'text-accent-primary font-mono',
  'CRANE-2':   'text-accent-primary font-mono opacity-80',
  'CRANE-3':   'text-accent-gold font-mono',
  'CRANE-4':   'text-accent-gold font-mono opacity-80',
  'FLEET AVG': 'text-text-muted font-mono',
  'METRIC':    'text-text-muted font-mono',
}

const CRANE_KEYS: (keyof CraneComparisonMetric)[] = ['crane1', 'crane2', 'crane3', 'crane4', 'fleetAvg']
const CRANE_IDS  = ['CRANE-1', 'CRANE-2', 'CRANE-3', 'CRANE-4']

function getCellClass(
  row: CraneComparisonMetric,
  colIndex: number,   // 0–4 for crane1..fleetAvg
): string {
  if (colIndex === 4) return 'text-text-muted'   // fleet avg

  const dataIndex = colIndex   // 0-based crane index

  if (CRANE4_ALARM_METRICS.has(row.metric) && dataIndex === 3) {
    return 'text-status-alarm value-display text-xs'
  }
  if (row.bestIndex === dataIndex) {
    return 'text-status-ok font-bold value-display text-xs'
  }
  if (row.worstIndex === dataIndex) {
    return 'text-status-alarm value-display text-xs'
  }
  return 'text-text-primary value-display text-xs'
}

export function CraneComparisonTable() {
  const dispatch        = useAppDispatch()
  const rows            = useAppSelector(selectComparisonRows)

  function handleHeaderClick(craneId: string) {
    // Scroll to crane row in Section B
    const el = document.getElementById(`crane-row-${craneId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      dispatch(highlightCrane(craneId))
      setTimeout(() => dispatch(highlightCrane(null)), 2000)
    }
  }

  return (
    <Card title="CRANE COMPARISON" accent="primary">
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-scada-border">
              {COLUMN_HEADERS.map((header) => (
                <th
                  key={header}
                  className={`text-left py-2 px-3 text-[10px] uppercase tracking-wide ${HEADER_STYLE[header]} ${
                    CRANE_IDS.includes(header) ? 'cursor-pointer hover:opacity-100' : ''
                  }`}
                  onClick={() => CRANE_IDS.includes(header) ? handleHeaderClick(header) : undefined}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={row.metric}
                className={`border-b border-scada-border/50 hover:bg-scada-panel transition-colors ${
                  rowIdx % 2 === 0 ? '' : ''
                }`}
              >
                <td className="py-2 px-3 text-text-muted text-[10px] uppercase tracking-wide whitespace-nowrap">
                  {row.metric}
                </td>
                {CRANE_KEYS.map((key, colIdx) => (
                  <td
                    key={key}
                    className={`py-2 px-3 ${getCellClass(row, colIdx)}`}
                  >
                    {row[key] as string}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}





