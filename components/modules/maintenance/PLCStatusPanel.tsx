'use client'

// Client component — requires useState for tag list expand/collapse

import { useState } from 'react'
import { StatusDot } from '@/components/ui'
import { ChevronDown, ChevronUp, Wifi } from '@/lib/icons'

// ─── Mock OPC UA Tags ─────────────────────────────────────────────────────────

interface OpcTag {
  name:  string
  value: string
  age:   'fresh' | 'stale' | 'old'
}

const LINE1_TAGS: OpcTag[] = [
  { name: 'ns=2;s=LINE1.CRANE1.Position',  value: '3200.0 mm',    age: 'fresh' },
  { name: 'ns=2;s=LINE1.CRANE1.Load',      value: '450.0 kg',     age: 'fresh' },
  { name: 'ns=2;s=LINE1.CRANE1.Status',    value: '2 (MOVING)',   age: 'fresh' },
  { name: 'ns=2;s=LINE1.TANK2.Occupied',   value: 'TRUE',         age: 'fresh' },
  { name: 'ns=2;s=LINE1.TANK3.Occupied',   value: 'TRUE',         age: 'fresh' },
  { name: 'ns=2;s=LINE1.CRANE2.Position',  value: '800.0 mm',     age: 'fresh' },
  { name: 'ns=2;s=LINE1.CRANE2.Load',      value: '0.0 kg',       age: 'fresh' },
  { name: 'ns=2;s=LINE1.CRANE2.Status',    value: '0 (IDLE)',     age: 'fresh' },
]

const LINE2_TAGS: OpcTag[] = [
  { name: 'ns=2;s=LINE2.CRANE3.Position',  value: '5800.0 mm',    age: 'fresh' },
  { name: 'ns=2;s=LINE2.CRANE3.Load',      value: '320.0 kg',     age: 'fresh' },
  { name: 'ns=2;s=LINE2.CRANE3.Status',    value: '2 (MOVING)',   age: 'fresh' },
  { name: 'ns=2;s=LINE2.CRANE4.Position',  value: '2400.0 mm',    age: 'stale' },
  { name: 'ns=2;s=LINE2.CRANE4.Status',    value: '4 (ERROR)',    age: 'stale' },
  { name: 'ns=2;s=LINE2.TANK5.Occupied',   value: 'FALSE',        age: 'fresh' },
  { name: 'ns=2;s=LINE2.TANK6.Occupied',   value: 'TRUE',         age: 'stale' },
  { name: 'ns=2;s=LINE2.TANK7.Occupied',   value: 'TRUE',         age: 'old'   },
]

const TAG_AGE_STATUS: Record<string, 'ok' | 'warning' | 'alarm'> = {
  fresh: 'ok',
  stale: 'warning',
  old:   'alarm',
}

// ─── Progress Bar (custom latency bar) ───────────────────────────────────────

function LatencyBar({ latency }: { latency: number }) {
  const pct   = Math.min(100, (latency / 60) * 100)
  const color = latency < 10 ? 'bg-status-ok' : latency <= 50 ? 'bg-status-warning' : 'bg-status-alarm'
  const label = latency < 10 ? 'LOW' : latency <= 50 ? 'ACCEPTABLE' : 'HIGH'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-scada-border rounded-scada overflow-hidden">
        <div className={`h-full rounded-scada transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-mono ${color.replace('bg-', 'text-')}`}>{label}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PLCStatusPanelProps {
  plcId:        string
  ip:           string
  protocol:     string
  rack:         string
  status:       'ok' | 'warning'
  latency:      number      // ms
  packetLoss:   number      // %
  activeTags:   number
  totalTags:    number
  dataAge:      string
  dataAgeStatus: 'fresh' | 'stale'
  lastResponse: string
  isLine1:      boolean
}

export function PLCStatusPanel({
  plcId,
  ip,
  protocol,
  rack,
  status,
  latency,
  packetLoss,
  activeTags,
  totalTags,
  dataAge,
  dataAgeStatus,
  lastResponse,
  isLine1,
}: PLCStatusPanelProps) {
  const [expanded,     setExpanded]     = useState(false)
  const [showAllTags,  setShowAllTags]  = useState(false)

  const tags      = isLine1 ? LINE1_TAGS : LINE2_TAGS
  const allTags   = isLine1 ? 124 : totalTags
  const visibleTags = showAllTags ? tags : tags.slice(0, 8)

  const borderColor = status === 'ok' ? 'border-status-ok' : 'border-status-warning'
  const statusColor = status === 'ok' ? 'text-status-ok'   : 'text-status-warning'
  const tagPct      = Math.round((activeTags / totalTags) * 100)
  const dataAgeColor = dataAgeStatus === 'fresh' ? 'text-text-primary' : 'text-status-warning'

  return (
    <div className={`border ${borderColor} border-l-2 rounded-scada bg-scada-panel p-3 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi size={16} className={statusColor} />
          <span className="text-text-primary text-xs font-mono font-bold uppercase">{plcId}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} size="sm" />
          <span className={`text-[10px] font-mono uppercase ${statusColor}`}>
            {status === 'ok' ? 'CONNECTED' : 'WARNING'}
          </span>
          <span className="text-text-muted text-[10px] font-mono">S7-1500</span>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
        <span className="text-text-muted uppercase text-[10px]">IP ADDRESS</span>
        <span className="value-display text-text-primary">{ip}</span>

        <span className="text-text-muted uppercase text-[10px]">PROTOCOL</span>
        <span className="value-display text-text-primary">{protocol}</span>

        <span className="text-text-muted uppercase text-[10px]">RACK / SLOT</span>
        <span className="value-display text-text-primary">{rack}</span>

        <span className="text-text-muted uppercase text-[10px]">LAST RESPONSE</span>
        <span className="value-display text-text-muted">{lastResponse}</span>
      </div>

      {/* Metric bars */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-x-4 items-center text-[10px] font-mono">
          <span className="text-text-muted uppercase">LATENCY</span>
          <span className="value-display text-text-primary">{latency} ms</span>
        </div>
        <LatencyBar latency={latency} />

        <div className="grid grid-cols-2 gap-x-4 items-center text-[10px] font-mono mt-1">
          <span className="text-text-muted uppercase">PACKET LOSS</span>
          <span className="value-display text-text-primary">{packetLoss.toFixed(1)}%</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 items-center text-[10px] font-mono">
          <span className="text-text-muted uppercase">ACTIVE TAGS</span>
          <span className="value-display text-text-primary">{activeTags} / {allTags} ({tagPct}%)</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 items-center text-[10px] font-mono">
          <span className="text-text-muted uppercase">DATA AGE</span>
          <span className={`value-display ${dataAgeColor}`}>
            {dataAge} {dataAgeStatus === 'stale' ? '— STALE' : '— FRESH'}
          </span>
        </div>
      </div>

      {/* Tag list toggle */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="flex items-center gap-1 text-accent-primary text-[10px] font-mono hover:text-text-primary transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Hide Tag List' : 'Show Tag List'}
      </button>

      {expanded && (
        <div className="space-y-1 border-t border-scada-border pt-2">
          {visibleTags.map(tag => (
            <div key={tag.name} className="flex items-center justify-between gap-2">
              <span className="text-text-muted text-[10px] font-mono truncate flex-1">{tag.name}</span>
              <span className="value-display text-accent-primary text-xs shrink-0">{tag.value}</span>
              <StatusDot status={TAG_AGE_STATUS[tag.age]} size="sm" />
            </div>
          ))}
          {!showAllTags && tags.length >= 8 && (
            <button
              type="button"
              onClick={() => setShowAllTags(true)}
              className="text-accent-primary text-[10px] font-mono hover:text-text-primary transition-colors mt-1"
            >
              Show all {allTags} tags →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

