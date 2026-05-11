import { configureStore } from '@reduxjs/toolkit'
import authReducer               from './slices/authSlice'
import alarmsReducer             from './slices/alarmsSlice'
import alarmHistoryReducer       from './slices/alarmHistorySlice'
import cranesReducer             from './slices/cranesSlice'
import jobsReducer               from './slices/jobsSlice'
import recipesReducer            from './slices/recipesSlice'
import uiReducer                 from './slices/uiSlice'
import tanksReducer              from './slices/tanksSlice'
import usersReducer              from './slices/usersSlice'
import productionReportReducer   from './slices/productionReportSlice'
import downtimeReportReducer     from './slices/downtimeReportSlice'
import craneUtilizationReducer   from './slices/craneUtilizationSlice'
import alarmReportReducer        from './slices/alarmReportSlice'
import ioReducer                  from './slices/ioSlice'
import auditReducer               from './slices/auditSlice'

export const store = configureStore({
  reducer: {
    auth:             authReducer,
    alarms:           alarmsReducer,
    alarmHistory:     alarmHistoryReducer,
    cranes:           cranesReducer,
    jobs:             jobsReducer,
    recipes:          recipesReducer,
    ui:               uiReducer,
    tanks:            tanksReducer,
    users:            usersReducer,
    productionReport: productionReportReducer,
    downtimeReport:   downtimeReportReducer,
    craneUtilization: craneUtilizationReducer,
    alarmReport:      alarmReportReducer,
    io:               ioReducer,
    audit:            auditReducer,
  },
})

export type RootState    = ReturnType<typeof store.getState>
export type AppDispatch  = typeof store.dispatch
