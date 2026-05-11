import type { Metadata } from 'next'
import { RecipeImportExportClient } from '@/components/modules/recipes'

export const metadata: Metadata = {
  title: 'Import / Export Recipes — Industrial Ops UI',
}

export default function RecipeImportExportPage() {
  return (
    <div className="p-6">
      <RecipeImportExportClient />
    </div>
  )
}
