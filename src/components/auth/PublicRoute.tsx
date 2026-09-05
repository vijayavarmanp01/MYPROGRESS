import { type ReactNode } from 'react'
import { Navigate, useSearchParams, Outlet } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'

interface PublicRouteProps {
  children?: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const [searchParams] = useSearchParams()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060810]">
        <div className="flex flex-col items-center gap-3">
          <div className="logo-tile grid h-10 w-10 animate-pulse place-items-center rounded-xl text-sm font-bold text-white">
            MP
          </div>
          <span className="text-xs font-medium text-slate-400">Loading…</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    const rawRedirect = searchParams.get('redirect')
    const destination = rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard'
    return <Navigate to={destination} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
