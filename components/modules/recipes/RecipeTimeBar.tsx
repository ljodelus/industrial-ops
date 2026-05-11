// Server component — CSS-based hover tooltips, no hooks needed

import type { RecipeStep } from '@/types'

interface RecipeTimeBarProps {
  steps: RecipeStep[]
}

function formatMmSs(seconds: number): string {
  if (seconds === 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function RecipeTimeBar({ steps }: RecipeTimeBarProps) {
  const totalPref = steps.reduce((sum, s) => sum + s.preferredTime, 0)

  // If all steps have 0 preferred time, show equal widths
  const effectiveTotal = totalPref > 0 ? totalPref : steps.length

  const maxPref = steps.reduce((m, s) => Math.max(m, s.preferredTime), 1)

  return (
    <div className="space-y-2">
      <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
        Time Distribution (preferred)
      </span>
      <div className="flex h-7 w-full rounded-scada overflow-hidden border border-scada-border">
        {steps.map((step, i) => {
          const widthPct =
            totalPref > 0
              ? (step.preferredTime / effectiveTotal) * 100
              : 100 / steps.length

          // Opacity: 0.2 for 0s steps, 0.4–1.0 for timed steps
          const opacity =
            step.preferredTime === 0
              ? 0.2
              : 0.35 + (step.preferredTime / maxPref) * 0.65

          return (
            <div
              key={i}
              className="group relative flex items-center justify-center overflow-visible border-r border-scada-bg/40 last:border-r-0"
              style={{ width: `${widthPct}%`, opacity }}
            >
              {/* Bar fill */}
              <div className="absolute inset-0 bg-accent-primary" />

              {/* Tank name label (only if wide enough) */}
              {widthPct > 8 && (
                <span className="relative z-10 text-scada-bg text-xs font-mono font-semibold truncate px-1 select-none">
                  {step.tankName}
                </span>
              )}

              {/* Hover tooltip (CSS-only, no useState) */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-mono text-text-primary bg-scada-panel border border-scada-border rounded-scada whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                {step.tankName} — {formatMmSs(step.preferredTime)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend labels */}
      <div className="flex w-full text-xs font-mono text-text-muted">
        {steps.map((step, i) => {
          const widthPct =
            totalPref > 0
              ? (step.preferredTime / effectiveTotal) * 100
              : 100 / steps.length
          return (
            <div
              key={i}
              className="overflow-hidden"
              style={{ width: `${widthPct}%` }}
            >
              {widthPct > 8 && (
                <span className="block truncate text-center text-xs">
                  {formatMmSs(step.preferredTime)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

