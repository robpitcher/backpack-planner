import { useAuthStore } from '@/stores/authStore'
import LoginModal from '@/components/LoginModal'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {children}
      <LoginModal open={!session} />
    </>
  )
}
