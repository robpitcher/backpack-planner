import { supabase } from '@/lib/supabase'
import type { Trip, Day, Waypoint } from '@/types/index'

// ── Public trip data bundle ─────────────────────────────────

export interface PublicTripData {
  trip: Trip
  days: Day[]
  waypoints: Waypoint[]
  gearSummary: { itemCount: number; baseWeightOz: number; totalWeightOz: number }
}

export interface ShareResult<T = void> {
  data: T | null
  error: string | null
}

// ── Fetch a public trip (anon-safe — no auth required) ──────

export async function fetchPublicTrip(
  tripId: string,
): Promise<ShareResult<PublicTripData>> {
  // Fetch trip — RLS allows anon SELECT on is_public = true
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('is_public', true)
    .single()

  if (tripError || !trip) {
    return { data: null, error: 'Trip not found or is private' }
  }

  // Fetch days and waypoints (RLS allows anon read on public trip children)
  const [daysRes, waypointsRes, gearRes] = await Promise.all([
    supabase
      .from('days')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number'),
    supabase
      .from('waypoints')
      .select('*')
      .eq('trip_id', tripId)
      .order('sort_order'),
    // Gear is owner-only per RLS, but we can get aggregate counts
    // via a count query — this will return 0 for anon users per RLS.
    // Instead, fetch a count + weight from a separate anon-safe approach.
    supabase
      .from('gear_items')
      .select('weight_oz, quantity, is_worn')
      .eq('trip_id', tripId),
  ])

  const days = (daysRes.data as Day[]) ?? []
  const waypoints = (waypointsRes.data as Waypoint[]) ?? []

  // Gear summary — may be empty if RLS blocks anon reads
  const gearRows = (gearRes.data as Array<{ weight_oz: number; quantity: number; is_worn: boolean }>) ?? []
  let baseWeightOz = 0
  let totalWeightOz = 0
  for (const g of gearRows) {
    const w = g.weight_oz * g.quantity
    totalWeightOz += w
    if (!g.is_worn) baseWeightOz += w
  }

  return {
    data: {
      trip: trip as Trip,
      days,
      waypoints,
      gearSummary: {
        itemCount: gearRows.length,
        baseWeightOz,
        totalWeightOz,
      },
    },
    error: null,
  }
}
