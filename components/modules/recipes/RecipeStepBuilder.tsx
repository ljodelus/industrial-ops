'use client'

// Client component — full step builder with column headers, drag-to-reorder, add/delete/auto-number/clear actions

import { useState, useRef } from 'react'
import { Card, Button } from '@/components/ui'
import { Plus, ListOrdered, Trash2 } from '@/lib/icons'
import type { StepDraft, UserRole } from '@/types'
import { RecipeStepRow } from './RecipeStepRow'

interface RecipeStepBuilderProps {
  steps:         StepDraft[]
  stepErrors:    Record<number, Record<string, string>>
  userRole:      UserRole | null
  onStepChange:  (index: number, updates: Partial<StepDraft>) => void
  onAddStep:     () => void
  onDeleteStep:  (index: number) => void
  onReorder:     (fromIndex: number, toIndex: number) => void
  onAutoNumber:  () => void
  onClearAll:    () => void
}

const COL_HEADERS = [
  { label: '',         width: 'w-4'    },   // drag handle
  { label: 'STEP',    width: 'w-12'   },
  { label: 'TANK #',  width: 'w-[60px]' },
  { label: 'TANK NAME', width: 'w-[120px]' },
  { label: 'CRANE',   width: 'w-[60px]' },
  { label: 'MIN (s)', width: 'w-[74px]' },
  { label: 'PREF (s)', width: 'w-[74px]' },
  { label: 'MAX (s)', width: 'w-[74px]' },
  { label: 'NOTES',   width: 'flex-1'  },
  { label: 'DEL',     width: 'w-8'    },
]

export function RecipeStepBuilder({
  steps,
  stepErrors,
  userRole,
  onStepChange,
  onAddStep,
  onDeleteStep,
  onReorder,
  onAutoNumber,
  onClearAll,
}: RecipeStepBuilderProps) {
  const [draggedIndex,  setDraggedIndex]  = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const canClearAll = userRole === 'engineer' || userRole === 'admin'

  const handleAddStep = () => {
    onAddStep()
    // Scroll to the bottom of the step list after render
    setTimeout(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 80)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index)
    }
  }

  const handleDrop = (toIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorder(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }

  const cardAction = (
    <span className="text-text-muted text-xs font-mono">
      {steps.length} / 20 steps
    </span>
  )

  return (
    <Card title="RECIPE STEPS" accent="primary" action={cardAction} noPadding>
      {/* Column headers — sticky */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-1.5 bg-scada-panel border-b border-scada-border">
        {COL_HEADERS.map((col) => (
      <div key={col.label} className={`${col.width} shrink-0 text-text-muted text-[9px] uppercase tracking-wider font-mono`}>
            {col.label}
          </div>
        ))}
      </div>

      {/* Step rows */}
      <div ref={listRef} className="flex flex-col">
        {steps.map((step, i) => (
          <RecipeStepRow
            key={step.id}
            step={step}
            index={i}
            stepNumber={i + 1}
            errors={stepErrors[i] ?? {}}
            isAlternate={i % 2 === 1}
            isDragging={draggedIndex === i}
            isDropTarget={dropTargetIndex === i}
            onChange={onStepChange}
            onDelete={onDeleteStep}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Toolbar below step list */}
      <div className="flex items-center gap-3 px-3 py-3 border-t border-scada-border">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={handleAddStep}
          disabled={steps.length >= 20}
        >
          Add Step
        </Button>

        <Button
          variant="ghost"
          size="sm"
          icon={<ListOrdered size={14} />}
          onClick={onAutoNumber}
        >
          Auto-number tanks
        </Button>

        {canClearAll && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} className="text-status-alarm" />}
            onClick={onClearAll}
            className="ml-auto"
          >
            Clear All Steps
          </Button>
        )}
      </div>
    </Card>
  )
}

