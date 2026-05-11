'use client'

// Client component — orchestrates import/export page; handles role-based redirect,
// shared import state (parse status, parsed file, conflict mode)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import { RecipeExportPanel } from './RecipeExportPanel'
import { RecipeImportPanel } from './RecipeImportPanel'
import { RecipeImportPreview } from './RecipeImportPreview'
import type { ConflictMode, ImportedRecipeFile } from '@/types'

type ParseStatus = 'idle' | 'parsing' | 'valid' | 'invalid'

interface ImportState {
  status:    ParseStatus
  parsedFile?: ImportedRecipeFile
  errors?:     string[]
  fileName?:   string
  fileSize?:   string
}

const INITIAL_IMPORT: ImportState = { status: 'idle' }

export function RecipeImportExportClient() {
  const router = useRouter()
  const role   = useAppSelector(selectUserRole)

  // Role guard — redirect operator and supervisor to /recipes
  useEffect(() => {
    if (role && role !== 'engineer' && role !== 'admin') {
      router.replace('/recipes')
    }
  }, [role, router])

  const [conflictMode, setConflictMode] = useState<ConflictMode>('update')
  const [importState,  setImportState]  = useState<ImportState>(INITIAL_IMPORT)

  // Don't render content while role is unknown or for unauthorized roles
  if (!role || (role !== 'engineer' && role !== 'admin')) return null

  const handleParsing = () => {
    setImportState({ status: 'parsing' })
  }

  const handleValid = (file: ImportedRecipeFile, fileName: string, fileSize: string) => {
    setImportState({ status: 'valid', parsedFile: file, fileName, fileSize })
  }

  const handleInvalid = (errors: string[], fileName: string) => {
    setImportState({ status: 'invalid', errors, fileName })
  }

  const handleReset = () => {
    setImportState(INITIAL_IMPORT)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <nav className="flex items-center gap-1 text-xs font-mono text-text-muted">
          <Link href="/recipes" className="hover:text-text-primary transition-colors">
            Recipes
          </Link>
          <span>/</span>
          <span>Import / Export</span>
        </nav>
        <h1 className="text-text-value text-xl font-mono uppercase tracking-widest">
          Import / Export Recipes
        </h1>
        <p className="text-text-muted text-xs font-mono">
          Transfer recipe data in JSON format
        </p>
      </div>

      {/* Two-column panel row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecipeExportPanel />

        <RecipeImportPanel
          conflictMode={conflictMode}
          onConflictChange={setConflictMode}
          onParsing={handleParsing}
          onValid={handleValid}
          onInvalid={handleInvalid}
          onReset={handleReset}
          parseStatus={importState.status}
          loadedFileName={importState.fileName}
          loadedFileSize={importState.fileSize}
        />
      </div>

      {/* Bottom — preview / validation result */}
      <RecipeImportPreview
        status={importState.status}
        parsedFile={importState.parsedFile}
        errors={importState.errors}
        fileName={importState.fileName}
        conflictMode={conflictMode}
        onReset={handleReset}
      />
    </div>
  )
}

