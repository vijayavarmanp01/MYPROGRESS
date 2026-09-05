import { type ReactNode } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'

interface ProtectedRouteProps {
  children?: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060810]">
        <div className="flex flex-col items-center gap-3">
          <div className="logo-tile grid h-10 w-10 animate-pulse place-items-center rounded-xl text-sm font-bold text-white">
            MP
          </div>
          <span className="text-xs font-medium text-slate-400">Loading workspace…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirectPath = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
