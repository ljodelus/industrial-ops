'use client'

import type { Crane } from '@/types'

interface CraneIndicatorProps {
  crane: Crane
  railLength: number
  className?: string
}

const statusFill: Record<string, string> = {
  ok:      '#4fc3f7',
  moving:  '#e8a23a',
  loading: '#e8a23a',
  error:   '#ef5350',
  offline: '#546e7a',
  idle:    '#1a1d2e',
}

const statusStroke: Record<string, string> = {
  ok:      '#4fc3f7',
  moving:  '#e8a23a',
  loading: '#e8a23a',
  error:   '#ef5350',
  offline: '#546e7a',
  idle:    '#1f2433',
}

export function CraneIndicator({ crane, railLength, className = '' }: CraneIndicatorProps) {
  const svgWidth = 600
  const svgHeight = 80
  const railY = 30
  const craneW = 72
  const craneH = 24
  const pct = Math.min(1, Math.max(0, crane.position / railLength))
  const craneX = pct * (svgWidth - craneW)

  const fill = statusFill[crane.status] ?? statusFill.idle
  const stroke = statusStroke[crane.status] ?? statusStroke.idle

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height={svgHeight}
        className="overflow-visible"
      >
        {/* Rail */}
        <line
          x1={0} y1={railY}
          x2={svgWidth} y2={railY}
          stroke="#1f2433"
          strokeWidth={2}
        />

        {/* Crane block */}
        <g
          style={{ transition: 'transform 1000ms ease-in-out' }}
          transform={`translate(${craneX}, 0)`}
        >
          <rect
            x={0} y={railY - craneH}
            width={craneW} height={craneH}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
            rx={2}
          />
          <text
            x={craneW / 2}
            y={railY - craneH / 2 + 4}
            textAnchor="middle"
            fill="#0d0f14"
            fontSize={9}
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
          >
            {crane.name}
          </text>

          {/* Hook line */}
          <line
            x1={craneW / 2} y1={railY}
            x2={craneW / 2} y2={railY + 16}
            stroke={stroke}
            strokeWidth={1.5}
          />
          {/* Hook symbol */}
          <text
            x={craneW / 2}
            y={railY + 26}
            textAnchor="middle"
            fill={stroke}
            fontSize={10}
            fontFamily="monospace"
          >
            ▼
          </text>
        </g>
      </svg>

      {/* Position label */}
      <div className="flex justify-between text-xs font-mono text-text-muted mt-1">
        <span>{crane.name}</span>
        <span className="value-display text-text-value">{crane.position.toLocaleString()} mm</span>
      </div>
    </div>
  )
}
