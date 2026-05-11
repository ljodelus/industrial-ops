'use client'

// Client component — uses useState for dropdown menu open/close state

import { useState, useRef, useEffect } from 'react'
import type { Recipe } from '@/types'
import { Badge }       from '@/components/ui/Badge'
import { Button }      from '@/components/ui/Button'
import {
  Pencil,
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
} from '@/lib/icons'

interface RecipeCardProps {
  recipe:      Recipe
  isSelected:  boolean
  isFlash:     boolean
  canEdit:     boolean
  canAdmin:    boolean
  onSelect:    () => void
  onEdit:      () => void
  onDuplicate: () => void
  onExport:    () => void
  onDelete:    () => void
}

const MAX_DOTS = 8

function buildStepPreview(recipe: Recipe): string {
  const names = recipe.steps.map(s => s.tankName.toUpperCase())
  if (names.length <= 5) return names.join(' → ')
  return [...names.slice(0, 3), '...', names[names.length - 1]].join(' → ')
}

function formatMinutes(totalSeconds: number): string {
  return `${Math.round(totalSeconds / 60)} min`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   '2-digit',
    year:  'numeric',
  })
}

export function RecipeCard({
  recipe,
  isSelected,
  isFlash,
  canEdit,
  canAdmin,
  onSelect,
  onEdit,
  onDuplicate,
  onExport,
  onDelete,
}: RecipeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef  = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const filledDots = Math.min(recipe.steps.length, MAX_DOTS)
  const emptyDots  = MAX_DOTS - filledDots

  const totalMin = recipe.steps.reduce((s, st) => s + st.minTime, 0)
  const totalMax = recipe.steps.reduce((s, st) => s + st.maxTime, 0)

  const stepPreview = buildStepPreview(recipe)

  return (
    <div
      onClick={onSelect}
      className={`
        relative flex flex-col bg-scada-surface border-t-2 border-t-accent-primary
        rounded-scada cursor-pointer transition-all duration-150
        ${isSelected
          ? 'border border-accent-primary bg-scada-panel'
          : 'border border-scada-border hover:border-accent-primary/60 hover:bg-scada-panel'
        }
        ${isFlash ? 'ring-2 ring-accent-primary/60' : ''}
      `}
    >
      {/* ── Card header ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-scada-border">
        <span className="text-text-value text-sm font-medium uppercase font-mono tracking-wide truncate">
          {recipe.name}
        </span>
        <Badge variant="gold" label={`v${recipe.version}`} />
      </div>

      {/* ── Card body ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 pt-3 pb-2">

        {/* Step count dots */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wider w-20 shrink-0">
            Steps:
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: filledDots }).map((_, i) => (
              <span key={`filled-${i}`} className="w-2 h-2 rounded-full bg-accent-primary block" />
            ))}
            {Array.from({ length: emptyDots }).map((_, i) => (
              <span key={`empty-${i}`} className="w-2 h-2 rounded-full bg-scada-border block" />
            ))}
          </div>
          <span className="text-text-muted text-xs font-mono ml-1">
            {recipe.steps.length} steps
          </span>
        </div>

        {/* Time summary */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono w-20 shrink-0">Min time:</span>
            <span className="value-display text-xs text-text-muted">{formatMinutes(totalMin)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono w-20 shrink-0">Max time:</span>
            <span className="value-display text-xs text-text-muted">{formatMinutes(totalMax)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono w-20 shrink-0">Line:</span>
            <span className="text-text-primary text-xs font-mono">{recipe.line}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono w-20 shrink-0">Updated:</span>
            <span className="text-text-muted text-xs font-mono">{formatDate(recipe.updatedAt)}</span>
          </div>
        </div>

        {/* Step preview */}
        <div className="flex flex-col gap-0.5 mt-1">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
            Step Preview:
          </span>
          <p className="text-text-muted text-xs font-mono truncate">
            {stepPreview}
          </p>
        </div>
      </div>

      {/* ── Card footer ────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-scada-border mt-auto">
        {/* Stop propagation wrapper — prevents card body click triggering select twice */}
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={onSelect}>
            View
          </Button>
        </div>

        {canEdit && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Pencil size={12} />}
              onClick={onEdit}
            >
              Edit
            </Button>
          </div>
        )}

        {/* More actions dropdown */}
        {canEdit && (
          <div ref={menuRef} className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              icon={<MoreHorizontal size={14} />}
              onClick={() => setMenuOpen(o => !o)}
            >
              {''}
            </Button>

            {menuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1 w-44 bg-scada-panel border border-scada-border rounded-scada z-30 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {canEdit && (
                  <button
                    onClick={() => { setMenuOpen(false); onDuplicate() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-text-muted hover:text-text-primary hover:bg-scada-surface transition-colors text-left uppercase tracking-wide"
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => { setMenuOpen(false); onExport() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-text-muted hover:text-text-primary hover:bg-scada-surface transition-colors text-left uppercase tracking-wide"
                  >
                    <Download size={12} />
                    Export JSON
                  </button>
                )}
                {canAdmin && (
                  <button
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-status-alarm hover:bg-status-alarm/10 transition-colors text-left uppercase tracking-wide"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



