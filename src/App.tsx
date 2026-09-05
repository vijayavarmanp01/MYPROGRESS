import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useTheme } from './store/AppContext'
import { AuthProvider } from './store/AuthContext'
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

function AppRoutes() {
  useTheme()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Pages */}
        <Route path="/" element={<LandingPage />} />
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
