import { supabase } from '@/lib/supabase'
import type { Trip, TripStatus } from '@/types/index'
import type { PostgrestError } from '@supabase/supabase-js'

// ── Result wrapper ───────────────────────────────────────────

export interface ApiResult<T = void> {
  data: T | null
  error: PostgrestError | null
}

// ── Input types ──────────────────────────────────────────────

export type CreateTripInput = {
  title: string
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  region?: string | null
  is_public?: boolean
}

export type UpdateTripInput = Partial<
  Omit<Trip, 'id' | 'user_id' | 'created_at'>
>

// ── Create ───────────────────────────────────────────────────

export async function createTrip(
  data: CreateTripInput,
): Promise<ApiResult<Trip>> {
  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      title: data.title,
      description: data.description ?? null,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      region: data.region ?? null,
      is_public: data.is_public ?? false,
      status: 'draft' as TripStatus,
    })
    .select()
    .single()

  return { data: trip as Trip | null, error }
}

// ── Read (single) ────────────────────────────────────────────

export async function getTrip(tripId: string): Promise<ApiResult<Trip>> {
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  return { data: trip as Trip | null, error }
}

// ── Read (user's trips) ──────────────────────────────────────

export async function getUserTrips(
  userId: string,
): Promise<ApiResult<Trip[]>> {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: (trips as Trip[]) ?? null, error }
}

// ── Update ───────────────────────────────────────────────────

export async function updateTrip(
  tripId: string,
  data: UpdateTripInput,
): Promise<ApiResult<Trip>> {
  const { data: trip, error } = await supabase
    .from('trips')
    .update(data)
    .eq('id', tripId)
    .select()
    .single()

  return { data: trip as Trip | null, error }
}

// ── Delete ───────────────────────────────────────────────────

export async function deleteTrip(
  tripId: string,
): Promise<ApiResult> {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)

  return { data: null, error }
}

// ── Archive ──────────────────────────────────────────────────

export async function archiveTrip(
  tripId: string,
): Promise<ApiResult<Trip>> {
  return updateTrip(tripId, { status: 'completed' })
}

// ── Duplicate ────────────────────────────────────────────────
// Deep-clone moved to src/lib/api/duplicate.ts (Item #31)
