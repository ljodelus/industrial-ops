import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { ProductionBatch, DailyVolumeEntry } from '@/types'
import { mockProductionBatches, mockDailyVolume } from '@/lib/mock/reports'

// ─── State ────────────────────────────────────────────────────────────────────

interface ProductionReportState {
  batches:             ProductionBatch[]
  dailyVolume:         DailyVolumeEntry[]
  periodFrom:          string
  periodTo:            string
  tableSearch:         string
  tableRecipeFilter:   string   // 'all' or recipe name
  tableLineFilter:     string   // 'all' | 'LINE-1' | 'LINE-2'
  tableStatusFilter:   string   // 'all' | 'completed' | 'failed' | 'cancelled'
  status:              'idle' | 'loading' | 'succeeded' | 'failed'
  error:               string | null
}

const today   = new Date('2026-05-10')
const sevenAgo = new Date('2026-05-03')

const initialState: ProductionReportState = {
  batches:           mockProductionBatches,
  dailyVolume:       mockDailyVolume,
  periodFrom:        sevenAgo.toISOString().slice(0, 10),
  periodTo:          today.toISOString().slice(0, 10),
  tableSearch:       '',
  tableRecipeFilter: 'all',
  tableLineFilter:   'all',
  tableStatusFilter: 'all',
  status:            'succeeded',
  error:             null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const productionReportSlice = createSlice({
  name: 'productionReport',
  initialState,
  reducers: {
    setPeriodFrom(state, action: PayloadAction<string>) {
      state.periodFrom = action.payload
    },
    setPeriodTo(state, action: PayloadAction<string>) {
      state.periodTo = action.payload
    },
    setTableSearch(state, action: PayloadAction<string>) {
      state.tableSearch = action.payload
    },
    setTableRecipeFilter(state, action: PayloadAction<string>) {
      state.tableRecipeFilter = action.payload
    },
    setTableLineFilter(state, action: PayloadAction<string>) {
      state.tableLineFilter = action.payload
    },
    setTableStatusFilter(state, action: PayloadAction<string>) {
      state.tableStatusFilter = action.payload
    },
    clearTableFilters(state) {
      state.tableSearch       = ''
      state.tableRecipeFilter = 'all'
      state.tableLineFilter   = 'all'
      state.tableStatusFilter = 'all'
    },
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  setPeriodFrom,
  setPeriodTo,
  setTableSearch,
  setTableRecipeFilter,
  setTableLineFilter,
  setTableStatusFilter,
  clearTableFilters,
} = productionReportSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAllBatches         = (state: RootState) => state.productionReport.batches
export const selectDailyVolume        = (state: RootState) => state.productionReport.dailyVolume
export const selectPeriodFrom         = (state: RootState) => state.productionReport.periodFrom
export const selectPeriodTo           = (state: RootState) => state.productionReport.periodTo
export const selectTableSearch        = (state: RootState) => state.productionReport.tableSearch
export const selectTableRecipeFilter  = (state: RootState) => state.productionReport.tableRecipeFilter
export const selectTableLineFilter    = (state: RootState) => state.productionReport.tableLineFilter
export const selectTableStatusFilter  = (state: RootState) => state.productionReport.tableStatusFilter

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default productionReportSlice.reducer

