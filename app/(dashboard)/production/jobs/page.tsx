import type { Metadata } from 'next'
import { JobQueueClient } from '@/components/modules/jobs'

export const metadata: Metadata = {
  title: 'Job Queue — Industrial Ops UI',
}

export default function JobQueuePage() {
  return <JobQueueClient />
}
