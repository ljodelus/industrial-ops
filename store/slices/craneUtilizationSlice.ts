import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type {
  CraneUtilizationData, CraneActivityData,
  LoadBucket, HeatmapCell, CraneComparisonMetric,
} from '@/types'
import {
  mockCraneUtilization,
  mockActivityBreakdown,
  mockLoadDistribution,
  mockMovementHeatmap,
  mockCraneComparisonRows,
} from '@/lib/mock/reports'

// ─── State ─────────────────────────────────────────────────────────────────────

interface CraneUtilizationState {
  cranes:           CraneUtilizationData[]
  activityBreakdown: CraneActivityData[]
  loadDistribution: LoadBucket[]
  heatmap:          HeatmapCell[]
  comparisonRows:   CraneComparisonMetric[]
  periodFrom:       string
  periodTo:         string
  lineFilter:       'all' | 'LINE-1' | 'LINE-2'
  selectedChartCrane:   string   // 'fleet' | 'CRANE-1' | ...
  selectedHeatmapCrane: string   // 'all'   | 'CRANE-1' | ...
  highlightedCrane:     string | null
  status:           'idle' | 'loading' | 'succeeded' | 'failed'
  error:            string | null
}

const initialState: CraneUtilizationState = {
  cranes:            mockCraneUtilization,
  activityBreakdown: mockActivityBreakdown,
  loadDistribution:  mockLoadDistribution,
  heatmap:           mockMovementHeatmap,
  comparisonRows:    mockCraneComparisonRows,
  periodFrom:        '2026-05-03',
  periodTo:          '2026-05-09',
  lineFilter:        'all',
  selectedChartCrane:   'fleet',
  selectedHeatmapCrane: 'all',
  highlightedCrane:     null,
  status:            'succeeded',
  error:             null,
}

// ─── Slice ─────────────────────────────────────────────────────────────────────

const craneUtilizationSlice = createSlice({
  name: 'craneUtilization',
  initialState,
  reducers: {
    setPeriodFrom(state, action: PayloadAction<string>) {
      state.periodFrom = action.payload
    },
    setPeriodTo(state, action: PayloadAction<string>) {
      state.periodTo = action.payload
    },
    setLineFilter(state, action: PayloadAction<'all' | 'LINE-1' | 'LINE-2'>) {
      state.lineFilter = action.payload
    },
    selectChartCrane(state, action: PayloadAction<string>) {
      state.selectedChartCrane = action.payload
    },
    selectHeatmapCrane(state, action: PayloadAction<string>) {
      state.selectedHeatmapCrane = action.payload
    },
    highlightCrane(state, action: PayloadAction<string | null>) {
      state.highlightedCrane = action.payload
    },
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  setPeriodFrom,
  setPeriodTo,
  setLineFilter,
  selectChartCrane,
  selectHeatmapCrane,
  highlightCrane,
} = craneUtilizationSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCraneUtilization     = (state: RootState) => state.craneUtilization.cranes
export const selectActivityBreakdown    = (state: RootState) => state.craneUtilization.activityBreakdown
export const selectLoadDistribution     = (state: RootState) => state.craneUtilization.loadDistribution
export const selectHeatmapData          = (state: RootState) => state.craneUtilization.heatmap
export const selectComparisonRows       = (state: RootState) => state.craneUtilization.comparisonRows
export const selectCUPeriodFrom         = (state: RootState) => state.craneUtilization.periodFrom
export const selectCUPeriodTo           = (state: RootState) => state.craneUtilization.periodTo
export const selectCULineFilter         = (state: RootState) => state.craneUtilization.lineFilter
export const selectSelectedChartCrane   = (state: RootState) => state.craneUtilization.selectedChartCrane
export const selectSelectedHeatmapCrane = (state: RootState) => state.craneUtilization.selectedHeatmapCrane
export const selectHighlightedCrane     = (state: RootState) => state.craneUtilization.highlightedCrane

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default craneUtilizationSlice.reducer

