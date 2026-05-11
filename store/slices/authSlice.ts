import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { User } from '@/types'

// Preconfigured users — authentication is client-side for this mock
export const PRECONFIGURED_USERS: (User & { password: string })[] = [
  { id: '1', name: 'John Carter', email: 'operator@ops.com',   password: 'ops1234', role: 'operator'   },
  { id: '2', name: 'Sarah Mills', email: 'supervisor@ops.com', password: 'sup1234', role: 'supervisor' },
  { id: '3', name: 'Marc Dupont', email: 'engineer@ops.com',   password: 'eng1234', role: 'engineer'   },
  { id: '4', name: 'Admin User',  email: 'admin@ops.com',      password: 'adm1234', role: 'admin'      },
]

interface AuthState {
  user:            User | null
  isAuthenticated: boolean
  loginError:      string | null
  isLoading:       boolean
}

const initialState: AuthState = {
  user:            null,
  isAuthenticated: false,
  loginError:      null,
  isLoading:       false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading  = true
      state.loginError = null
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.isLoading       = false
      state.isAuthenticated = true
      state.user            = action.payload
      state.loginError      = null
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading  = false
      state.loginError = action.payload
    },
    logout(state) {
      state.user            = null
      state.isAuthenticated = false
      state.loginError      = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions

// Selectors
export const selectCurrentUser     = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectLoginError      = (state: RootState) => state.auth.loginError
export const selectAuthIsLoading   = (state: RootState) => state.auth.isLoading
export const selectUserRole        = (state: RootState) => state.auth.user?.role ?? null

// Thunk — login logic
export const loginUser = (email: string, password: string) =>
  (dispatch: (action: ReturnType<typeof loginStart> | ReturnType<typeof loginSuccess> | ReturnType<typeof loginFailure>) => void) => {
    dispatch(loginStart())
    // Simulate async check
    setTimeout(() => {
      const found = PRECONFIGURED_USERS.find(
        u => u.email === email && u.password === password
      )
      if (found) {
        const { password: _, ...user } = found
        dispatch(loginSuccess(user))
      } else {
        dispatch(loginFailure('Invalid email or password.'))
      }
    }, 600)
  }

export default authSlice.reducer
