import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/auth'
import type { PostgrestError } from '@supabase/supabase-js'
import type { UnitSystem } from '@/types'

// ── Result wrapper ───────────────────────────────────────────

export interface ApiResult<T = void> {
  data: T | null
  error: PostgrestError | null
}

// ── Input type ───────────────────────────────────────────────

export type UpdateProfileInput = {
  display_name?: string
  avatar_url?: string | null
  skill_level?: string | null
  preferred_units?: UnitSystem
}

// ── Get Profile ──────────────────────────────────────────────

export async function getUserProfile(
  userId: string,
): Promise<ApiResult<UserProfile>> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data: data as UserProfile | null, error }
}

// ── Update Profile ───────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<ApiResult<UserProfile>> {
  const { data, error } = await supabase
    .from('users')
    .update(input)
    .eq('id', userId)
    .select()
    .single()

  return { data: data as UserProfile | null, error }
}
