import type { Recipe } from '@/types'

export const mockRecipes: Recipe[] = [
  {
    id:        'recipe-1',
    name:      'ZINC STANDARD',
    version:   3,
    line:      'LINE-1',
    updatedBy: 'Marc Dupont',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-04-02T09:30:00Z',
    steps: [
      { tankNumber: 1, tankName: 'LOAD',      craneNumber: 1, minTime:   0, preferredTime:   0, maxTime:   0, notes: 'Load station' },
      { tankNumber: 2, tankName: 'DEGREASE',  craneNumber: 1, minTime: 420, preferredTime: 480, maxTime: 540, notes: 'Alkaline degreasing' },
      { tankNumber: 3, tankName: 'RINSE 1',   craneNumber: 1, minTime:  60, preferredTime:  90, maxTime: 120 },
      { tankNumber: 4, tankName: 'ZINC BATH', craneNumber: 1, minTime: 600, preferredTime: 720, maxTime: 900, notes: 'Main zinc plating' },
      { tankNumber: 5, tankName: 'RINSE 2',   craneNumber: 1, minTime:  60, preferredTime:  90, maxTime:  90 },
      { tankNumber: 6, tankName: 'UNLOAD',    craneNumber: 1, minTime:   0, preferredTime:   0, maxTime:   0, notes: 'Unload station' },
    ],
    versionHistory: [
      { version: 3, date: '2026-04-02T09:30:00Z', author: 'Marc Dupont', note: 'Increased zinc bath max time to 15 min' },
      { version: 2, date: '2026-02-10T11:00:00Z', author: 'Marc Dupont', note: 'Added rinse step after degrease' },
      { version: 1, date: '2026-01-10T08:00:00Z', author: 'Admin User',  note: 'Initial recipe' },
    ],
  },
  {
    id:        'recipe-2',
    name:      'PHOSPHATE LIGHT',
    version:   1,
    line:      'LINE-2',
    updatedBy: 'Sarah Mills',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T14:00:00Z',
    steps: [
      { tankNumber: 1, tankName: 'LOAD',      craneNumber: 1, minTime:   0, preferredTime:   0, maxTime:   0, notes: 'Load station' },
      { tankNumber: 2, tankName: 'DEGREASE',  craneNumber: 1, minTime: 240, preferredTime: 300, maxTime: 360, notes: 'Mild degreasing cycle' },
      { tankNumber: 3, tankName: 'PHOSPHATE', craneNumber: 1, minTime: 360, preferredTime: 420, maxTime: 480, notes: 'Phosphate treatment bath' },
      { tankNumber: 4, tankName: 'RINSE',     craneNumber: 1, minTime: 180, preferredTime: 180, maxTime: 240 },
      { tankNumber: 5, tankName: 'UNLOAD',    craneNumber: 1, minTime:   0, preferredTime:   0, maxTime:   0, notes: 'Unload station' },
    ],
    versionHistory: [
      { version: 1, date: '2026-02-15T14:00:00Z', author: 'Sarah Mills', note: 'Initial recipe — phosphate light cycle' },
    ],
  },
  {
    id:        'recipe-3',
    name:      'HEAVY DEGREASING',
    version:   2,
    line:      'LINE-1',
    updatedBy: 'Marc Dupont',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-04-20T16:45:00Z',
    steps: [
      { tankNumber: 1, tankName: 'LOAD',       craneNumber: 1, minTime:   0, preferredTime:   0, maxTime:   0, notes: 'Load station' },
      { tankNumber: 2, tankName: 'PRE-CLEAN',  craneNumber: 1, minTime: 120, preferredTime: 180, maxTime: 240, notes: 'Pre-cleaning spray' },
      { tankNumber: 3, tankName: 'DEGREASE 1', craneNumber: 1, minTime: 300, preferredTime: 360, maxTime: 420, notes: 'First degreasing — alkaline' },
      { tankNumber: 4, tankName: 'DEGREASE 2', craneNumber: 1, minTime: 300, preferredTime: 360, maxTime: 360, notes: 'Second degreasing — ultrasonic' },
      { tankNumber: 5, tankName: 'RINSE',      craneNumber: 1, minTime: 240, preferredTime: 300, maxTime: 360, notes: 'Final rinse' },
      { tankNumber: 6, tankName: 'UNLOAD',     craneNumber: 1, minTime:   0, preferredTime:   0, maxTime:   0, notes: 'Unload station' },
    ],
    versionHistory: [
      { version: 2, date: '2026-04-20T16:45:00Z', author: 'Marc Dupont', note: 'Added ultrasonic second degrease step' },
      { version: 1, date: '2026-03-01T09:00:00Z', author: 'Marc Dupont', note: 'Initial recipe' },
    ],
  },
]
