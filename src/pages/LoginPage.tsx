import { Navigate } from 'react-router-dom'

// Login is now handled by LoginModal over the dashboard.
// This page redirects to /dashboard for backward compatibility.
export default function LoginPage() {
  return <Navigate to="/dashboard" replace />
}
