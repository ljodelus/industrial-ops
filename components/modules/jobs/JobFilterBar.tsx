'use client'

// Client component — collapsible filter bar for the job queue

import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface JobFilterBarProps {
  open:           boolean
  statusFilter:   string
  lineFilter:     string
  recipeFilter:   string
  onStatusChange: (v: string) => void
  onLineChange:   (v: string) => void
  onRecipeChange: (v: string) => void
  onClear:        () => void
}

const STATUS_OPTIONS = [
  { value: '',            label: 'All Statuses'  },
  { value: 'pending',     label: 'Pending'       },
  { value: 'in_progress', label: 'In Progress'   },
  { value: 'failed',      label: 'Failed'        },
]

const LINE_OPTIONS = [
  { value: '',       label: 'All Lines' },
  { value: 'LINE-1', label: 'LINE-1'   },
  { value: 'LINE-2', label: 'LINE-2'   },
]

const RECIPE_OPTIONS = [
  { value: '',                label: 'All Recipes'      },
  { value: 'ZINC STANDARD',   label: 'ZINC STANDARD'    },
  { value: 'PHOSPHATE LIGHT', label: 'PHOSPHATE LIGHT'  },
  { value: 'HEAVY DEGREASING',label: 'HEAVY DEGREASING' },
]

export function JobFilterBar({
  open,
  statusFilter,
  lineFilter,
  recipeFilter,
  onStatusChange,
  onLineChange,
  onRecipeChange,
  onClear,
}: JobFilterBarProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        open ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="bg-scada-bg border-b border-scada-border px-4 py-3 flex items-end gap-3 flex-wrap">
        <Select
          label="Status"
          value={statusFilter}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          className="min-w-[140px]"
        />
        <Select
          label="Line"
          value={lineFilter}
          onChange={onLineChange}
          options={LINE_OPTIONS}
          className="min-w-[120px]"
        />
        <Select
          label="Recipe"
          value={recipeFilter}
          onChange={onRecipeChange}
          options={RECIPE_OPTIONS}
          className="min-w-[180px]"
        />
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    </div>
  )
}

