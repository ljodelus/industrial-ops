import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Crane, CraneStatus, CraneMode } from '@/types'
import { mockCranes } from '@/lib/mock/cranes'

interface CranesState {
  items:           Crane[]
  status:          'idle' | 'loading' | 'succeeded' | 'failed'
  error:           string | null
  selectedCraneId: string | null
}

const initialState: CranesState = {
  items:           mockCranes,
  status:          'succeeded',
  error:           null,
  selectedCraneId: null,
}

const cranesSlice = createSlice({
  name: 'cranes',
  initialState,
  reducers: {
    updatePosition(state, action: PayloadAction<{ id: string; position: number }>) {
      const crane = state.items.find(c => c.id === action.payload.id)
      if (crane) crane.position = action.payload.position
    },
    updateStatus(state, action: PayloadAction<{ id: string; status: CraneStatus }>) {
      const crane = state.items.find(c => c.id === action.payload.id)
      if (crane) crane.status = action.payload.status
    },
    assignJob(state, action: PayloadAction<{ craneId: string; jobId: string }>) {
      const crane = state.items.find(c => c.id === action.payload.craneId)
      if (crane) crane.currentJob = action.payload.jobId
    },
    clearJob(state, action: PayloadAction<string>) {
      const crane = state.items.find(c => c.id === action.payload)
      if (crane) crane.currentJob = undefined
    },
    selectCrane(state, action: PayloadAction<string | null>) {
      state.selectedCraneId = action.payload
    },
    setMode(state, action: PayloadAction<{ id: string; mode: CraneMode }>) {
      const crane = state.items.find(c => c.id === action.payload.id)
      if (crane) crane.mode = action.payload.mode
    },
    setTargetPosition(state, action: PayloadAction<{ id: string; targetPosition: number | undefined }>) {
      const crane = state.items.find(c => c.id === action.payload.id)
      if (crane) crane.targetPosition = action.payload.targetPosition
    },
  },
})

export const {
  updatePosition,
  updateStatus,
  assignJob,
  clearJob,
  selectCrane,
  setMode,
  setTargetPosition,
} = cranesSlice.actions

// Selectors
export const selectAllCranes     = (state: RootState) => state.cranes.items
export const selectSelectedCrane = (state: RootState) =>
  state.cranes.items.find(c => c.id === state.cranes.selectedCraneId) ?? null
export const selectCranesByLine  = (line: string) => (state: RootState) =>
  state.cranes.items.filter(c => c.line === line)
export const selectCranesInAlarm = (state: RootState) =>
  state.cranes.items.filter(c => c.status === 'error')

export default cranesSlice.reducer
