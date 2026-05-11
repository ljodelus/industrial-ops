'use client'

// Client component — manages drop zone, file type validation, conflict resolution selection

import { useState } from 'react'
import { Card } from '@/components/ui'
import { RecipeDropZone } from './RecipeDropZone'
import type { ConflictMode, ImportedRecipeFile } from '@/types'
import type { DropZoneState } from './RecipeDropZone'

type ImportParseStatus = 'idle' | 'parsing' | 'valid' | 'invalid'

interface RecipeImportPanelProps {
  conflictMode:    ConflictMode
  onConflictChange: (mode: ConflictMode) => void
  onParsing:       () => void
  onValid:         (file: ImportedRecipeFile, fileName: string, fileSize: string) => void
  onInvalid:       (errors: string[], fileName: string) => void
  onReset:         () => void
  parseStatus:     ImportParseStatus
  loadedFileName?: string
  loadedFileSize?: string
}

const CONFLICT_OPTIONS: { value: ConflictMode; label: string; description: string }[] = [
  { value: 'skip',    label: 'Skip existing recipes',    description: 'keep current versions' },
  { value: 'update',  label: 'Update existing recipes',  description: 'increment version' },
  { value: 'replace', label: 'Replace all',              description: 'overwrite entire library' },
]

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export function RecipeImportPanel({
  conflictMode,
  onConflictChange,
  onParsing,
  onValid,
  onInvalid,
  onReset,
  parseStatus,
  loadedFileName,
  loadedFileSize,
}: RecipeImportPanelProps) {
  const [dropZoneError, setDropZoneError] = useState<string | undefined>()

  const handleFile = (file: File) => {
    setDropZoneError(undefined)

    if (!file.name.endsWith('.json')) {
      setDropZoneError('Only .json files are accepted')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setDropZoneError('File exceeds the 5 MB limit')
      return
    }

    onParsing()

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string

      // Simulate 800ms parsing delay for realism
      setTimeout(() => {
        try {
          const parsed: unknown = JSON.parse(text)

          // Lazy import Zod schema to run validation
          import('@/types/schemas').then(({ importedRecipeFileSchema }) => {
            const result = importedRecipeFileSchema.safeParse(parsed)
            if (result.success) {
              // Cast — we know it matches the ImportedRecipeFile shape after Zod validation
              const data = result.data as ImportedRecipeFile
              onValid(data, file.name, formatBytes(file.size))
            } else {
              const errors = result.error.issues.map(issue => {
                const path = issue.path.join('.')
                return path ? `${path}: ${issue.message}` : issue.message
              })
              onInvalid(errors, file.name)
            }
          })
        } catch {
          onInvalid(['Invalid JSON: the file could not be parsed'], file.name)
        }
      }, 800)
    }
    reader.readAsText(file)
  }

  const handleRemove = () => {
    setDropZoneError(undefined)
    onReset()
  }

  const dropState: DropZoneState =
    parseStatus === 'valid' || parseStatus === 'parsing'
      ? 'loaded'
      : 'idle'

  return (
    <Card title="IMPORT RECIPES" accent="gold">
      <div className="space-y-4">
        {/* Description */}
        <p className="text-text-muted text-sm">
          Import recipes from a JSON file exported by this system.
          Recipes with matching names will be updated (version incremented).
          New recipes will be added to the library.
        </p>

        {/* Drop zone */}
        <RecipeDropZone
          onFile={handleFile}
          onRemove={handleRemove}
          state={dropState}
          fileName={loadedFileName}
          fileSize={loadedFileSize}
          error={dropZoneError}
        />

        {/* Conflict resolution — shown after file is loaded */}
        {(parseStatus === 'valid' || parseStatus === 'invalid' || parseStatus === 'parsing') && (
          <div className="space-y-2 border-t border-scada-border pt-3">
            <p className="text-text-muted text-xs font-mono uppercase tracking-wider">
              Conflict Behavior
            </p>
            {CONFLICT_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Radio */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                    ${conflictMode === opt.value
                      ? 'border-accent-primary'
                      : 'border-scada-border'}`}
                  onClick={() => onConflictChange(opt.value)}
                >
                  {conflictMode === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-accent-primary" />
                  )}
                </div>
                <div className="flex items-baseline gap-1" onClick={() => onConflictChange(opt.value)}>
                  <span className={`text-xs font-mono transition-colors
                    ${conflictMode === opt.value ? 'text-text-primary' : 'text-text-muted'}`}>
                    {opt.label}
                  </span>
                  <span className="text-text-muted text-xs">({opt.description})</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}


