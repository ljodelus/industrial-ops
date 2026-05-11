'use client'

// Client component — reads selected recipe from Redux, shows detail, handles version history toggle

import { useAppSelector } from '@/store/hooks'
import { selectSelectedRecipe } from '@/store/slices/recipesSlice'
import { Badge }                from '@/components/ui/Badge'
import { Button }               from '@/components/ui/Button'
import { Card }                 from '@/components/ui/Card'
import { RecipeStepsTable }     from './RecipeStepsTable'
import { RecipeTimeBar }        from './RecipeTimeBar'
import { RecipeVersionHistory } from './RecipeVersionHistory'
import { Pencil, X }            from '@/lib/icons'

interface RecipeDetailPanelProps {
  canEdit: boolean
  onClose: () => void
  onEdit:  () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   '2-digit',
    year:  'numeric',
  })
}

function formatMinutes(totalSeconds: number): string {
  return `${Math.round(totalSeconds / 60)} min`
}

export function RecipeDetailPanel({ canEdit, onClose, onEdit }: RecipeDetailPanelProps) {
  const recipe = useAppSelector(selectSelectedRecipe)

  if (!recipe) return null

  const totalMin = recipe.steps.reduce((s, st) => s + st.minTime, 0)
  const totalMax = recipe.steps.reduce((s, st) => s + st.maxTime, 0)

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
      <Card
        accent="primary"
        noPadding
        action={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={onEdit}>
                Edit Recipe
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={onClose}>
              Close
            </Button>
          </div>
        }
        title={recipe.name}
      >
        <div className="divide-y divide-scada-border">

          {/* ── Header row ─────────────────────────────────────── */}
          <div className="px-4 py-3 flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-text-value text-base font-mono uppercase tracking-wide">
                  {recipe.name}
                </span>
                <Badge variant="gold" label={`v${recipe.version}`} />
                <Badge variant="ok" label="ACTIVE" />
              </div>
              <p className="text-text-muted text-xs font-mono mt-1">
                Last updated: {formatDate(recipe.updatedAt)} by {recipe.updatedBy}
              </p>
            </div>
          </div>

          {/* ── Summary stats ──────────────────────────────────── */}
          <div className="px-4 py-3 grid grid-cols-4 gap-4">
            {[
              { label: 'Steps',     value: String(recipe.steps.length) },
              { label: 'Total Min', value: formatMinutes(totalMin)      },
              { label: 'Total Max', value: formatMinutes(totalMax)      },
              { label: 'Line',      value: recipe.line                  },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-text-value text-sm font-mono value-display">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Steps table ────────────────────────────────────── */}
          <RecipeStepsTable steps={recipe.steps} />

          {/* ── Time bar ───────────────────────────────────────── */}
          <div className="px-4 py-4">
            <RecipeTimeBar steps={recipe.steps} />
          </div>

          {/* ── Version history ────────────────────────────────── */}
          {recipe.versionHistory && recipe.versionHistory.length > 0 && (
            <div className="px-4 py-4">
              <RecipeVersionHistory history={recipe.versionHistory} />
            </div>
          )}

        </div>
      </Card>
    </div>
  )
}

