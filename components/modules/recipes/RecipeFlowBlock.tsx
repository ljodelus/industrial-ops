'use client'

// Client component — renders a single step block in the horizontal flow visualization

import { Tooltip } from '@/components/ui'
import type { StepDraft } from '@/types'

interface RecipeFlowBlockProps {
  step:     StepDraft
  index:    number
  hasError: boolean
  isLast:   boolean
}

function formatSeconds(s: number): string {
  const m   = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function RecipeFlowBlock({ step, index, hasError, isLast }: RecipeFlowBlockProps) {
  const tooltipContent =
    `${step.tankName || `Step ${index + 1}`} | Min: ${formatSeconds(step.minTime)} | Pref: ${formatSeconds(step.preferredTime)} | Max: ${formatSeconds(step.maxTime)}`

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <Tooltip content={tooltipContent} position="bottom">
        <div
          className={`flex flex-col items-center gap-0.5 px-3 py-2 bg-scada-panel rounded-scada border min-w-[80px] cursor-default
            ${hasError ? 'border-status-alarm' : 'border-scada-border'}`}
        >
          <div className="flex items-center gap-1">
            {hasError && (
              <span className="text-status-alarm text-[10px] leading-none">⚠</span>
            )}
            <span className="text-text-primary text-xs font-mono font-bold truncate max-w-[68px]">
              {step.tankName || `STEP ${index + 1}`}
            </span>
          </div>
          <span className="text-accent-primary text-[10px] font-mono">C{step.craneNumber}</span>
          <span className="text-text-muted text-[10px] font-mono">{formatSeconds(step.preferredTime)}</span>
        </div>
      </Tooltip>
      {!isLast && (
        <span className="text-text-muted text-xs select-none">→</span>
      )}
    </div>
  )
}

