'use client'

// Client component — speed pill buttons (1× / 2× / 5× / 10×)

import type { SimSpeed } from '@/lib/simulation/engine'

interface SpeedControlProps {
  value:    SimSpeed
  onChange: (s: SimSpeed) => void
}

const SPEEDS: SimSpeed[] = [1, 2, 5, 10]

export function SpeedControl({ value, onChange }: SpeedControlProps) {
  const isHighSpeed = value >= 5

  return (
    <div className="space-y-2">
      <div className="text-text-muted text-[10px] font-mono uppercase tracking-wide">
        SIMULATION SPEED
      </div>

      <div className="flex items-center gap-2">
        {SPEEDS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`px-3 py-1.5 text-xs font-mono rounded-scada border transition-colors
              ${value === s
                ? 'bg-accent-primary text-scada-bg border-accent-primary'
                : 'bg-scada-panel text-text-muted border-scada-border hover:border-accent-primary hover:text-text-primary'
              }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {isHighSpeed && (
        <p className="text-status-warning text-[10px] font-mono">
          ⚠ High speed may cause visual artifacts
        </p>
      )}
    </div>
  )
}

