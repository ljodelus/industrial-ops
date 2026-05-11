'use client'

// Client component — useState for expanded row (UI-only); useAppSelector + useAppDispatch for filters

import { useState, Fragment } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectFilteredRecurringAlarms,
  selectAlarmSourceFilter,
  selectAlarmMinTriggers,
  selectAlarmSources,
  setSourceFilter,
  setMinTriggers,
  clearFilters,
} from '@/store/slices/alarmReportSlice'
import type { RecurringAlarm, RecurringAlarmTrend, BadgeProps } from '@/types'
import { Card, Badge, Select, Button } from '@/components/ui'
import { TrendingUp, TrendingDown, ArrowRight } from '@/lib/icons'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_VARIANT: Record<string, BadgeProps['variant']> = {
  Motion:    'warning',
  Comm:      'alarm',
  Process:   'info',
  Recipe:    'gold',
  Collision: 'alarm',
  Sensor:    'warning',
}

function getCategoryVariant(category: string): BadgeProps['variant'] {
  return CATEGORY_VARIANT[category] ?? 'idle'
}

function TrendIcon({ trend }: { trend: RecurringAlarmTrend }) {
  if (trend === 'up')     return <TrendingUp   size={14} className="text-status-alarm" />
  if (trend === 'down')   return <TrendingDown size={14} className="text-status-ok"    />
  return                         <ArrowRight   size={14} className="text-text-muted"   />
}

// ─── Expanded Detail Panel ────────────────────────────────────────────────────

function AlarmPatternDetail({ alarm }: { alarm: RecurringAlarm }) {
  return (
    <div className="bg-scada-bg border-t border-scada-border px-6 py-4">
      {/* Pattern summary */}
      <div className="mb-3">
        <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Alarm Pattern</span>
        <div className="mt-1 text-xs font-mono text-text-primary">
          Triggered {alarm.triggers} times over 7 days ({alarm.avgPerDay})
        </div>
        <div className="text-xs font-mono text-text-muted">
          Peak day: {alarm.peakDay} · Peak hour: {alarm.peakHour}
        </div>
      </div>

      {/* Last 3 occurrences */}
      <div className="mb-3">
        <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Last 3 Occurrences</span>
        <div className="mt-1 flex flex-col gap-1">
          {alarm.lastOccurrences.map((occ, i) => (
            <div key={i} className="flex gap-4 text-xs font-mono">
              <span className="text-text-muted w-40">{occ.timestamp}</span>
              <span className="text-text-muted">acknowledged in</span>
              <span className="value-display text-accent-gold">{occ.acknowledgedIn}</span>
              <span className="text-text-muted">by</span>
              <span className="text-text-primary">{occ.acknowledgedBy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div>
        <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Recommendation</span>
        <p className="mt-1 text-xs font-mono text-text-muted leading-relaxed">
          {alarm.recommendation.split('—').map((part, i) =>
            i === 0
              ? <span key={i}>{part}—</span>
              : <span key={i} className="text-accent-gold">{part}</span>
          )}
        </p>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecurringAlarmsTable() {
  const dispatch     = useAppDispatch()
  const alarms       = useAppSelector(selectFilteredRecurringAlarms)
  const sourceFilter = useAppSelector(selectAlarmSourceFilter)
  const minTriggers  = useAppSelector(selectAlarmMinTriggers)
  const sources      = useAppSelector(selectAlarmSources)

  // Local state — expanded row (UI-only, like dropdown open/closed)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? alarms : alarms.slice(0, 10)

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    ...sources.map(s => ({ value: s.source, label: s.source })),
  ]

  const isNuisance = (alarm: RecurringAlarm) =>
    alarm.trend === 'up' && alarm.triggers > 5

  return (
    <Card
      title="RECURRING ALARMS"
      accent="alarm"
      noPadding
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={sourceFilter}
            onChange={v => dispatch(setSourceFilter(v))}
            options={sourceOptions}
            className="w-36"
          />
          <div className="flex items-center gap-1">
            <span className="text-text-muted text-[10px] font-mono">Min triggers:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={minTriggers}
              onChange={e => dispatch(setMinTriggers(Number(e.target.value)))}
              className="w-12 bg-scada-bg border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => dispatch(clearFilters())}>
            Clear
          </Button>
        </div>
      }
    >
      <p className="px-4 py-2 text-[10px] font-mono text-text-muted border-b border-scada-border">
        Alarms triggered more than {minTriggers - 1} time{minTriggers > 2 ? 's' : ''} in the selected period
      </p>

      {/* ── Table header ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-scada-border">
              {['RANK', 'MESSAGE', 'SOURCE', 'CATEGORY', 'TRIGGERS', 'AVG RESP', 'FIRST SEEN', 'LAST SEEN', 'TREND'].map(h => (
                <th
                  key={h}
                  className="px-3 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(alarm => {
              const nuisance   = isNuisance(alarm)
              const isExpanded = expandedId === alarm.id
              return (
                <Fragment key={alarm.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : alarm.id)}
                    className={`border-b border-scada-border cursor-pointer transition-colors
                      ${nuisance ? 'bg-status-alarm/5' : ''}
                      hover:bg-scada-panel`}
                  >
                    <td className="px-3 py-2">
                      <span className="text-accent-gold font-mono text-xs font-bold">#{alarm.rank}</span>
                    </td>
                    <td className="px-3 py-2 max-w-56">
                      <span className="text-text-primary text-xs font-mono truncate block">{alarm.message}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-accent-primary font-mono text-xs">{alarm.source}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={getCategoryVariant(alarm.category)} label={alarm.category} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="value-display text-xs font-bold text-text-value">{alarm.triggers}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="value-display text-xs text-text-primary">{alarm.avgResponse}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-text-muted">{alarm.firstSeen}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-text-muted">{alarm.lastSeen}</span>
                    </td>
                    <td className="px-3 py-2">
                      <TrendIcon trend={alarm.trend} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="p-0">
                        <AlarmPatternDetail alarm={alarm} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {alarms.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-text-muted text-xs font-mono">
                  No recurring alarms match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Show more ───────────────────────────────────────────────────────── */}
      {alarms.length > 10 && !showAll && (
        <div className="px-4 py-2 border-t border-scada-border">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
            Show more ({alarms.length - 10} remaining)
          </Button>
        </div>
      )}
    </Card>
  )
}

