// Server component — purely presentational, no hooks needed

import type { RecipeStep } from '@/types'

interface RecipeStepsTableProps {
  steps: RecipeStep[]
}

function formatMmSs(seconds: number): string {
  if (seconds === 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function RecipeStepsTable({ steps }: RecipeStepsTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-scada-panel border-b border-scada-border">
            <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-16">
              Step
            </th>
            <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-16">
              Tank #
            </th>
            <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wider">
              Tank Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-20">
              Crane
            </th>
            <th className="px-4 py-2 text-right text-xs font-mono text-text-muted uppercase tracking-wider w-24">
              Min Time
            </th>
            <th className="px-4 py-2 text-right text-xs font-mono text-text-muted uppercase tracking-wider w-24">
              Pref Time
            </th>
            <th className="px-4 py-2 text-right text-xs font-mono text-text-muted uppercase tracking-wider w-24">
              Max Time
            </th>
            <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => (
            <tr
              key={i}
              className={`border-b border-scada-border transition-colors hover:bg-scada-panel
                ${i % 2 === 0 ? 'bg-scada-bg' : 'bg-scada-surface'}`}
            >
              <td className="px-4 py-3 text-xs font-mono text-accent-gold font-semibold">
                {i + 1}
              </td>
              <td className="px-4 py-3 text-xs font-mono text-text-muted">
                T{step.tankNumber}
              </td>
              <td className="px-4 py-3 text-xs text-text-primary uppercase font-mono">
                {step.tankName}
              </td>
              <td className="px-4 py-3 text-xs font-mono text-accent-primary">
                C{step.craneNumber}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="value-display text-xs text-text-muted">
                  {formatMmSs(step.minTime)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="value-display text-xs text-text-value font-semibold">
                  {formatMmSs(step.preferredTime)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="value-display text-xs text-text-muted">
                  {formatMmSs(step.maxTime)}
                </span>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-text-muted italic">
                {step.notes ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

