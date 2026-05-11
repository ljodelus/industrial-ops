'use client'

// Client component — displays right-panel live preview, summary stats, and validation summary

import { Card } from '@/components/ui'
import { AlertTriangle } from '@/lib/icons'
import type { StepDraft, ValidationError } from '@/types'
import { RecipeFlowBlock } from './RecipeFlowBlock'

interface RecipeStepPreviewProps {
  steps:            StepDraft[]
  recipeName:       string
  line:             string
  stepErrors:       Record<number, Record<string, string>>
  validationErrors: ValidationError[]
}

function formatMinutes(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60)
  const secs    = totalSec % 60
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function RecipeStepPreview({
  steps,
  recipeName,
  line,
  stepErrors,
  validationErrors,
}: RecipeStepPreviewProps) {
  const totalMinTime  = steps.reduce((s, step) => s + step.minTime,       0)
  const totalPrefTime = steps.reduce((s, step) => s + step.preferredTime, 0)
  const totalMaxTime  = steps.reduce((s, step) => s + step.maxTime,       0)

  return (
    <Card title="RECIPE PREVIEW" accent="gold" className="flex flex-col">
      {/* Recipe identity */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent-gold text-xs font-mono font-bold uppercase truncate">
          {recipeName || '—'}
        </span>
        {line && (
          <span className="text-text-muted text-[10px] font-mono">{line}</span>
        )}
      </div>

      {/* Step flow — horizontal scrollable */}
      {steps.length === 0 ? (
        <div className="text-text-muted text-xs font-mono py-4 text-center">
          No steps yet — add steps in the builder below.
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {steps.map((step, i) => (
              <RecipeFlowBlock
                key={step.id}
                step={step}
                index={i}
                hasError={Object.keys(stepErrors[i] ?? {}).length > 0}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-scada-border pt-4">
        {([
          ['TOTAL STEPS',     String(steps.length)],
          ['MIN TIME',        formatMinutes(totalMinTime)],
          ['PREF TIME',       formatMinutes(totalPrefTime)],
          ['MAX TIME',        formatMinutes(totalMaxTime)],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-text-muted text-[9px] font-mono uppercase tracking-wider">{label}</span>
            <span className="value-display text-text-value text-xs">{value}</span>
          </div>
        ))}
      </div>

      {/* Validation summary */}
      {validationErrors.length > 0 && (
        <div className="mt-4 border-t border-scada-border pt-4 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-status-alarm text-xs font-mono mb-1">
            <AlertTriangle size={12} className="text-status-alarm" />
            <span>{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''} found</span>
          </div>
          <ul className="flex flex-col gap-1">
            {validationErrors.map((err, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => scrollToId(err.scrollTo)}
                  className="text-status-alarm text-xs font-mono text-left hover:underline w-full"
                >
                  · {err.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

