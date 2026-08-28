import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useTheme } from './store/AppContext'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/Dashboard'
import { TodayTasksPage } from './pages/TodayTasks'
import { TopicsPage } from './pages/Topics'
import { ProblemsPage } from './pages/Problems'
import { RevisionPage } from './pages/Revision'
import { AnalyticsPage } from './pages/Analytics'
import { CalendarPage } from './pages/Calendar'
import { InterviewPrepPage } from './pages/InterviewPrep'
import { SettingsPage } from './pages/Settings'

function ThemedApp() {
  useTheme()
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TodayTasksPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="problems" element={<ProblemsPage />} />
          <Route path="revision" element={<RevisionPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="interview" element={<InterviewPrepPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  )
}
