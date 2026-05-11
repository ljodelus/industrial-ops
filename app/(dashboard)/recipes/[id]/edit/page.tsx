import type { Metadata } from 'next'
import { RecipeFormClient } from '@/components/modules/recipes'

export const metadata: Metadata = {
  title: 'Edit Recipe — Industrial Ops UI',
}

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  return <RecipeFormClient recipeId={id} />
}

