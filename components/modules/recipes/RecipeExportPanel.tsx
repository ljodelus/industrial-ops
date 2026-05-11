'use client'

// Client component — reads recipes from Redux, manages checkbox state, triggers file download

import { useState, useMemo } from 'react'
import { FileDown } from '@/lib/icons'
import { Badge, Button, Card } from '@/components/ui'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectAllRecipes } from '@/store/slices/recipesSlice'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { pushNotification } from '@/store/slices/uiSlice'

export function RecipeExportPanel() {
  const dispatch  = useAppDispatch()
  const recipes   = useAppSelector(selectAllRecipes)
  const user      = useAppSelector(selectCurrentUser)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(recipes.map(r => r.id))
  )

  const allSelected    = selectedIds.size === recipes.length
  const selectedCount  = selectedIds.size

  const estimatedKb = useMemo(() => {
    const totalSteps = recipes
      .filter(r => selectedIds.has(r.id))
      .reduce((sum, r) => sum + r.steps.length, 0)
    return (totalSteps * 0.3).toFixed(1)
  }, [recipes, selectedIds])

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(recipes.map(r => r.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleExport = () => {
    const selected   = recipes.filter(r => selectedIds.has(r.id))
    const now        = new Date()
    const payload    = {
      exportedAt: now.toISOString(),
      exportedBy: user?.name ?? 'Unknown',
      version:    '1.0',
      recipes:    selected,
    }
    const json     = JSON.stringify(payload, null, 2)
    const blob     = new Blob([json], { type: 'application/json' })
    const url      = URL.createObjectURL(blob)
    const dateStr  = now.toISOString().slice(0, 10)
    const a        = document.createElement('a')
    a.href         = url
    a.download     = `recipes_export_${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)

    dispatch(pushNotification({
      id:      `export-${Date.now()}`,
      type:    'success',
      message: `${selected.length} recipe${selected.length !== 1 ? 's' : ''} exported successfully`,
    }))
  }

  return (
    <Card title="EXPORT RECIPES" accent="primary">
      <div className="space-y-4">
        {/* Description */}
        <p className="text-text-muted text-sm">
          Export your current recipe library as a JSON file.
          You can export all recipes or select specific ones.
        </p>

        {/* Select All toggle */}
        <button
          className="text-accent-primary text-xs font-mono cursor-pointer hover:underline"
          onClick={toggleAll}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>

        {/* Recipe list */}
        <div className="space-y-1 border border-scada-border rounded-scada overflow-hidden">
          {recipes.map(recipe => {
            const checked = selectedIds.has(recipe.id)
            return (
              <div
                key={recipe.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-scada-panel cursor-pointer border-b border-scada-border last:border-b-0 transition-colors"
                onClick={() => toggleOne(recipe.id)}
              >
                {/* Custom checkbox */}
                <div
                  className={`w-4 h-4 rounded-scada border flex items-center justify-center shrink-0 transition-colors
                    ${checked
                      ? 'bg-accent-primary border-accent-primary'
                      : 'bg-scada-bg border-scada-border'}`}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <span className="text-text-primary text-sm font-mono flex-1">{recipe.name}</span>
                <Badge variant="gold" label={`v${recipe.version}`} />
                <span className="text-text-muted text-xs">{recipe.steps.length} steps</span>
                <span className="text-text-muted text-xs font-mono w-14 text-right">{recipe.line}</span>
              </div>
            )
          })}
        </div>

        {/* Export summary */}
        <div className="space-y-1 border-t border-scada-border pt-3">
          <div className="flex justify-between">
            <span className="text-text-muted text-xs font-mono">SELECTED</span>
            <span className="text-text-primary text-xs font-mono">{selectedCount} / {recipes.length} recipes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted text-xs font-mono">FILE SIZE</span>
            <span className="text-text-primary text-xs font-mono">~{estimatedKb} KB (estimated)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted text-xs font-mono">FORMAT</span>
            <span className="text-text-primary text-xs font-mono">JSON</span>
          </div>
        </div>

        {/* Export button */}
        <Button
          variant="primary"
          icon={<FileDown size={14} />}
          disabled={selectedCount === 0}
          onClick={handleExport}
          className="w-full justify-center"
        >
          Export Selected Recipes
        </Button>
      </div>
    </Card>
  )
}

