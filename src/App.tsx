import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useTheme } from './store/AppContext'
import { AuthProvider, useAuth } from './store/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './pages/Landing'
import { AuthPage } from './pages/Auth'
import { DashboardPage } from './pages/Dashboard'
import { TodayTasksPage } from './pages/TodayTasks'
import { TopicsPage } from './pages/Topics'
import { ProblemsPage } from './pages/Problems'
import { RevisionPage } from './pages/Revision'
import { AnalyticsPage } from './pages/Analytics'
import { CalendarPage } from './pages/Calendar'
import { InterviewPrepPage } from './pages/InterviewPrep'
import { ProfilePage } from './pages/Profile'
import { SettingsPage } from './pages/Settings'

function RootRoute() {
  const { isAuthenticated, loading } = useAuth()

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
    return <Navigate to="/dashboard" replace />
  }

  return <LandingPage />
}

function AppRoutes() {
  useTheme()

  return (
    <BrowserRouter>
      <Routes>
        {/* Smart Public Entry (Guest -> Landing, Authenticated -> /dashboard) */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Public Auth Routes (Redirect to /dashboard or ?redirect= if already logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/forgot" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Protected Personal Workspace Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TodayTasksPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/revision" element={<RevisionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/interview" element={<InterviewPrepPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  )
}
