'use client'

// Client component — full page container: search, filters, card grid, detail panel, delete confirm

import { useState, useCallback, useEffect } from 'react'
import { useRouter }            from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAllRecipes,
  selectSelectedRecipe,
  selectRecipe,
  deleteRecipe,
  duplicateRecipe,
} from '@/store/slices/recipesSlice'
import { selectUserRole }       from '@/store/slices/authSlice'
import type { Recipe }          from '@/types'
import { Button }               from '@/components/ui/Button'
import { Input }                from '@/components/ui/Input'
import { Select }               from '@/components/ui/Select'
import { Badge }                from '@/components/ui/Badge'
import { EmptyState }           from '@/components/ui/EmptyState'
import { Modal }                from '@/components/ui/Modal'
import { RecipeCard }           from './RecipeCard'
import { RecipeDetailPanel }    from './RecipeDetailPanel'
import {
  Search,
  Plus,
  Download,
  SlidersHorizontal,
  ClipboardList,
} from '@/lib/icons'

// ─── Filter helpers ────────────────────────────────────────────────────────────

function matchesStepsFilter(count: number, filter: string): boolean {
  if (filter === '2-4') return count >= 2 && count <= 4
  if (filter === '5-7') return count >= 5 && count <= 7
  if (filter === '8+')  return count >= 8
  return true
}

function matchesVersionFilter(version: number, filter: string): boolean {
  if (filter === 'v1')  return version === 1
  if (filter === 'v2')  return version === 2
  return filter !== 'v3+' || version >= 3
}

function filterRecipes(
  recipes:       Recipe[],
  search:        string,
  lineFilter:    string,
  stepsFilter:   string,
  versionFilter: string,
): Recipe[] {
  return recipes.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    if (lineFilter !== 'all' && r.line !== lineFilter)                   return false
    if (!matchesStepsFilter(r.steps.length, stepsFilter))                return false
    if (!matchesVersionFilter(r.version, versionFilter))                 return false
    return true
  })
}

// ─── Export JSON helper ────────────────────────────────────────────────────────

function exportAsJson(recipe: Recipe): void {
  const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${recipe.name.toLowerCase().replace(/[\s/]+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main component ────────────────────────────────────────────────────────────

export function RecipeList() {
  const dispatch        = useAppDispatch()
  const router          = useRouter()
  const recipes         = useAppSelector(selectAllRecipes)
  const selectedRecipe  = useAppSelector(selectSelectedRecipe)
  const role            = useAppSelector(selectUserRole)

  const canEdit  = role === 'engineer' || role === 'admin'
  const canAdmin = role === 'admin'

  // ── Local UI state ───────────────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('')
  const [filterOpen,     setFilterOpen]     = useState(false)
  const [lineFilter,     setLineFilter]     = useState('all')
  const [stepsFilter,    setStepsFilter]    = useState('any')
  const [versionFilter,  setVersionFilter]  = useState('any')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [flashId,        setFlashId]        = useState<string | null>(null)

  // Clear flash after 1.5 s
  useEffect(() => {
    if (!flashId) return
    const t = setTimeout(() => setFlashId(null), 1500)
    return () => clearTimeout(t)
  }, [flashId])

  const activeFilterCount = [
    lineFilter    !== 'all',
    stepsFilter   !== 'any',
    versionFilter !== 'any',
  ].filter(Boolean).length

  const filtered = filterRecipes(recipes, searchQuery, lineFilter, stepsFilter, versionFilter)

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelect = useCallback((id: string) => {
    dispatch(selectRecipe(selectedRecipe?.id === id ? null : id))
  }, [dispatch, selectedRecipe])

  const handleEdit = useCallback((id: string) => {
    router.push(`/recipes/${id}/edit`)
  }, [router])

  const handleDuplicate = useCallback((recipe: Recipe) => {
    const newId = `recipe-copy-${Date.now()}`
    dispatch(duplicateRecipe(recipe.id))
    setFlashId(newId)
  }, [dispatch])

  const handleExport = useCallback((recipe: Recipe) => {
    exportAsJson(recipe)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirmId) return
    if (selectedRecipe?.id === deleteConfirmId) dispatch(selectRecipe(null))
    dispatch(deleteRecipe(deleteConfirmId))
    setDeleteConfirmId(null)
  }, [dispatch, deleteConfirmId, selectedRecipe])

  const clearFilters = useCallback(() => {
    setLineFilter('all')
    setStepsFilter('any')
    setVersionFilter('any')
  }, [])

  const clearAll = useCallback(() => {
    setSearchQuery('')
    clearFilters()
  }, [clearFilters])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">

        {/* Left: title */}
        <div className="shrink-0">
          <h1 className="text-text-value text-xl font-mono uppercase tracking-wide">
            RECIPES
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Process recipe library
          </p>
        </div>

        {/* Center: search bar */}
        <div className="flex-1 flex justify-center">
          <Input
            type="search"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search size={14} />}
            className="w-80"
          />
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<SlidersHorizontal size={14} />}
            onClick={() => setFilterOpen(o => !o)}
          >
            Filter
            {activeFilterCount > 0 && (
              <Badge variant="info" label={String(activeFilterCount)} className="ml-1" />
            )}
          </Button>

          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => router.push('/recipes/import-export')}
            >
              Import/Export
            </Button>
          )}

          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => router.push('/recipes/create')}
            >
              New Recipe
            </Button>
          )}
        </div>
      </div>

      {/* ── FILTER ROW ───────────────────────────────────────────────────────── */}
      {filterOpen && (
        <div className="bg-scada-bg border border-scada-border rounded-scada px-4 py-3 flex items-center gap-3 flex-wrap">
          <Select
            value={lineFilter}
            onChange={setLineFilter}
            options={[
              { value: 'all',    label: 'All Lines' },
              { value: 'LINE-1', label: 'LINE-1'    },
              { value: 'LINE-2', label: 'LINE-2'    },
            ]}
            className="w-36"
          />
          <Select
            value={stepsFilter}
            onChange={setStepsFilter}
            options={[
              { value: 'any', label: 'Any Steps'  },
              { value: '2-4', label: '2–4 Steps'  },
              { value: '5-7', label: '5–7 Steps'  },
              { value: '8+',  label: '8+ Steps'   },
            ]}
            className="w-36"
          />
          <Select
            value={versionFilter}
            onChange={setVersionFilter}
            options={[
              { value: 'any', label: 'Any Version' },
              { value: 'v1',  label: 'v1'           },
              { value: 'v2',  label: 'v2'           },
              { value: 'v3+', label: 'v3+'          },
            ]}
            className="w-36"
          />
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      )}

      {/* ── RECIPE CARD GRID ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} className="text-text-muted" />}
          message="No recipes match your search."
          action={
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSelected={selectedRecipe?.id === recipe.id}
              isFlash={flashId === recipe.id}
              canEdit={canEdit}
              canAdmin={canAdmin}
              onSelect={() => handleSelect(recipe.id)}
              onEdit={() => handleEdit(recipe.id)}
              onDuplicate={() => handleDuplicate(recipe)}
              onExport={() => handleExport(recipe)}
              onDelete={() => setDeleteConfirmId(recipe.id)}
            />
          ))}
        </div>
      )}

      {/* ── RECIPE DETAIL PANEL ──────────────────────────────────────────────── */}
      <RecipeDetailPanel
        canEdit={canEdit}
        onClose={() => dispatch(selectRecipe(null))}
        onEdit={() => selectedRecipe && handleEdit(selectedRecipe.id)}
      />

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────────── */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Recipe"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm font-mono">
          Are you sure you want to permanently delete this recipe?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
