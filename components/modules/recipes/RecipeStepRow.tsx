'use client'

// Client component — individual step row with inputs, drag handle, and delete button

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GripVertical, Trash2 } from '@/lib/icons'
import type { StepDraft } from '@/types'

interface RecipeStepRowProps {
  step:         StepDraft
  index:        number
  stepNumber:   number
  errors:       Record<string, string>
  isAlternate:  boolean
  isDragging:   boolean
  isDropTarget: boolean
  onChange:     (index: number, updates: Partial<StepDraft>) => void
  onDelete:     (index: number) => void
  onDragStart:  () => void
  onDragOver:   (e: React.DragEvent) => void
  onDrop:       () => void
  onDragEnd:    () => void
}

function parseNum(v: string): number {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

export function RecipeStepRow({
  step,
  index,
  stepNumber,
  errors,
  isAlternate,
  isDragging,
  isDropTarget,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: RecipeStepRowProps) {
  const hasError = Object.keys(errors).length > 0

  const rowBg = isDragging
    ? 'bg-scada-panel border border-accent-primary opacity-90'
    : isAlternate
    ? 'bg-scada-bg'
    : 'bg-scada-surface'

  const dropHighlight = isDropTarget && !isDragging
    ? 'border-t-2 border-t-accent-primary'
    : ''

  return (
    <div
      id={`step-row-${index}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      data-step-error={hasError ? 'true' : undefined}
      className={`flex items-start gap-2 px-3 py-2 rounded-scada cursor-grab active:cursor-grabbing
        border border-transparent
        ${rowBg}
        ${dropHighlight}
        ${hasError ? 'border-l-2 border-l-status-alarm' : ''}`}
    >
      {/* Drag handle */}
      <div className="flex items-center pt-2 text-text-muted shrink-0">
        <GripVertical size={14} className="text-text-muted" />
      </div>

      {/* Step number */}
      <div className="flex items-center pt-2 shrink-0 w-12">
        <span className="text-accent-gold font-mono text-xs font-bold uppercase">
          STEP {stepNumber}
        </span>
      </div>

      {/* Tank # */}
      <div className="w-15 shrink-0">
        <Input
          type="number"
          placeholder="1"
          value={step.tankNumber}
          error={errors['tankNumber']}
          onChange={(e) => onChange(index, { tankNumber: parseNum(e.target.value) })}
        />
      </div>

      {/* Tank Name */}
      <div className="w-30 shrink-0">
        <Input
          type="text"
          placeholder="e.g. DEGREASE"
          value={step.tankName}
          error={errors['tankName']}
          onChange={(e) => onChange(index, { tankName: e.target.value })}
        />
      </div>

      {/* Crane # */}
      <div className="w-15 shrink-0">
        <Input
          type="number"
          placeholder="1"
          value={step.craneNumber}
          error={errors['craneNumber']}
          onChange={(e) => onChange(index, { craneNumber: parseNum(e.target.value) })}
        />
      </div>

      {/* Min Time */}
      <div className="w-[74px] shrink-0">
        <Input
          type="number"
          placeholder="0"
          value={step.minTime}
          unit="s"
          error={errors['minTime']}
          onChange={(e) => onChange(index, { minTime: parseNum(e.target.value) })}
        />
      </div>

      {/* Pref Time */}
      <div className="w-[74px] shrink-0">
        <Input
          type="number"
          placeholder="0"
          value={step.preferredTime}
          unit="s"
          error={errors['preferredTime']}
          onChange={(e) => onChange(index, { preferredTime: parseNum(e.target.value) })}
        />
      </div>

      {/* Max Time */}
      <div className="w-[74px] shrink-0">
        <Input
          type="number"
          placeholder="0"
          value={step.maxTime}
          unit="s"
          error={errors['maxTime']}
          onChange={(e) => onChange(index, { maxTime: parseNum(e.target.value) })}
        />
      </div>

      {/* Notes */}
      <div className="flex-1 min-w-30">
        <Input
          type="text"
          placeholder="Optional"
          value={step.notes}
          onChange={(e) => onChange(index, { notes: e.target.value })}
        />
      </div>

      {/* Delete */}
      <div className="pt-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} className="text-status-alarm" />}
          onClick={() => onDelete(index)}
          className="px-2!"
        >
          {''}
        </Button>
      </div>
    </div>
  )
}
