'use client'

// Client component — Section B alternate: compact table view of crane + tank state

import type { SimCrane, SimTank } from '@/lib/simulation/engine'
import { formatDwellRemaining } from '@/lib/simulation/engine'

interface SimulationTableViewProps {
  cranes: SimCrane[]
  tanks:  SimTank[]
}

export function SimulationTableView({ cranes, tanks }: SimulationTableViewProps) {
  return (
    <div className="space-y-6">

      {/* ── Crane State Table ───────────────────────────────── */}
      <div>
        <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide mb-2">
          CRANE STATE
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-scada-border text-text-muted text-[10px] uppercase tracking-wide">
                <th className="text-left py-2 pr-4">CRANE</th>
                <th className="text-left py-2 pr-4">POSITION</th>
                <th className="text-left py-2 pr-4">LOAD</th>
                <th className="text-left py-2 pr-4">STATUS</th>
                <th className="text-left py-2 pr-4">CURRENT STEP</th>
                <th className="text-left py-2">ENABLED</th>
              </tr>
            </thead>
            <tbody>
              {cranes.map(crane => {
                const statusColor =
                  crane.status === 'moving'  ? 'text-status-warning' :
                  crane.status === 'loading' ? 'text-accent-primary' :
                  crane.status === 'error'   ? 'text-status-alarm' :
                  crane.status === 'offline' ? 'text-status-offline' :
                  'text-status-idle'

                return (
                  <tr
                    key={crane.id}
                    className={`border-b border-scada-border/50 ${crane.faulted ? 'alarm-blink bg-status-alarm/5' : ''}`}
                  >
                    <td className="py-2 pr-4 text-text-primary font-medium">{crane.name}</td>
                    <td className="py-2 pr-4 value-display text-text-primary">
                      {crane.position.toLocaleString()} mm
                    </td>
                    <td className="py-2 pr-4 value-display text-text-primary">
                      {crane.load} kg
                    </td>
                    <td className={`py-2 pr-4 uppercase ${statusColor}`}>{crane.status}</td>
                    <td className="py-2 pr-4 text-accent-primary">{crane.currentStep}</td>
                    <td className="py-2">
                      <span className={`text-[10px] ${crane.enabled ? 'text-status-ok' : 'text-status-offline'}`}>
                        {crane.enabled ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Tank State Table ────────────────────────────────── */}
      <div>
        <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide mb-2">
          TANK STATE
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-scada-border text-text-muted text-[10px] uppercase tracking-wide">
                <th className="text-left py-2 pr-4">TANK</th>
                <th className="text-left py-2 pr-4">NAME</th>
                <th className="text-left py-2 pr-4">OCCUPIED</th>
                <th className="text-left py-2 pr-4">PART</th>
                <th className="text-left py-2 pr-4">DWELL REM.</th>
                <th className="text-left py-2 pr-4">STEP</th>
                <th className="text-left py-2">RECIPE</th>
              </tr>
            </thead>
            <tbody>
              {tanks.map(tank => {
                const remaining = tank.dwellMax > 0
                  ? formatDwellRemaining(tank.dwellElapsed, tank.dwellMax)
                  : '—'

                return (
                  <tr key={tank.id} className="border-b border-scada-border/50">
                    <td className="py-2 pr-4 text-text-primary font-medium">
                      T{tank.number}
                    </td>
                    <td className="py-2 pr-4 text-text-muted">{tank.name}</td>
                    <td className="py-2 pr-4">
                      <span className={tank.occupied ? 'text-status-warning' : 'text-status-idle'}>
                        {tank.occupied ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 value-display text-accent-primary">
                      {tank.currentPartId ?? '—'}
                    </td>
                    <td className="py-2 pr-4 value-display text-text-primary">
                      {tank.occupied ? remaining : '—'}
                    </td>
                    <td className="py-2 pr-4 text-text-muted">{tank.stepLabel}</td>
                    <td className="py-2 text-text-muted">{tank.recipeName}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

