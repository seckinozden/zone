import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AppLayout } from './components/AppLayout'
import { CalendarPage } from './pages/CalendarPage'
import { TasksPage } from './pages/TasksPage'
import { SettingsLayout } from './pages/settings/SettingsLayout'
import { AccountSettings } from './pages/settings/AccountSettings'
import { AppearanceSettings } from './pages/settings/AppearanceSettings'
import { ManageLabelsPage } from './pages/ManageLabelsPage'
import { SleepPage } from './pages/SleepPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: true },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/app/calendar" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="calendar" replace />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="labels" element={<ManageLabelsPage />} />
              <Route path="sleep" element={<SleepPage />} />
              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="account" replace />} />
                <Route path="account" element={<AccountSettings />} />
                <Route path="appearance" element={<AppearanceSettings />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/app/calendar" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
