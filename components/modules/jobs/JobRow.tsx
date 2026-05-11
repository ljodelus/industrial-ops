'use client'

// Client component — single draggable job row with action dropdown

import { useEffect, useRef, useState } from 'react'
import { Badge }  from '@/components/ui/Badge'
import {
  GripVertical,
  MoreHorizontal,
  Pencil,
  ArrowUp,
  ArrowDown,
  Play,
  Square,
} from '@/lib/icons'
import type { Job, JobStatus } from '@/types'

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info'

const STATUS_VARIANT: Record<JobStatus, BadgeVariant | 'gold'> = {
  pending:     'idle',
  in_progress: 'info',
  completed:   'ok',
  failed:      'alarm',
  cancelled:   'offline',
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  failed:      'Failed',
  cancelled:   'Cancelled',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function formatStepCount(steps: number): string {
  return `${steps} step${steps !== 1 ? 's' : ''}`
}

interface JobRowProps {
  job:            Job
  recipeSteps:    number
  isSelected:     boolean
  isDragOver:     boolean
  isFlashing:     boolean
  canManage:      boolean
  onSelect:       () => void
  onDragStart:    () => void
  onDragOver:     (e: React.DragEvent) => void
  onDrop:         () => void
  onMoveUp:       () => void
  onMoveDown:     () => void
  onAssignCrane:  () => void
  onCancel:       () => void
  onEditPriority: () => void
}

export function JobRow({
  job,
  recipeSteps,
  isSelected,
  isDragOver,
  isFlashing,
  canManage,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  onAssignCrane,
  onCancel,
  onEditPriority,
}: JobRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const isFailed     = job.status === 'failed'
  const isInProgress = job.status === 'in_progress'

  let rowBg = 'bg-scada-surface'
  if (isFlashing) rowBg = 'bg-accent-primary/10'
  else if (isSelected) rowBg = 'bg-scada-panel'
  else if (isDragOver) rowBg = 'bg-scada-panel'

  let leftBorder = 'border-l-2 border-l-transparent'
  if (isSelected) leftBorder = 'border-l-2 border-l-accent-primary'
  else if (isInProgress) leftBorder = 'border-l-2 border-l-accent-primary'
  else if (isFailed) leftBorder = 'border-l-2 border-l-status-alarm'

  const craneLabel = job.assignedCrane
    ? job.assignedCrane.replace('crane-', 'CRANE-').toUpperCase()
    : '—'

  return (
    <div
      draggable={canManage}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => {/* reset handled by parent */}}
      onClick={onSelect}
      className={`${rowBg} ${leftBorder} border-b border-scada-border cursor-pointer 
        hover:bg-scada-panel transition-all duration-150 select-none
        ${isDragOver ? 'opacity-70' : ''}`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Drag handle */}
        <span
          className={`flex-shrink-0 ${canManage ? 'cursor-grab text-text-muted' : 'text-transparent'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </span>

        {/* Priority */}
        <span className="text-accent-gold font-mono text-sm font-bold w-6 flex-shrink-0">
          #{job.priority}
        </span>

        {/* Recipe name */}
        <span className={`flex-1 text-sm font-medium ${isFailed ? 'text-text-muted' : 'text-text-primary'} truncate`}>
          {job.recipeName}
        </span>

        {/* Status badge */}
        <Badge
          variant={STATUS_VARIANT[job.status] as BadgeVariant}
          label={STATUS_LABEL[job.status]}
        />

        {/* Crane */}
        <span className="text-accent-primary font-mono text-xs w-16 text-right flex-shrink-0">
          {craneLabel}
        </span>

        {/* Action menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(v => !v)
            }}
            className="p-1 rounded-scada text-text-muted hover:text-text-primary hover:bg-scada-bg transition-colors"
            aria-label="Row actions"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-30 bg-scada-panel border border-scada-border rounded-scada py-1 min-w-[190px] shadow-lg">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEditPriority() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-scada-bg font-mono uppercase tracking-wide"
              >
                <Pencil size={14} className="text-text-muted" />
                Edit priority
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMoveUp() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-scada-bg font-mono uppercase tracking-wide"
              >
                <ArrowUp size={14} className="text-text-muted" />
                Move up
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMoveDown() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-scada-bg font-mono uppercase tracking-wide"
              >
                <ArrowDown size={14} className="text-text-muted" />
                Move down
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAssignCrane() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-scada-bg font-mono uppercase tracking-wide"
              >
                <Play size={14} className="text-text-muted" />
                Assign crane
              </button>
              {canManage && (
                <>
                  <div className="border-t border-scada-border my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onCancel() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-status-alarm hover:bg-scada-bg font-mono uppercase tracking-wide"
                  >
                    <Square size={14} />
                    Cancel job
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtitle row */}
      <div className="flex items-center gap-3 px-3 pb-2 pl-12">
        <span className="text-text-muted font-mono text-xs">{job.id.toUpperCase()}</span>
        <span className="text-text-muted text-xs">·</span>
        <span className="text-text-muted text-xs">{job.line}</span>
        <span className="text-text-muted text-xs">·</span>
        <span className="text-text-muted text-xs">
          {job.startedAt
            ? `Started ${formatTime(job.startedAt)}`
            : `Created ${formatTime(job.createdAt)}`}
        </span>
        <span className="text-text-muted text-xs">·</span>
        <span className="text-text-muted text-xs">{formatStepCount(recipeSteps)}</span>
      </div>
    </div>
  )
}

