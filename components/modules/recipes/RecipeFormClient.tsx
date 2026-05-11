'use client'

// Client component — coordinates the full recipe create/edit form:
// basic info form, live preview, step builder, save/cancel logic, role guard, Redux dispatch

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addRecipe, updateRecipe, selectRecipeById } from '@/store/slices/recipesSlice'
import { selectUserRole, selectCurrentUser } from '@/store/slices/authSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { useZodForm } from '@/lib/hooks/useZodForm'
import { recipeFormBaseSchema, recipeStepSchema } from '@/types/schemas'
import type { RecipeFormBaseValues } from '@/types/schemas'
import type { Recipe, StepDraft, ValidationError } from '@/types'
import { Badge, Button, Modal } from '@/components/ui'
import { Save, Check } from '@/lib/icons'
import { RecipeInfoForm } from './RecipeInfoForm'
import { RecipeStepPreview } from './RecipeStepPreview'
import { RecipeStepBuilder } from './RecipeStepBuilder'

interface RecipeFormClientProps {
  recipeId?: string // defined in edit mode
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeStep(overrides?: Partial<StepDraft>): StepDraft {
  return {
    id:            overrides?.id ?? `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tankNumber:    overrides?.tankNumber    ?? 1,
    tankName:      overrides?.tankName      ?? 'LOAD',
    craneNumber:   overrides?.craneNumber   ?? 1,
    minTime:       overrides?.minTime       ?? 0,
    preferredTime: overrides?.preferredTime ?? 0,
    maxTime:       overrides?.maxTime       ?? 0,
    notes:         overrides?.notes         ?? 'Load station',
  }
}

function stepHasData(step: StepDraft): boolean {
  return (
    step.tankName.trim().length > 0 ||
    step.notes.trim().length > 0   ||
    step.minTime > 0               ||
    step.preferredTime > 0
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RecipeFormClient({ recipeId }: RecipeFormClientProps) {
  const router          = useRouter()
  const dispatch        = useAppDispatch()
  const userRole        = useAppSelector(selectUserRole)
  const currentUser     = useAppSelector(selectCurrentUser)
  const existingRecipe  = useAppSelector(selectRecipeById(recipeId ?? ''))
  const isEditMode      = Boolean(recipeId)

  // ── Role guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userRole !== null && userRole !== 'engineer' && userRole !== 'admin') {
      router.push('/recipes')
    }
  }, [userRole, router])

  // ── Recipe not-found guard (edit mode) ────────────────────────────────────
  useEffect(() => {
    if (isEditMode && userRole !== null && existingRecipe === null) {
      dispatch(pushNotification({
        id:      `notif-${Date.now()}`,
        type:    'error',
        message: 'Recipe not found.',
      }))
      router.push('/recipes')
    }
  }, [isEditMode, existingRecipe, userRole, dispatch, router])

  // ── Basic info form ────────────────────────────────────────────────────────
  const basicForm = useZodForm(recipeFormBaseSchema, {
    defaultValues: {
      name:        '',
      line:        'LINE-1',
      description: '',
      versionNote: '',
    },
  })

  const {
    formState: { errors: formErrors, isDirty: formIsDirty },
    handleSubmit,
    reset,
    watch,
    setError: setFormError,
  } = basicForm

  const watchedName = watch('name')
  const watchedLine = watch('line')

  // ── Steps state ────────────────────────────────────────────────────────────
  const [steps,        setSteps]        = useState<StepDraft[]>([makeStep()])
  const [stepsChanged, setStepsChanged] = useState(false)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isDraft,            setIsDraft]            = useState(false)
  const [isSaving,           setIsSaving]           = useState(false)
  const [submitAttempted,    setSubmitAttempted]    = useState(false)
  const [stepErrors,         setStepErrors]         = useState<Record<number, Record<string, string>>>({})
  const [showCancelConfirm,  setShowCancelConfirm]  = useState(false)
  const [showClearConfirm,   setShowClearConfirm]   = useState(false)
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null)

  const isDirty = formIsDirty || stepsChanged

  // ── Populate form in edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && existingRecipe) {
      reset({
        name:        existingRecipe.name,
        line:        existingRecipe.line as 'LINE-1' | 'LINE-2',
        description: '',
        versionNote: '',
      })
      setSteps(
        existingRecipe.steps.map((s, i) =>
          makeStep({
            id:            `step-existing-${i}`,
            tankNumber:    s.tankNumber,
            tankName:      s.tankName,
            craneNumber:   s.craneNumber,
            minTime:       s.minTime,
            preferredTime: s.preferredTime,
            maxTime:       s.maxTime,
            notes:         s.notes ?? '',
          })
        )
      )
    }
  }, [isEditMode, existingRecipe, reset])

  // ── Re-validate steps live when submit was attempted ───────────────────────
  useEffect(() => {
    if (submitAttempted) runValidateSteps(steps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, submitAttempted])

  // ── Step validation ────────────────────────────────────────────────────────
  const runValidateSteps = useCallback((currentSteps: StepDraft[]): boolean => {
    const errs: Record<number, Record<string, string>> = {}
    currentSteps.forEach((step, i) => {
      const result = recipeStepSchema.safeParse({
        tankNumber:    step.tankNumber,
        tankName:      step.tankName,
        craneNumber:   step.craneNumber,
        minTime:       step.minTime,
        preferredTime: step.preferredTime,
        maxTime:       step.maxTime,
        notes:         step.notes || undefined,
      })
      if (!result.success) {
        errs[i] = {}
        result.error.issues.forEach(issue => {
          const field = issue.path[0] as string
          if (field && !errs[i][field]) {
            errs[i][field] = issue.message
          }
        })
      }
    })
    setStepErrors(errs)
    return Object.keys(errs).length === 0
  }, [])

  // ── Step handlers ─────────────────────────────────────────────────────────

  const confirmDeleteStep = useCallback((index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index))
    setStepsChanged(true)
    setDeleteConfirmIndex(null)
  }, [])

  const handleStepChange = useCallback((index: number, updates: Partial<StepDraft>) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s))
    setStepsChanged(true)
  }, [])

  const handleAddStep = useCallback(() => {
    setSteps(prev => [
      ...prev,
      makeStep({ tankNumber: prev.length + 1, tankName: '', notes: '' }),
    ])
    setStepsChanged(true)
    setTimeout(() => {
      document.getElementById(`step-row-${steps.length}`)?.scrollIntoView({
        behavior: 'smooth',
        block:    'center',
      })
    }, 80)
  }, [steps.length])

  const handleDeleteStep = useCallback((index: number) => {
    if (steps.length === 1) {
      // Replace with fresh empty row rather than deleting the only row
      setSteps([makeStep({ tankName: '', notes: '' })])
      setStepsChanged(true)
      return
    }
    const step = steps[index]
    if (stepHasData(step)) {
      setDeleteConfirmIndex(index)
    } else {
      confirmDeleteStep(index)
    }
  }, [steps, confirmDeleteStep])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setSteps(prev => {
      const next      = [...prev]
      const [removed] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, removed)
      return next
    })
    setStepsChanged(true)
  }, [])

  const handleAutoNumber = useCallback(() => {
    setSteps(prev => prev.map((s, i) => ({ ...s, tankNumber: i + 1 })))
    setStepsChanged(true)
  }, [])

  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true)
  }, [])

  const confirmClearAll = useCallback(() => {
    setSteps([makeStep()])
    setStepsChanged(true)
    setShowClearConfirm(false)
  }, [])

  // ── Save Draft ────────────────────────────────────────────────────────────
  const handleSaveDraft = () => {
    const name = watch('name')
    if (!name?.trim()) {
      setFormError('name', { message: 'Recipe name is required to save draft' })
      return
    }
    setIsDraft(true)
    dispatch(pushNotification({
      id:      `draft-${Date.now()}`,
      type:    'warning',
      message: 'Draft saved locally (not committed to store)',
    }))
  }

  // ── Save Recipe ───────────────────────────────────────────────────────────
  const handleSaveRecipe = () => {
    setSubmitAttempted(true)
    const stepsValid = runValidateSteps(steps)

    // Cast needed: @hookform/resolvers v5 + zod v4 SubmitHandler generic mismatch
    const onValid = (async (data: RecipeFormBaseValues) => {
      // Re-check step validity after form validation passed
      if (!stepsValid || !runValidateSteps(steps)) {
        const firstError = document.querySelector('[data-step-error]')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }

      setIsSaving(true)

      const recipeSteps = steps.map(s => ({
        tankNumber:    s.tankNumber,
        tankName:      s.tankName,
        craneNumber:   s.craneNumber,
        minTime:       s.minTime,
        preferredTime: s.preferredTime,
        maxTime:       s.maxTime,
        notes:         s.notes || undefined,
      }))

      // Simulate async delay (800 ms)
      await new Promise<void>(res => setTimeout(res, 800))

      if (isEditMode && existingRecipe) {
        dispatch(updateRecipe({
          ...existingRecipe,
          name:      data.name,
          line:      data.line,
          steps:     recipeSteps,
          updatedBy: currentUser?.name ?? 'Unknown',
          updatedAt: new Date().toISOString(),
          versionHistory: [
            {
              version: existingRecipe.version + 1,
              date:    new Date().toISOString(),
              author:  currentUser?.name ?? 'Unknown',
              note:    data.versionNote ?? '',
            },
            ...(existingRecipe.versionHistory ?? []),
          ],
        }))
        dispatch(pushNotification({
          id:      `notif-${Date.now()}`,
          type:    'success',
          message: `Recipe saved — v${existingRecipe.version + 1}`,
        }))
      } else {
        const newRecipe: Recipe = {
          id:        `recipe-${Date.now()}`,
          name:      data.name,
          line:      data.line,
          version:   1,
          steps:     recipeSteps,
          updatedBy: currentUser?.name ?? 'Unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versionHistory: [
            {
              version: 1,
              date:    new Date().toISOString(),
              author:  currentUser?.name ?? 'Unknown',
              note:    'Initial recipe',
            },
          ],
        }
        dispatch(addRecipe(newRecipe))
        dispatch(pushNotification({
          id:      `notif-${Date.now()}`,
          type:    'success',
          message: 'Recipe saved successfully',
        }))
      }

      setIsSaving(false)
      router.push('/recipes')
    // Cast: resolves @hookform/resolvers v5 + zod v4 SubmitHandler generic mismatch
    }) as Parameters<typeof handleSubmit>[0]
    handleSubmit(onValid)()
  }

  // ── Cancel logic ──────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true)
    } else {
      router.push('/recipes')
    }
  }

  // ── Build validation error list for preview panel ─────────────────────────
  const validationErrors: ValidationError[] = submitAttempted
    ? [
        ...Object.entries(formErrors).map(([field, err]) => {
          const labels: Record<string, string> = {
            name:        'Recipe name',
            line:        'Production line',
            description: 'Description',
            versionNote: 'Version note',
          }
          return {
            message:  `${labels[field] ?? field}: ${(err as { message?: string })?.message ?? 'Invalid'}`,
            scrollTo: `field-${field}`,
          }
        }),
        ...Object.entries(stepErrors).flatMap(([stepIdx, errs]) =>
          Object.entries(errs).map(([, msg]) => ({
            message:  `Step ${Number(stepIdx) + 1}: ${msg}`,
            scrollTo: `step-row-${stepIdx}`,
          }))
        ),
      ]
    : []

  // ── Render ────────────────────────────────────────────────────────────────
  const pageTitle      = isEditMode ? `EDIT — ${existingRecipe?.name ?? '…'}` : 'CREATE NEW RECIPE'
  const breadcrumbSub  = isEditMode ? `${existingRecipe?.name ?? '…'} / Edit` : 'Create New Recipe'

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-1 text-text-muted text-xs font-mono">
            <Link href="/recipes" className="hover:text-accent-primary transition-colors">
              Recipes
            </Link>
            <span>/</span>
            <span>{breadcrumbSub}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-mono uppercase text-text-value text-xl tracking-wide">
              {pageTitle}
            </h1>
            {isDirty && !isDraft && (
              <Badge variant="warning" label="UNSAVED" />
            )}
            {isDraft && (
              <Badge variant="warning" label="DRAFT" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Save size={14} />}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Check size={14} />}
            loading={isSaving}
            onClick={handleSaveRecipe}
          >
            Save Recipe
          </Button>
        </div>
      </div>

      {/* ── Main panels (55 / 45 split) ────────────────────────────────────── */}
      <div className="grid grid-cols-[55fr_45fr] gap-6">
        <RecipeInfoForm
          form={basicForm}
          isEditMode={isEditMode}
        />
        <RecipeStepPreview
          steps={steps}
          recipeName={watchedName}
          line={watchedLine}
          stepErrors={stepErrors}
          validationErrors={validationErrors}
        />
      </div>

      {/* ── Step Builder ───────────────────────────────────────────────────── */}
      <RecipeStepBuilder
        steps={steps}
        stepErrors={stepErrors}
        userRole={userRole}
        onStepChange={handleStepChange}
        onAddStep={handleAddStep}
        onDeleteStep={handleDeleteStep}
        onReorder={handleReorder}
        onAutoNumber={handleAutoNumber}
        onClearAll={handleClearAll}
      />

      {/* ── Cancel confirmation modal ──────────────────────────────────────── */}
      <Modal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="UNSAVED CHANGES"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)}>
              Stay
            </Button>
            <Button variant="danger" size="sm" onClick={() => router.push('/recipes')}>
              Leave anyway
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm font-mono">
          You have unsaved changes. If you leave now, your changes will be lost.
        </p>
      </Modal>

      {/* ── Clear all steps modal ─────────────────────────────────────────── */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="CLEAR ALL STEPS"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmClearAll}>
              Clear all
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm font-mono">
          This will remove all steps and reset to a single empty row. This cannot be undone.
        </p>
      </Modal>

      {/* ── Delete step confirmation modal ────────────────────────────────── */}
      <Modal
        open={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        title="DELETE STEP"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmIndex(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteConfirmIndex !== null && confirmDeleteStep(deleteConfirmIndex)}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm font-mono">
          Delete step {deleteConfirmIndex !== null ? deleteConfirmIndex + 1 : ''}?
          This action cannot be undone.
        </p>
      </Modal>

    </div>
  )
}

