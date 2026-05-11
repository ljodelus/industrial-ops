import { redirect } from 'next/navigation'

export default function RootPage() {
  // Static redirect — auth check happens in dashboard layout
  redirect('/overview')
}

