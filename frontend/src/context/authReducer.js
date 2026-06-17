// Action types kept as constants so typos fail loudly at import time, not at runtime.
export const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  SESSION_CHECKED: 'SESSION_CHECKED',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

export const initialAuthState = {
  user: null,
  token: null,
  // True only while a login/register request is in flight.
  isLoading: false,
  // True while we're verifying a persisted token on app boot (GET /auth/me).
  isBootstrapping: true,
  error: null,
  isAuthenticated: false,
}

export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isBootstrapping: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        isLoading: false,
        // Defensive: in normal flow this action only fires after bootstrap
        // already resolved, but setting it explicitly means this reducer
        // can never leave the app stuck on the "checking session" screen.
        isBootstrapping: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
        isBootstrapping: false,
      }

    case AUTH_ACTIONS.SESSION_CHECKED:
      // Fired once the boot-time "is there a valid token?" check resolves,
      // whether it found a session or not.
      return {
        ...state,
        isBootstrapping: false,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}
