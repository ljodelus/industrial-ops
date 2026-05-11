// Pure display component — no hooks, no event handlers

interface NetworkStatsTableProps {
  plc1Latency:   number
  plc2Latency:   number
  mqttMsgPerSec: number
}

interface StatRow {
  label:  string
  val1:   string
  val2:   string
  warn2?: boolean
}

export function NetworkStatsTable({ plc1Latency, plc2Latency, mqttMsgPerSec }: NetworkStatsTableProps) {
  const rows: StatRow[] = [
    { label: 'LATENCY (LIVE)',  val1: `${plc1Latency} ms`,                val2: `${plc2Latency} ms`,                  warn2: plc2Latency > 10 },
    { label: 'LATENCY (AVG)',   val1: `${(plc1Latency * 1.15).toFixed(1)} ms`, val2: `${(plc2Latency * 0.95).toFixed(1)} ms`, warn2: true },
    { label: 'LATENCY (MAX)',   val1: '8 ms',                              val2: '72 ms',                              warn2: true },
    { label: 'PACKET LOSS',     val1: '0.0%',                              val2: '0.8%',                               warn2: true },
    { label: 'THROUGHPUT',      val1: '1.2 MB/s',                          val2: '0.9 MB/s',                           warn2: false },
    { label: 'UPTIME',          val1: '99.98%',                            val2: '99.71%',                             warn2: false },
    { label: 'MSG/SEC (MQTT)',  val1: `${mqttMsgPerSec.toFixed(1)}`,       val2: '—',                                  warn2: false },
  ]

  return (
    <div className="border-t border-scada-border pt-3">
      {/* Column headers */}
      <div className="grid grid-cols-3 gap-2 mb-2 pb-1 border-b border-scada-border">
        <span className="text-text-muted text-[10px] font-mono uppercase"></span>
        <span className="text-accent-primary text-[10px] font-mono uppercase text-right">PLC LINE-1</span>
        <span className="text-accent-gold    text-[10px] font-mono uppercase text-right">PLC LINE-2</span>
      </div>
      {rows.map(row => (
        <div key={row.label} className="grid grid-cols-3 gap-2 py-0.5">
          <span className="text-text-muted text-[10px] font-mono uppercase">{row.label}</span>
          <span className="value-display text-text-primary text-xs text-right">{row.val1}</span>
          <span className={`value-display text-xs text-right ${row.warn2 ? 'text-status-warning' : 'text-text-primary'}`}>
            {row.val2}
          </span>
        </div>
      ))}
    </div>
  )
}

