import { Link } from 'react-router-dom'
import { Github, LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import ThemeToggle from '@/components/ThemeToggle'

export default function AppHeader() {
  const { user, logout } = useAuthStore()

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <img src="/logo.png" alt="TrailForge" className="h-8 w-8" />
          TrailForge
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
          )}

          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/robpitcher/backpack-planner" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
              <Github className="h-5 w-5" />
            </a>
          </Button>

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
