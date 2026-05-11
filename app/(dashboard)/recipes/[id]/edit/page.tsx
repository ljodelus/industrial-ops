import type { Metadata } from 'next'
import { RecipeFormClient } from '@/components/modules/recipes'
import { mockRecipes } from '@/lib/mock/recipes'

export function generateStaticParams() {
  return mockRecipes.map((recipe) => ({ id: recipe.id }))
}

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

