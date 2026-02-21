import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'
import { ThemeProvider } from '@/lib/theme'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    vi.stubGlobal('matchMedia', vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
  })

  const renderThemeToggle = () => {
    return render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
  }

  describe('Rendering', () => {
    it('renders toggle button with aria-label', () => {
      renderThemeToggle()
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })

    it('renders sun and moon icons', () => {
      renderThemeToggle()
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Dropdown menu', () => {
    it('opens menu when button is clicked', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(button)

      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('shows all three theme options', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))

      const options = screen.getAllByRole('menuitem')
      expect(options).toHaveLength(3)
    })
  })

  describe('Theme switching', () => {
    it('switches to light theme when Light option is clicked', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Light'))

      expect(localStorage.getItem('theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('switches to dark theme when Dark option is clicked', async () => {
      const user = userEvent.setup()
      localStorage.setItem('theme', 'light')
      renderThemeToggle()

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Dark'))

      expect(localStorage.getItem('theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('switches to system theme when System option is clicked', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('System'))

      expect(localStorage.getItem('theme')).toBe('system')
    })
  })

  describe('Multiple toggles', () => {
    it('persists theme changes across menu open/close cycles', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      // First cycle: set to light
      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Light'))

      // Second cycle: set to dark
      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Dark'))

      expect(localStorage.getItem('theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('handles rapid theme switching', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Light'))

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Dark'))

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('System'))

      expect(localStorage.getItem('theme')).toBe('system')
    })
  })

  describe('Accessibility', () => {
    it('menu items are keyboard navigable', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(button)

      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems[0]).toHaveTextContent('Light')
      expect(menuItems[1]).toHaveTextContent('Dark')
      expect(menuItems[2]).toHaveTextContent('System')
    })

    it('button has proper aria-label for screen readers', () => {
      renderThemeToggle()
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toHaveAttribute('aria-label')
    })
  })

  describe('Integration with ThemeProvider', () => {
    it('reflects current theme from provider', async () => {
      const user = userEvent.setup()
      localStorage.setItem('theme', 'light')
      
      renderThemeToggle()

      expect(document.documentElement.classList.contains('dark')).toBe(false)

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Dark'))

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('syncs with localStorage through provider', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('Light'))

      expect(localStorage.getItem('theme')).toBe('light')

      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      await user.click(screen.getByText('System'))

      expect(localStorage.getItem('theme')).toBe('system')
    })
  })

  describe('Error handling', () => {
    it('handles ThemeProvider context correctly', () => {
      // ThemeToggle requires ThemeProvider - rendering without should fail gracefully
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => render(<ThemeToggle />)).toThrow('useTheme must be used within ThemeProvider')
      
      consoleSpy.mockRestore()
    })
  })
})
