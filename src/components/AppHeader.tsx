import { Link } from 'react-router-dom'
import { LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import ThemeToggle from '@/components/ThemeToggle'

export default function AppHeader() {
  const { user, logout } = useAuthStore()

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">
          TrailForge
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
          )}

          <ThemeToggle />

          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile" aria-label="Profile">
              <UserCircle className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
