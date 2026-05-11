import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

interface Notification {
  id:      string
  type:    'success' | 'error' | 'warning' | 'info'
  message: string
}

interface UIState {
  sidebarOpen:   boolean
  activeModal:   string | null
  notifications: Notification[]
}

const initialState: UIState = {
  sidebarOpen:   true,
  activeModal:   null,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload
    },
    closeModal(state) {
      state.activeModal = null
    },
    pushNotification(state, action: PayloadAction<Notification>) {
      state.notifications.push(action.payload)
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
  },
})

export const {
  toggleSidebar,
  openModal,
  closeModal,
  pushNotification,
  dismissNotification,
} = uiSlice.actions

// Selectors
export const selectSidebarOpen   = (state: RootState) => state.ui.sidebarOpen
export const selectActiveModal   = (state: RootState) => state.ui.activeModal
export const selectNotifications = (state: RootState) => state.ui.notifications

export default uiSlice.reducer
