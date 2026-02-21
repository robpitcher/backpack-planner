import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Toaster } from '@/components/ui/sonner'
import AuthGuard from '@/components/AuthGuard'
import LoginPage from '@/pages/LoginPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import TripPlannerPage from '@/pages/TripPlannerPage'
import TripDetailPage from '@/pages/TripDetailPage'

function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    const cleanup = initialize()
    return cleanup
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/trip/:tripId/plan"
          element={
            <AuthGuard>
              <TripPlannerPage />
            </AuthGuard>
          }
        />
        <Route
          path="/trip/:tripId"
          element={
            <AuthGuard>
              <TripDetailPage />
            </AuthGuard>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
