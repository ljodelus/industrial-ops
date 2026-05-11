import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type {
  DowntimeEvent,
  EquipmentDowntimeStat,
  DowntimeTimelineEntry,
  DowntimeCategoryEntry,
} from '@/types'
import {
  mockDowntimeEvents,
  mockEquipmentStats,
  mockDowntimeTimeline,
  mockDowntimeCategories,
} from '@/lib/mock/reports'

// ─── State ────────────────────────────────────────────────────────────────────

interface DowntimeReportState {
  events:            DowntimeEvent[]
  equipmentStats:    EquipmentDowntimeStat[]
  timelineData:      DowntimeTimelineEntry[]
  categoryData:      DowntimeCategoryEntry[]
  periodFrom:        string
  periodTo:          string
  selectedEquipment: string   // 'all' or equipment id (e.g. 'CRANE-1')
  categoryFilter:    string   // 'all' or category name (e.g. 'Motion')
  status:            'idle' | 'loading' | 'succeeded' | 'failed'
  error:             string | null
}

const initialState: DowntimeReportState = {
  events:            mockDowntimeEvents,
  equipmentStats:    mockEquipmentStats,
  timelineData:      mockDowntimeTimeline,
  categoryData:      mockDowntimeCategories,
  periodFrom:        '2026-05-03',
  periodTo:          '2026-05-09',
  selectedEquipment: 'all',
  categoryFilter:    'all',
  status:            'succeeded',
  error:             null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const downtimeReportSlice = createSlice({
  name: 'downtimeReport',
  initialState,
  reducers: {
    setDowntimePeriodFrom(state, action: PayloadAction<string>) {
      state.periodFrom = action.payload
    },
    setDowntimePeriodTo(state, action: PayloadAction<string>) {
      state.periodTo = action.payload
    },
    selectEquipment(state, action: PayloadAction<string>) {
      // Toggle: clicking the same equipment deselects it
      state.selectedEquipment =
        state.selectedEquipment === action.payload ? 'all' : action.payload
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload
    },
    clearDowntimeFilters(state) {
      state.selectedEquipment = 'all'
      state.categoryFilter    = 'all'
    },
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  setDowntimePeriodFrom,
  setDowntimePeriodTo,
  selectEquipment,
  setCategoryFilter,
  clearDowntimeFilters,
} = downtimeReportSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectDowntimeEvents         = (state: RootState) => state.downtimeReport.events
export const selectDowntimeEquipmentStats = (state: RootState) => state.downtimeReport.equipmentStats
export const selectDowntimeTimeline       = (state: RootState) => state.downtimeReport.timelineData
export const selectDowntimeCategories     = (state: RootState) => state.downtimeReport.categoryData
export const selectDowntimePeriodFrom     = (state: RootState) => state.downtimeReport.periodFrom
export const selectDowntimePeriodTo       = (state: RootState) => state.downtimeReport.periodTo
export const selectSelectedEquipment      = (state: RootState) => state.downtimeReport.selectedEquipment
export const selectDowntimeCategoryFilter = (state: RootState) => state.downtimeReport.categoryFilter

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default downtimeReportSlice.reducer

