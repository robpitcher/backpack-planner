import { supabase } from '@/lib/supabase'
import type { Day } from '@/types/index'
import type { PostgrestError } from '@supabase/supabase-js'

// ── Result wrapper ───────────────────────────────────────────

export interface ApiResult<T = void> {
  data: T | null
  error: PostgrestError | null
}

// ── Input types ──────────────────────────────────────────────

export type CreateDayInput = {
  day_number: number
  date?: string | null
  notes?: string | null
  start_waypoint_id?: string | null
  end_waypoint_id?: string | null
  target_miles?: number | null
  elevation_gain?: number | null
  elevation_loss?: number | null
}

export type UpdateDayInput = Partial<
  Omit<Day, 'id' | 'trip_id'>
>

// ── Fetch days for a trip ────────────────────────────────────

export async function fetchDays(
  tripId: string,
): Promise<ApiResult<Day[]>> {
  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number')

  return { data: (data as Day[]) ?? null, error }
}

// ── Create day ───────────────────────────────────────────────

export async function createDay(
  tripId: string,
  day: CreateDayInput,
): Promise<ApiResult<Day>> {
  const { data, error } = await supabase
    .from('days')
    .insert({
      trip_id: tripId,
      day_number: day.day_number,
      date: day.date ?? null,
      notes: day.notes ?? null,
      start_waypoint_id: day.start_waypoint_id ?? null,
      end_waypoint_id: day.end_waypoint_id ?? null,
      target_miles: day.target_miles ?? null,
      elevation_gain: day.elevation_gain ?? null,
      elevation_loss: day.elevation_loss ?? null,
    })
    .select()
    .single()

  return { data: data as Day | null, error }
}

// ── Update day ───────────────────────────────────────────────

export async function updateDay(
  dayId: string,
  updates: UpdateDayInput,
): Promise<ApiResult<Day>> {
  const { data, error } = await supabase
    .from('days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single()

  return { data: data as Day | null, error }
}

// ── Delete day ───────────────────────────────────────────────

export async function deleteDay(
  dayId: string,
): Promise<ApiResult> {
  const { error } = await supabase
    .from('days')
    .delete()
    .eq('id', dayId)

  return { data: null, error }
}

// ── Reorder days ─────────────────────────────────────────────

export async function reorderDays(
  tripId: string,
  dayIds: string[],
): Promise<ApiResult<Day[]>> {
  // Batch update day_number for each day based on position in array
  const updates = dayIds.map((id, index) =>
    supabase
      .from('days')
      .update({ day_number: index + 1 })
      .eq('id', id)
      .eq('trip_id', tripId)
      .select()
      .single()
  )

  const results = await Promise.all(updates)
  const errors = results.filter((r) => r.error)
  if (errors.length > 0) {
    return { data: null, error: errors[0].error }
  }

  const days = results
    .map((r) => r.data as Day)
    .sort((a, b) => a.day_number - b.day_number)

  return { data: days, error: null }
}
