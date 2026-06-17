import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps protected routes. Renders nothing meaningful until the boot-time
 * session check finishes (isBootstrapping), so an authenticated user with a
 * valid stored token never gets flashed the login screen on refresh.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-stone">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet" />
          <span className="font-mono text-xs uppercase tracking-wide">
            Checking session
          </span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where they were headed so we can return them after login.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
