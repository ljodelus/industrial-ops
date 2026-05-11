'use client'

// Client component — shows parsing spinner, import preview table, or validation errors

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Upload } from '@/lib/icons'
import { Badge, Button, Card, Spinner, Table } from '@/components/ui'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectAllRecipes, addRecipe, updateRecipe, deleteRecipe } from '@/store/slices/recipesSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import type { ConflictMode, ImportedRecipeFile, Recipe, BadgeProps, Column } from '@/types'

interface RecipeImportPreviewProps {
  status:       'idle' | 'parsing' | 'valid' | 'invalid'
  parsedFile?:  ImportedRecipeFile
  errors?:      string[]
  fileName?:    string
  conflictMode: ConflictMode
  onReset:      () => void
}

interface PreviewRow {
  name:           string
  steps:          number
  fileVersion:    number
  currentVersion: number | null
  actionLabel:    string
  actionVariant:  BadgeProps['variant']
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function RecipeImportPreview({
  status,
  parsedFile,
  errors,
  fileName,
  conflictMode,
  onReset,
}: RecipeImportPreviewProps) {
  const router    = useRouter()
  const dispatch  = useAppDispatch()
  const recipes   = useAppSelector(selectAllRecipes)

  const [isImporting, setIsImporting] = useState(false)

  if (status === 'idle') return null

  // ── Parsing state ──────────────────────────────────────────────────────────
  if (status === 'parsing') {
    return (
      <Card title="ANALYZING FILE...">
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner size="md" />
          <span className="text-text-muted text-sm">Analyzing file...</span>
        </div>
      </Card>
    )
  }

  // ── Invalid state ──────────────────────────────────────────────────────────
  if (status === 'invalid') {
    return (
      <Card title="VALIDATION ERRORS" accent="alarm">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-status-alarm shrink-0 mt-0.5" />
            <p className="text-status-alarm text-sm font-mono font-medium">VALIDATION FAILED</p>
          </div>
          <p className="text-text-muted text-sm">
            The file could not be imported. Please fix the following errors:
          </p>
          <ul className="space-y-1 pl-4">
            {(errors ?? []).map((err, i) => (
              <li key={i} className="text-status-alarm text-xs font-mono">
                · {err}
              </li>
            ))}
          </ul>
          <p className="text-text-muted text-xs">
            Check that the file was exported from this system.
          </p>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Try Another File
          </Button>
        </div>
      </Card>
    )
  }

  // ── Valid state ────────────────────────────────────────────────────────────
  if (status === 'valid' && parsedFile) {
    const rows: PreviewRow[] = parsedFile.recipes.map(r => {
      const existing = recipes.find(x => x.name === r.name)

      let actionLabel:   string
      let actionVariant: BadgeProps['variant']

      if (!existing) {
        actionLabel   = 'ADD'
        actionVariant = 'info'
      } else if (conflictMode === 'skip') {
        actionLabel   = 'SKIP'
        actionVariant = 'idle'
      } else if (conflictMode === 'update') {
        actionLabel   = `UPDATE → v${existing.version + 1}`
        actionVariant = 'warning'
      } else {
        actionLabel   = 'REPLACE'
        actionVariant = 'alarm'
      }

      return {
        name:           r.name,
        steps:          r.steps.length,
        fileVersion:    r.version ?? 1,
        currentVersion: existing?.version ?? null,
        actionLabel,
        actionVariant,
      }
    })

    const columns: Column<PreviewRow>[] = [
      {
        key:    'name',
        header: 'RECIPE',
        render: row => <span className="font-mono text-xs text-text-primary">{row.name}</span>,
      },
      {
        key:    'steps',
        header: 'STEPS',
        render: row => <span className="text-text-muted text-xs">{row.steps} steps</span>,
      },
      {
        key:    'fileVersion',
        header: 'FILE VERSION',
        render: row => <Badge variant="gold" label={`v${row.fileVersion}`} />,
      },
      {
        key:    'currentVersion',
        header: 'CURRENT',
        render: row =>
          row.currentVersion !== null
            ? <Badge variant="gold" label={`v${row.currentVersion}`} />
            : <span className="text-text-muted text-xs font-mono">—</span>,
      },
      {
        key:    'actionLabel',
        header: 'ACTION',
        render: row => <Badge variant={row.actionVariant} label={row.actionLabel} />,
      },
    ]

    const handleImport = async () => {
      setIsImporting(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (conflictMode === 'replace') {
        // Delete all current recipes
        for (const r of recipes) {
          dispatch(deleteRecipe(r.id))
        }
        // Add all from imported file
        for (const imported of parsedFile.recipes) {
          const recipe: Recipe = {
            id:        `recipe-import-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name:      imported.name,
            version:   imported.version ?? 1,
            line:      imported.line ?? 'LINE-1',
            steps:     imported.steps,
            updatedBy: imported.updatedBy ?? 'Import',
            createdAt: imported.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          dispatch(addRecipe(recipe))
        }
      } else {
        for (const imported of parsedFile.recipes) {
          const existing = recipes.find(r => r.name === imported.name)

          if (conflictMode === 'skip' && existing) continue

          if (existing && conflictMode === 'update') {
            const recipe: Recipe = {
              ...existing,
              steps:     imported.steps,
              line:      imported.line ?? existing.line,
              updatedAt: new Date().toISOString(),
            }
            dispatch(updateRecipe(recipe))
          } else if (!existing) {
            const recipe: Recipe = {
              id:        `recipe-import-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              name:      imported.name,
              version:   imported.version ?? 1,
              line:      imported.line ?? 'LINE-1',
              steps:     imported.steps,
              updatedBy: imported.updatedBy ?? 'Import',
              createdAt: imported.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            dispatch(addRecipe(recipe))
          }
        }
      }

      const count = parsedFile.recipes.length
      dispatch(pushNotification({
        id:      `import-${Date.now()}`,
        type:    'success',
        message: `${count} recipe${count !== 1 ? 's' : ''} imported successfully`,
      }))

      router.push('/recipes')
    }

    const importCount = rows.filter(r => r.actionLabel !== 'SKIP').length

    return (
      <Card title="IMPORT PREVIEW" accent="ok">
        <div className="space-y-4">
          {/* File summary */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-b border-scada-border pb-4">
            <div className="flex justify-between col-span-2 sm:col-span-1">
              <span className="text-text-muted text-xs font-mono">FILE</span>
              <span className="text-text-primary text-xs font-mono">{fileName}</span>
            </div>
            <div className="flex justify-between col-span-2 sm:col-span-1">
              <span className="text-text-muted text-xs font-mono">EXPORTED BY</span>
              <span className="text-text-primary text-xs font-mono">{parsedFile.exportedBy}</span>
            </div>
            <div className="flex justify-between col-span-2 sm:col-span-1">
              <span className="text-text-muted text-xs font-mono">EXPORTED AT</span>
              <span className="text-text-primary text-xs font-mono">{formatDate(parsedFile.exportedAt)}</span>
            </div>
            <div className="flex justify-between col-span-2 sm:col-span-1">
              <span className="text-text-muted text-xs font-mono">RECIPES FOUND</span>
              <span className="text-text-primary text-xs font-mono">{parsedFile.recipes.length}</span>
            </div>
          </div>

          {/* Import analysis table */}
          <Table<PreviewRow>
            columns={columns}
            data={rows}
            keyExtractor={row => row.name}
          />

          {/* Import button */}
          <Button
            variant="primary"
            icon={<Upload size={14} />}
            onClick={handleImport}
            loading={isImporting}
            className="w-full justify-center"
          >
            Import {importCount} Recipe{importCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>
    )
  }

  return null
}

