import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { authReducer, initialAuthState, AUTH_ACTIONS } from './authReducer'
import { loginUser, registerUser, fetchCurrentUser } from '../api/auth'
import { getStoredToken, setStoredToken } from '../api/client'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  // On first mount, see if a token is already sitting in storage from a
  // previous session and, if so, validate it against /auth/me rather than
  // trusting it blindly (it could be expired or revoked).
  useEffect(() => {
    const existingToken = getStoredToken()

    if (!existingToken) {
      dispatch({ type: AUTH_ACTIONS.SESSION_CHECKED })
      return
    }

    let cancelled = false

    fetchCurrentUser(existingToken)
      .then((user) => {
        if (cancelled) return
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: { user, token: existingToken },
        })
      })
      .catch(() => {
        if (cancelled) return
        setStoredToken(null)
        dispatch({ type: AUTH_ACTIONS.SESSION_CHECKED })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START })
    try {
      const data = await loginUser({ email, password })
      setStoredToken(data.access_token)
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user: data.user, token: data.access_token },
      })
      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: error.message })
      return { success: false, error: error.message }
    }
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START })
    try {
      const data = await registerUser({ name, email, password })
      setStoredToken(data.access_token)
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user: data.user, token: data.access_token },
      })
      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: error.message })
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
