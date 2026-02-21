import { supabase } from '@/lib/supabase'
import type { Waypoint, WaypointType } from '@/types/index'
import type { PostgrestError } from '@supabase/supabase-js'

// ── Result wrapper ───────────────────────────────────────────

export interface ApiResult<T = void> {
  data: T | null
  error: PostgrestError | null
}

// ── Input types ──────────────────────────────────────────────

export type CreateWaypointInput = {
  name: string
  type: WaypointType
  lat: number
  lng: number
  day_id?: string | null
  description?: string | null
  elevation?: number | null
  mile_marker?: number | null
  sort_order?: number
  notes?: string | null
}

export type UpdateWaypointInput = Partial<
  Omit<Waypoint, 'id' | 'trip_id'>
>

// ── Fetch waypoints for a trip ───────────────────────────────

export async function fetchWaypoints(
  tripId: string,
): Promise<ApiResult<Waypoint[]>> {
  const { data, error } = await supabase
    .from('waypoints')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order')

  return { data: (data as Waypoint[]) ?? null, error }
}

// ── Create waypoint ──────────────────────────────────────────

export async function createWaypoint(
  tripId: string,
  waypoint: CreateWaypointInput,
): Promise<ApiResult<Waypoint>> {
  const { data, error } = await supabase
    .from('waypoints')
    .insert({
      trip_id: tripId,
      name: waypoint.name,
      type: waypoint.type,
      lat: waypoint.lat,
      lng: waypoint.lng,
      day_id: waypoint.day_id ?? null,
      description: waypoint.description ?? null,
      elevation: waypoint.elevation ?? null,
      mile_marker: waypoint.mile_marker ?? null,
      sort_order: waypoint.sort_order ?? 0,
      notes: waypoint.notes ?? null,
    })
    .select()
    .single()

  return { data: data as Waypoint | null, error }
}

// ── Update waypoint ──────────────────────────────────────────

export async function updateWaypoint(
  waypointId: string,
  updates: UpdateWaypointInput,
): Promise<ApiResult<Waypoint>> {
  const { data, error } = await supabase
    .from('waypoints')
    .update(updates)
    .eq('id', waypointId)
    .select()
    .single()

  return { data: data as Waypoint | null, error }
}

// ── Delete waypoint ──────────────────────────────────────────

export async function deleteWaypoint(
  waypointId: string,
): Promise<ApiResult> {
  const { error } = await supabase
    .from('waypoints')
    .delete()
    .eq('id', waypointId)

  return { data: null, error }
}

// ── Assign waypoint to a day ─────────────────────────────────

export async function assignWaypointToDay(
  waypointId: string,
  dayId: string | null,
): Promise<ApiResult<Waypoint>> {
  return updateWaypoint(waypointId, { day_id: dayId })
}
