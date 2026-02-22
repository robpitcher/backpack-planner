import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system' | 'deep-forest' | 'dusk-ridge' | 'canopy'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const ADVENTURE_THEMES = ['deep-forest', 'dusk-ridge', 'canopy'] as const

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

  // Remove all theme classes first
  root.classList.remove('dark', ...ADVENTURE_THEMES)

  if (ADVENTURE_THEMES.includes(resolvedTheme as typeof ADVENTURE_THEMES[number])) {
    // Adventure themes are dark-based, so add both 'dark' and the specific theme class
    root.classList.add('dark', resolvedTheme)
  } else if (resolvedTheme === 'dark') {
    root.classList.add('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored || 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
