'use client'

// Client component — Recharts PieChart is client-only; click handler dispatches Redux filter

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTableRecipeFilter, selectTableRecipeFilter } from '@/store/slices/productionReportSlice'
import { mockRecipeMix } from '@/lib/mock/reports'
import { Card } from '@/components/ui'

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipPayload {
  name:    string
  payload: { batches: number; pct: number }
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <div className="text-text-primary font-medium mb-0.5">{d.name}</div>
      <div className="text-text-muted">{d.payload.batches} batches · {d.payload.pct}%</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecipeMixChart() {
  const dispatch     = useAppDispatch()
  const recipeFilter = useAppSelector(selectTableRecipeFilter)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const handleSegmentClick = (_: unknown, index: number) => {
    const recipe = mockRecipeMix[index]
    if (recipeFilter === recipe.name) {
      setActiveIdx(null)
      dispatch(setTableRecipeFilter('all'))
    } else {
      setActiveIdx(index)
      dispatch(setTableRecipeFilter(recipe.name))
    }
  }

  return (
    <Card title="RECIPE DISTRIBUTION" accent="gold">
      <div className="flex items-center gap-4">
        {/* Donut chart with center label */}
        <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={mockRecipeMix}
                dataKey="batches"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                onClick={handleSegmentClick}
                style={{ cursor: 'pointer' }}
              >
                {mockRecipeMix.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke={activeIdx === i ? '#e8eaf6' : 'transparent'}
                    strokeWidth={activeIdx === i ? 2 : 0}
                    opacity={recipeFilter === 'all' || recipeFilter === entry.name ? 1 : 0.4}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-text-value text-xl font-mono value-display">142</span>
            <span className="text-text-muted text-[10px] font-mono uppercase tracking-wide">BATCHES</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {mockRecipeMix.map((entry, i) => {
            const isActive = recipeFilter === entry.name
            return (
              <button
                key={entry.name}
                onClick={() => handleSegmentClick(null, i)}
                className={`flex items-start gap-2 text-left w-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                <span
                  className="mt-0.5 shrink-0 rounded-scada"
                  style={{ width: 10, height: 10, background: entry.color }}
                />
                <div className="min-w-0">
                  <div className="text-text-muted text-xs font-mono truncate">{entry.name}</div>
                  <div className="text-text-primary text-xs font-mono">
                    {entry.batches} <span className="text-text-muted">· {entry.pct}%</span>
                  </div>
                </div>
              </button>
            )
          })}
          {recipeFilter !== 'all' && (
            <button
              onClick={() => { setActiveIdx(null); dispatch(setTableRecipeFilter('all')) }}
              className="text-accent-primary text-[10px] font-mono uppercase tracking-wide hover:opacity-80 text-left"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
