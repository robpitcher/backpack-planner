import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './theme'

describe('ThemeProvider', () => {
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

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Initialization', () => {
    it('defaults to dark theme when no localStorage value', () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('loads theme from localStorage', () => {
      localStorage.setItem('theme', 'light')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('loads system theme from localStorage', () => {
      localStorage.setItem('theme', 'system')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('system')
    })
  })

  describe('setTheme', () => {
    it('updates theme state and localStorage', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        return (
          <>
            <div data-testid="theme">{theme}</div>
            <button onClick={() => setTheme('light')}>Set Light</button>
          </>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')

      await user.click(screen.getByText('Set Light'))

      expect(screen.getByTestId('theme')).toHaveTextContent('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('applies dark class when setting dark theme', () => {
      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('dark')}>Set Dark</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set Dark').click()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class when setting light theme', () => {
      document.documentElement.classList.add('dark')

      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('light')}>Set Light</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set Light').click()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('persists theme changes across rerenders', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        return (
          <>
            <div data-testid="theme">{theme}</div>
            <button onClick={() => setTheme('light')}>Set Light</button>
            <button onClick={() => setTheme('dark')}>Set Dark</button>
          </>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await user.click(screen.getByText('Set Light'))
      expect(screen.getByTestId('theme')).toHaveTextContent('light')

      await user.click(screen.getByText('Set Dark'))
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  describe('System theme', () => {
    it('resolves to dark when system prefers dark', () => {
      vi.stubGlobal('matchMedia', vi.fn((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })))

      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('system')}>Set System</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set System').click()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('resolves to light when system prefers light', () => {
      vi.stubGlobal('matchMedia', vi.fn((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })))

      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('system')}>Set System</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set System').click()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('registers mediaQuery listener when theme is system', async () => {
      const addEventListenerSpy = vi.fn()
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      vi.stubGlobal('matchMedia', mockMatchMedia)

      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('system')}>Set System</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set System').click()

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
      })
    })

    it('cleans up mediaQuery listener when theme changes from system', async () => {
      const removeEventListenerSpy = vi.fn()
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }))
      vi.stubGlobal('matchMedia', mockMatchMedia)

      const TestComponent = () => {
        const { setTheme } = useTheme()
        return (
          <>
            <button onClick={() => setTheme('system')}>Set System</button>
            <button onClick={() => setTheme('dark')}>Set Dark</button>
          </>
        )
      }

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set System').click()
      
      await waitFor(() => {
        expect(mockMatchMedia).toHaveBeenCalled()
      })

      screen.getByText('Set Dark').click()

      await waitFor(() => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
      })

      unmount()
    })
  })

  describe('useTheme hook', () => {
    it('throws error when used outside ThemeProvider', () => {
      const TestComponent = () => {
        useTheme()
        return null
      }

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within ThemeProvider'
      )

      consoleSpy.mockRestore()
    })

    it('returns theme and setTheme when used within provider', () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        expect(theme).toBeDefined()
        expect(typeof setTheme).toBe('function')
        return <div>OK</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
    })
  })

  describe('DOM manipulation', () => {
    it('adds dark class to document root for dark theme', () => {
      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('dark')}>Set Dark</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set Dark').click()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class from document root for light theme', () => {
      document.documentElement.classList.add('dark')

      const TestComponent = () => {
        const { setTheme } = useTheme()
        return <button onClick={() => setTheme('light')}>Set Light</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      screen.getByText('Set Light').click()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('handles invalid localStorage value gracefully', () => {
      localStorage.setItem('theme', 'invalid-theme')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Should default to stored value even if invalid (per TypeScript casting)
      expect(screen.getByTestId('theme')).toHaveTextContent('invalid-theme')
    })

    it('applies theme on mount', () => {
      localStorage.setItem('theme', 'light')

      render(
        <ThemeProvider>
          <div>Child</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('handles rapid theme changes', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        return (
          <>
            <div data-testid="theme">{theme}</div>
            <button onClick={async () => {
              setTheme('light')
              setTheme('dark')
              setTheme('system')
            }}>Triple Change</button>
          </>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await user.click(screen.getByText('Triple Change'))

      expect(screen.getByTestId('theme')).toHaveTextContent('system')
      expect(localStorage.getItem('theme')).toBe('system')
    })
  })
})
