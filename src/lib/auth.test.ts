import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signUp, signIn, signInWithMagicLink, signInWithGoogle, signOut, getSession, getUserProfile } from './auth'
import { supabase } from './supabase'

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
}
Object.defineProperty(global, 'window', {
  value: { location: mockLocation },
  writable: true,
})

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('calls supabase.auth.signUp with email and password', async () => {
      const mockResponse = {
        data: { session: { access_token: 'token', user: { id: 'user1', email: 'test@example.com' } } },
        error: null,
      }
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse as any)

      const result = await signUp('test@example.com', 'password123')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.data).toBeTruthy()
      expect(result.error).toBeNull()
    })

    it('returns null data when session is null', async () => {
      const mockResponse = {
        data: { session: null },
        error: null,
      }
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse as any)

      const result = await signUp('test@example.com', 'password123')

      expect(result.data).toBeNull()
    })

    it('handles error responses', async () => {
      const mockResponse = {
        data: { session: null },
        error: { message: 'Email already registered' },
      }
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse as any)

      const result = await signUp('test@example.com', 'password123')

      expect(result.error).toBeTruthy()
      expect(result.data).toBeNull()
    })
  })

  describe('signIn', () => {
    it('calls supabase.auth.signInWithPassword', async () => {
      const mockSession = {
        access_token: 'token123',
        user: { id: 'user1', email: 'test@example.com' },
      }
      const mockResponse = {
        data: { session: mockSession },
        error: null,
      }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any)

      const result = await signIn('test@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.data).toBeTruthy()
      expect(result.data?.session.access_token).toBe('token123')
    })

    it('returns null when no session', async () => {
      const mockResponse = {
        data: { session: null },
        error: null,
      }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any)

      const result = await signIn('test@example.com', 'wrongpassword')

      expect(result.data).toBeNull()
    })

    it('handles authentication errors', async () => {
      const mockResponse = {
        data: { session: null },
        error: { message: 'Invalid credentials' },
      }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any)

      const result = await signIn('test@example.com', 'wrongpassword')

      expect(result.error).toBeTruthy()
    })
  })

  describe('signInWithMagicLink', () => {
    it('calls supabase.auth.signInWithOtp with email', async () => {
      const mockResponse = {
        data: {},
        error: null,
      }
      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue(mockResponse as any)

      const result = await signInWithMagicLink('test@example.com')

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { emailRedirectTo: 'http://localhost:3000/auth/callback' },
      })
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('handles magic link errors', async () => {
      const mockResponse = {
        data: {},
        error: { message: 'Email rate limit exceeded' },
      }
      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue(mockResponse as any)

      const result = await signInWithMagicLink('test@example.com')

      expect(result.error).toBeTruthy()
    })
  })

  describe('signInWithGoogle', () => {
    it('calls supabase.auth.signInWithOAuth with Google provider', async () => {
      const mockResponse = {
        data: {},
        error: null,
      }
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockResponse as any)

      const result = await signInWithGoogle()

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: 'http://localhost:3000/auth/callback' },
      })
      expect(result.error).toBeNull()
    })

    it('handles OAuth errors', async () => {
      const mockResponse = {
        data: {},
        error: { message: 'OAuth provider unavailable' },
      }
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockResponse as any)

      const result = await signInWithGoogle()

      expect(result.error).toBeTruthy()
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      const mockResponse = { error: null }
      vi.mocked(supabase.auth.signOut).mockResolvedValue(mockResponse as any)

      const result = await signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('handles signOut errors', async () => {
      const mockResponse = { error: { message: 'Network error' } }
      vi.mocked(supabase.auth.signOut).mockResolvedValue(mockResponse as any)

      const result = await signOut()

      expect(result.error).toBeTruthy()
    })
  })

  describe('getSession', () => {
    it('retrieves current session', async () => {
      const mockSession = {
        access_token: 'token123',
        user: { id: 'user1', email: 'test@example.com' },
      }
      const mockResponse = {
        data: { session: mockSession },
        error: null,
      }
      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockResponse as any)

      const result = await getSession()

      expect(supabase.auth.getSession).toHaveBeenCalled()
      expect(result.data).toEqual(mockSession)
    })

    it('returns null when no session', async () => {
      const mockResponse = {
        data: { session: null },
        error: null,
      }
      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockResponse as any)

      const result = await getSession()

      expect(result.data).toBeNull()
    })
  })

  describe('getUserProfile', () => {
    it('fetches user profile from public.users table', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const mockProfile = {
        id: 'user1',
        email: 'test@example.com',
        preferred_units: 'metric',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }))
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      const result = await getUserProfile()

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(supabase.from).toHaveBeenCalledWith('users')
      expect(result.data).toEqual(mockProfile)
    })

    it('returns null when user not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      } as any)

      const result = await getUserProfile()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    it('handles profile fetch errors', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com' }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      }))
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      const result = await getUserProfile()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })
})
