import type { Tank } from '@/types'

export const mockTanks: Tank[] = [
  // LINE-1 tanks
  { id: 'l1-tank-1', number: 1, name: 'LOAD',      occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  { id: 'l1-tank-2', number: 2, name: 'DEGREASE',  occupied: true,  dwellProgress: 65, currentPart: 'PART-0042', line: 'LINE-1' },
  { id: 'l1-tank-3', number: 3, name: 'RINSE 1',   occupied: true,  dwellProgress: 30, currentPart: 'PART-0039', line: 'LINE-1' },
  { id: 'l1-tank-4', number: 4, name: 'ZINC BATH', occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  { id: 'l1-tank-5', number: 5, name: 'RINSE 2',   occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  { id: 'l1-tank-6', number: 6, name: 'UNLOAD',    occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  // LINE-2 tanks
  { id: 'l2-tank-1', number: 1, name: 'LOAD',      occupied: true,  dwellProgress: 10, currentPart: 'PART-0051', line: 'LINE-2' },
  { id: 'l2-tank-2', number: 2, name: 'DEGREASE',  occupied: false, dwellProgress: 0,  line: 'LINE-2' },
  { id: 'l2-tank-3', number: 3, name: 'PHOSPHATE', occupied: true,  dwellProgress: 80, currentPart: 'PART-0048', line: 'LINE-2' },
  { id: 'l2-tank-4', number: 4, name: 'RINSE',     occupied: false, dwellProgress: 0,  line: 'LINE-2' },
  { id: 'l2-tank-5', number: 5, name: 'UNLOAD',    occupied: false, dwellProgress: 0,  line: 'LINE-2' },
]
