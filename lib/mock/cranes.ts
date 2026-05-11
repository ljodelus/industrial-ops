import type { Crane } from '@/types'

export const mockCranes: Crane[] = [
  {
    id: 'crane-1',
    name: 'CRANE-1',
    status: 'moving',
    position: 3200,
    load: 450,
    currentJob: 'job-1',
    line: 'LINE-1',
    mode: 'auto',
  },
  {
    id: 'crane-2',
    name: 'CRANE-2',
    status: 'idle',
    position: 800,
    load: 0,
    line: 'LINE-1',
    mode: 'auto',
  },
  {
    id: 'crane-3',
    name: 'CRANE-3',
    status: 'loading',
    position: 6100,
    load: 380,
    currentJob: 'job-3',
    line: 'LINE-2',
    mode: 'auto',
  },
  {
    id: 'crane-4',
    name: 'CRANE-4',
    status: 'error',
    position: 2400,
    load: 0,
    line: 'LINE-2',
    mode: 'auto',
  },
]
