import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore — State Management', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      userProfile: null,
      preferredUnits: 'imperial',
      isLoading: true,
    })
  })

  describe('Initial State', () => {
    it('initializes with null user and session', () => {
      const { user, session } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(session).toBeNull()
    })

    it('initializes with imperial units', () => {
      const { preferredUnits } = useAuthStore.getState()
      expect(preferredUnits).toBe('imperial')
    })

    it('initializes with isLoading true', () => {
      const { isLoading } = useAuthStore.getState()
      expect(isLoading).toBe(true)
    })
  })

  describe('setUser', () => {
    it('sets user to non-null', () => {
      const { setUser } = useAuthStore.getState()
      const user = {
        id: 'user123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      }
      setUser(user)
      expect(useAuthStore.getState().user).toEqual(user)
    })

    it('sets user to null', () => {
      const { setUser } = useAuthStore.getState()
      setUser({ id: 'user123', email: 'test@example.com', created_at: new Date().toISOString() })
      setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('setSession', () => {
    it('sets session and extracts user', () => {
      const { setSession } = useAuthStore.getState()
      const session = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        },
      }
      setSession(session)
      expect(useAuthStore.getState().session).toEqual(session)
      expect(useAuthStore.getState().user).toEqual(session.user)
    })

    it('clears user when session is null', () => {
      const { setSession } = useAuthStore.getState()
      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        },
      })
      setSession(null)
      expect(useAuthStore.getState().session).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('setPreferredUnits', () => {
    it('updates preferred units to metric', () => {
      const { setPreferredUnits } = useAuthStore.getState()
      setPreferredUnits('metric')
      expect(useAuthStore.getState().preferredUnits).toBe('metric')
    })

    it('updates preferred units to imperial', () => {
      const { setPreferredUnits } = useAuthStore.getState()
      useAuthStore.setState({ preferredUnits: 'metric' })
      setPreferredUnits('imperial')
      expect(useAuthStore.getState().preferredUnits).toBe('imperial')
    })
  })

  describe('logout', () => {
    it('clears all auth state on logout', async () => {
      const { vi } = await import('vitest')
      const { supabase } = await import('@/lib/supabase')
      
      // Mock signOut to return proper structure
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any)
      
      // Setup initial auth state
      useAuthStore.setState({
        user: { id: 'user123', email: 'test@example.com', created_at: new Date().toISOString() },
        session: {
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: { id: 'user123', email: 'test@example.com', created_at: new Date().toISOString() },
        },
        userProfile: {
          id: 'user123',
          email: 'test@example.com',
          preferred_units: 'metric',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        preferredUnits: 'metric',
      })

      const { logout } = useAuthStore.getState()
      await logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.session).toBeNull()
      expect(state.userProfile).toBeNull()
      expect(state.preferredUnits).toBe('imperial')
    })
  })
})
