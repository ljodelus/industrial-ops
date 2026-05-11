import type { Metadata } from 'next'
import { RecipeFormClient } from '@/components/modules/recipes'

export const metadata: Metadata = {
  title: 'Create New Recipe — Industrial Ops UI',
}

export default function CreateRecipePage() {
  return <RecipeFormClient />
}
