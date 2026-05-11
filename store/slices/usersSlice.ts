import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { User, UserRole, UserWithStatus } from '@/types'
import { mockUsers, mockUsersWithStatus } from '@/lib/mock/users'

interface UsersState {
  items:       User[]
  extended:    UserWithStatus[]
  status:      'idle' | 'loading' | 'succeeded' | 'failed'
  error:       string | null
}

const initialState: UsersState = {
  items:    mockUsers,
  extended: mockUsersWithStatus,
  status:   'succeeded',
  error:    null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<UserWithStatus>) {
      state.extended.push(action.payload)
    },
    removeUser(state, action: PayloadAction<string>) {
      state.items    = state.items.filter(u => u.id !== action.payload)
      state.extended = state.extended.filter(u => u.id !== action.payload)
    },
    updateRole(state, action: PayloadAction<{ id: string; role: UserRole }>) {
      const user = state.items.find(u => u.id === action.payload.id)
      if (user) user.role = action.payload.role
      const ext = state.extended.find(u => u.id === action.payload.id)
      if (ext) ext.role = action.payload.role
    },
    updateUser(state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole }>) {
      const ext = state.extended.find(u => u.id === action.payload.id)
      if (ext) {
        ext.name  = action.payload.name
        ext.email = action.payload.email
        ext.role  = action.payload.role
      }
    },
    deactivateUser(state, action: PayloadAction<string>) {
      const ext = state.extended.find(u => u.id === action.payload)
      if (ext) {
        ext.status         = 'inactive'
        ext.activeSessions = 0
        ext.online         = false
      }
    },
    reactivateUser(state, action: PayloadAction<string>) {
      const ext = state.extended.find(u => u.id === action.payload)
      if (ext) ext.status = 'active'
    },
  },
})

export const {
  addUser,
  removeUser,
  updateRole,
  updateUser,
  deactivateUser,
  reactivateUser,
} = usersSlice.actions

// Selectors
export const selectAllUsers         = (state: RootState) => state.users.items
export const selectAllUsersExtended = (state: RootState) => state.users.extended
export const selectUserById         = (id: string) => (state: RootState) =>
  state.users.items.find(u => u.id === id) ?? null

export default usersSlice.reducer
