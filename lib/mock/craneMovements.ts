import type { CraneMovementRecord } from '@/types'

export const mockCraneMovements: Record<string, CraneMovementRecord[]> = {
  'crane-1': [
    { id: 'mv-1-1', timestamp: '08:14:30', from: 2800, to: 3200, distance: 400,  durationSec: 2.4,  speedMpm: 10, jobId: 'JOB-001', result: 'success' },
    { id: 'mv-1-2', timestamp: '08:12:10', from: 4200, to: 2800, distance: 1400, durationSec: 7.0,  speedMpm: 12, jobId: 'JOB-001', result: 'success' },
    { id: 'mv-1-3', timestamp: '08:10:05', from: 800,  to: 4200, distance: 3400, durationSec: 17.0, speedMpm: 12, jobId: 'JOB-001', result: 'success' },
    { id: 'mv-1-4', timestamp: '08:08:30', from: 3200, to: 800,  distance: 2400, durationSec: 12.0, speedMpm: 12, jobId: 'JOB-001', result: 'success' },
    { id: 'mv-1-5', timestamp: '08:06:15', from: 400,  to: 3200, distance: 2800, durationSec: 14.0, speedMpm: 12, jobId: 'JOB-005', result: 'success' },
    { id: 'mv-1-6', timestamp: '08:04:00', from: 3600, to: 400,  distance: 3200, durationSec: 16.0, speedMpm: 12, jobId: 'JOB-005', result: 'success' },
    { id: 'mv-1-7', timestamp: '08:01:45', from: 800,  to: 3600, distance: 2800, durationSec: 14.0, speedMpm: 12, jobId: 'JOB-005', result: 'aborted' },
    { id: 'mv-1-8', timestamp: '07:58:30', from: 2400, to: 800,  distance: 1600, durationSec: 8.0,  speedMpm: 12, jobId: 'JOB-004', result: 'success' },
  ],
  'crane-2': [
    { id: 'mv-2-1', timestamp: '07:45:00', from: 1200, to: 800,  distance: 400,  durationSec: 2.4, speedMpm: 10, jobId: 'JOB-002', result: 'success' },
    { id: 'mv-2-2', timestamp: '07:40:30', from: 400,  to: 1200, distance: 800,  durationSec: 4.8, speedMpm: 10, jobId: 'JOB-002', result: 'success' },
    { id: 'mv-2-3', timestamp: '07:35:00', from: 800,  to: 400,  distance: 400,  durationSec: 2.4, speedMpm: 10, jobId: 'JOB-002', result: 'success' },
  ],
  'crane-3': [
    { id: 'mv-3-1', timestamp: '08:10:00', from: 5500, to: 6100, distance: 600,  durationSec: 3.6, speedMpm: 10, jobId: 'JOB-003', result: 'success' },
    { id: 'mv-3-2', timestamp: '08:05:00', from: 6800, to: 5500, distance: 1300, durationSec: 6.5, speedMpm: 12, jobId: 'JOB-003', result: 'success' },
    { id: 'mv-3-3', timestamp: '08:00:00', from: 5200, to: 6800, distance: 1600, durationSec: 8.0, speedMpm: 12, jobId: 'JOB-003', result: 'success' },
  ],
  'crane-4': [
    { id: 'mv-4-1', timestamp: '08:14:22', from: 2400, to: 4800, distance: 2400, durationSec: 0,   speedMpm: 0,  jobId: undefined, result: 'fault'   },
    { id: 'mv-4-2', timestamp: '08:00:00', from: 3200, to: 2400, distance: 800,  durationSec: 4.8, speedMpm: 10, jobId: undefined, result: 'success' },
    { id: 'mv-4-3', timestamp: '07:55:00', from: 2000, to: 3200, distance: 1200, durationSec: 6.0, speedMpm: 12, jobId: undefined, result: 'success' },
  ],
}

