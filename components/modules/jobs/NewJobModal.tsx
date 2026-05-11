'use client'

// Client component — modal for creating a new production job

import { useEffect }        from 'react'
import { Modal }            from '@/components/ui/Modal'
import { Button }           from '@/components/ui/Button'
import { Input }            from '@/components/ui/Input'
import { Select }           from '@/components/ui/Select'
import { useZodForm }       from '@/lib/hooks/useZodForm'
import { jobSchema }        from '@/types/schemas'
import type { JobFormValues } from '@/types/schemas'
import type { Recipe }      from '@/types'

interface NewJobModalProps {
  open:            boolean
  onClose:         () => void
  recipes:         Recipe[]
  defaultPriority: number
  onSubmit:        (data: JobFormValues) => void
}

const LINE_OPTIONS = [
  { value: '',       label: 'Select line...' },
  { value: 'LINE-1', label: 'LINE-1'         },
  { value: 'LINE-2', label: 'LINE-2'         },
]

export function NewJobModal({
  open,
  onClose,
  recipes,
  defaultPriority,
  onSubmit,
}: NewJobModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm<JobFormValues>(jobSchema, {
    defaultValues: {
      recipeId: '',
      priority: defaultPriority,
      line:     '' as 'LINE-1' | 'LINE-2',
      notes:    '',
    },
  })

  // Reset form when modal opens with fresh default priority
  useEffect(() => {
    if (open) {
      reset({
        recipeId: '',
        priority: defaultPriority,
        line:     '' as 'LINE-1' | 'LINE-2',
        notes:    '',
      })
    }
  }, [open, defaultPriority, reset])

  const recipeOptions = [
    { value: '', label: 'Select recipe...' },
    ...recipes.map(r => ({ value: r.id, label: r.name })),
  ]

  const lineValue = watch('line')

  // Use a bound form handler to avoid SubmitHandler generic mismatch
  const boundSubmit = handleSubmit((data) => {
    onSubmit(data as unknown as JobFormValues)
    onClose()
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Job"
      accentColor="border-t-2 border-t-accent-primary"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            loading={isSubmitting}
            onClick={boundSubmit}
          >
            Create Job
          </Button>
        </>
      }
    >
      <form noValidate className="flex flex-col gap-4" onSubmit={boundSubmit}>
        {/* Recipe */}
        <Select
          label="Recipe"
          value={watch('recipeId')}
          onChange={(v) => setValue('recipeId', v, { shouldValidate: true })}
          options={recipeOptions}
          error={errors.recipeId?.message}
        />

        {/* Priority */}
        <Input
          label="Priority"
          type="number"
          register={register('priority', { valueAsNumber: true })}
          error={errors.priority?.message}
        />

        {/* Production Line */}
        <Select
          label="Production Line"
          value={lineValue}
          onChange={(v) => setValue('line', v as 'LINE-1' | 'LINE-2', { shouldValidate: true })}
          options={LINE_OPTIONS}
          error={errors.line?.message}
        />

        {/* Notes */}
        <Input
          label="Notes"
          type="text"
          placeholder="Optional notes for the operator"
          register={register('notes')}
          error={errors.notes?.message}
        />
      </form>
    </Modal>
  )
}




