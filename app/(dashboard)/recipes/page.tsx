import type { Metadata } from 'next'
import { RecipeList } from '@/components/modules/recipes'

export const metadata: Metadata = {
  title: 'Recipes — Industrial Ops UI',
}

export default function RecipesPage() {
  return <RecipeList />
}
