import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Tank } from '@/types'
import { mockTanks } from '@/lib/mock/tanks'

interface TanksState {
  items:  Tank[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error:  string | null
}

const initialState: TanksState = {
  items:  mockTanks,
  status: 'succeeded',
  error:  null,
}

const tanksSlice = createSlice({
  name: 'tanks',
  initialState,
  reducers: {
    updateDwellProgress(state, action: PayloadAction<{ id: string; dwellProgress: number }>) {
      const tank = state.items.find(t => t.id === action.payload.id)
      if (tank) tank.dwellProgress = action.payload.dwellProgress
    },
    setOccupied(state, action: PayloadAction<{ id: string; occupied: boolean; currentPart?: string }>) {
      const tank = state.items.find(t => t.id === action.payload.id)
      if (tank) {
        tank.occupied = action.payload.occupied
        tank.currentPart = action.payload.currentPart
        tank.dwellProgress = 0
      }
    },
    setFreeTicks(state, action: PayloadAction<{ id: string; ticks: number }>) {
      const tank = state.items.find(t => t.id === action.payload.id)
      if (tank) tank.freeTicksRemaining = action.payload.ticks
    },
    decrementFreeTicks(state, action: PayloadAction<string>) {
      const tank = state.items.find(t => t.id === action.payload)
      if (tank && tank.freeTicksRemaining !== undefined) {
        tank.freeTicksRemaining = Math.max(0, tank.freeTicksRemaining - 1)
      }
    },
  },
})

export const {
  updateDwellProgress,
  setOccupied,
  setFreeTicks,
  decrementFreeTicks,
} = tanksSlice.actions

// Selectors
export const selectAllTanks      = (state: RootState) => state.tanks.items
export const selectTanksByLine   = (line: string) => (state: RootState) =>
  state.tanks.items.filter(t => t.line === line)

export default tanksSlice.reducer
