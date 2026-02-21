import { supabase } from '@/lib/supabase'
import type {
  AuthResult,
  UserProfile,
  Session,
} from '@/types/auth'
import type { Subscription } from '@supabase/supabase-js'

// ── Sign Up (email + password) ──────────────────────────────

export async function signUp(
  email: string,
  password: string,
): Promise<AuthResult<{ session: Session | null }>> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data: data?.session ? { session: data.session } : null, error }
}

// ── Sign In (email + password) ───────────────────────────────

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult<{ session: Session }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return {
    data: data?.session ? { session: data.session } : null,
    error,
  }
}

// ── Sign In with Google OAuth ────────────────────────────────

export async function signInWithGoogle(): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { data: null, error }
}

// ── Sign Out ─────────────────────────────────────────────────

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()
  return { data: null, error }
}

// ── Get Current Session ──────────────────────────────────────

export async function getSession(): Promise<AuthResult<Session>> {
  const { data, error } = await supabase.auth.getSession()
  return { data: data?.session ?? null, error }
}

// ── Auth State Listener ──────────────────────────────────────

export function onAuthStateChange(
  callback: (session: Session | null) => void,
): Subscription {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return subscription
}

// ── User Profile ─────────────────────────────────────────────

/** Fetch the current user's profile row from public.users. */
export async function getUserProfile(): Promise<AuthResult<UserProfile>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: authError ?? null }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    data: data as UserProfile | null,
    error: error as unknown as import('@supabase/supabase-js').AuthError | null,
  }
}
