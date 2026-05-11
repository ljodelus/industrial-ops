'use client'

// Client component — left panel: recipe name, production line, description, optional version note

import type { UseFormReturn } from 'react-hook-form'
import type { RecipeFormBaseValues } from '@/types/schemas'
import { Card, Input, Select } from '@/components/ui'

interface RecipeInfoFormProps {
  form:       UseFormReturn<RecipeFormBaseValues>
  isEditMode: boolean
}

const LINE_OPTIONS = [
  { value: 'LINE-1', label: 'LINE-1' },
  { value: 'LINE-2', label: 'LINE-2' },
]

export function RecipeInfoForm({ form, isEditMode }: RecipeInfoFormProps) {
  const { register, formState: { errors } } = form

  return (
    <Card title="RECIPE INFORMATION" accent="primary">
      <form noValidate className="flex flex-col gap-5">

        {/* Field 1 — Recipe Name */}
        <div id="field-name" className="flex flex-col gap-1">
          <Input
            label="RECIPE NAME"
            type="text"
            placeholder="e.g. ZINC STANDARD"
            register={register('name')}
            error={errors.name?.message}
          />
          <p className="text-text-muted text-xs font-mono">
            Uppercase alphanumeric only. Max 64 characters.
          </p>
        </div>

        {/* Field 2 — Production Line */}
        <div id="field-line">
          <Select
            label="PRODUCTION LINE"
            options={LINE_OPTIONS}
            register={register('line')}
            error={errors.line?.message}
          />
        </div>

        {/* Field 3 — Version Note (edit mode only) */}
        {isEditMode && (
          <div id="field-versionNote" className="flex flex-col gap-1">
            <Input
              label="VERSION NOTE"
              type="text"
              placeholder="Describe what changed in this version..."
              register={register('versionNote')}
              error={errors.versionNote?.message}
            />
            <p className="text-text-muted text-xs font-mono">
              Recommended — helps track what was changed between versions.
            </p>
          </div>
        )}

        {/* Field 4 — Description */}
        <div id="field-description">
          <Input
            label="DESCRIPTION"
            type="text"
            placeholder="Optional — describe the purpose of this recipe"
            register={register('description')}
            error={errors.description?.message}
          />
        </div>

      </form>
    </Card>
  )
}

