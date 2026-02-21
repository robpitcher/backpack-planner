import type { Session, User, AuthError } from '@supabase/supabase-js'

/** Row shape from the public.users table */
export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  skill_level: string | null
  preferred_units: 'imperial' | 'metric'
  created_at: string
}

/** Wrapper returned by auth helper functions */
export interface AuthResult<T = void> {
  data: T | null
  error: AuthError | null
}

/** Re-exports for convenience so consumers don't need @supabase/supabase-js */
export type { Session, User, AuthError }
