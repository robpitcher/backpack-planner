import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/login', { replace: true })
    }
  }, [isLoading, session, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
