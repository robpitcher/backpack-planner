import { supabase } from '@/lib/supabase'
import type { Trip, Day, Waypoint, GearItem } from '@/types/index'
import type { PostgrestError } from '@supabase/supabase-js'

export interface ApiResult<T = void> {
  data: T | null
  error: PostgrestError | null
}

/**
 * Deep-clone a trip with all related data: days, waypoints, gear items, route.
 * New trip gets a fresh UUID, draft status, and is_public=false.
 */
export async function duplicateTrip(
  tripId: string,
  newTitle: string,
): Promise<ApiResult<Trip>> {
  // 1. Fetch source trip
  const { data: source, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (tripError || !source) {
    return { data: null, error: tripError }
  }

  const srcTrip = source as Trip

  // 2. Create new trip record
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated', details: '', hint: '', code: 'AUTH' } as PostgrestError }

  const { data: newTrip, error: createError } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title: newTitle,
      description: srcTrip.description,
      status: 'draft',
      start_date: srcTrip.start_date,
      end_date: srcTrip.end_date,
      region: srcTrip.region,
      cover_image_url: srcTrip.cover_image_url,
      is_public: false,
      route_geojson: srcTrip.route_geojson,
    })
    .select()
    .single()

  if (createError || !newTrip) {
    return { data: null, error: createError }
  }

  const trip = newTrip as Trip

  // 3. Copy days and build old→new ID mapping
  const { data: srcDays } = await supabase
    .from('days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number')

  const dayIdMap = new Map<string, string>()

  if (srcDays && srcDays.length > 0) {
    const dayRows = (srcDays as Day[]).map((d) => ({
      trip_id: trip.id,
      day_number: d.day_number,
      date: d.date,
      notes: d.notes,
      target_miles: d.target_miles,
      elevation_gain: d.elevation_gain,
      elevation_loss: d.elevation_loss,
      // start/end waypoint refs cleared — will be set after waypoints are copied
      start_waypoint_id: null,
      end_waypoint_id: null,
    }))

    const { data: newDays } = await supabase
      .from('days')
      .insert(dayRows)
      .select()

    if (newDays) {
      const sortedSrc = (srcDays as Day[]).sort(
        (a, b) => a.day_number - b.day_number,
      )
      const sortedNew = (newDays as Day[]).sort(
        (a, b) => a.day_number - b.day_number,
      )
      sortedSrc.forEach((s, i) => {
        if (sortedNew[i]) dayIdMap.set(s.id, sortedNew[i].id)
      })
    }
  }

  // 4. Copy waypoints with remapped day IDs
  const { data: srcWaypoints } = await supabase
    .from('waypoints')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order')

  if (srcWaypoints && srcWaypoints.length > 0) {
    const wpRows = (srcWaypoints as Waypoint[]).map((w) => ({
      trip_id: trip.id,
      day_id: w.day_id ? (dayIdMap.get(w.day_id) ?? null) : null,
      name: w.name,
      description: w.description,
      type: w.type,
      lat: w.lat,
      lng: w.lng,
      elevation: w.elevation,
      mile_marker: w.mile_marker,
      sort_order: w.sort_order,
      notes: w.notes,
    }))

    await supabase.from('waypoints').insert(wpRows)
  }

  // 5. Copy gear items
  const { data: srcGear } = await supabase
    .from('gear_items')
    .select('*')
    .eq('trip_id', tripId)

  if (srcGear && srcGear.length > 0) {
    const gearRows = (srcGear as GearItem[]).map((g) => ({
      trip_id: trip.id,
      name: g.name,
      category: g.category,
      weight_oz: g.weight_oz,
      quantity: g.quantity,
      is_worn: g.is_worn,
      is_packed: false, // reset packing status for the copy
    }))

    await supabase.from('gear_items').insert(gearRows)
  }

  return { data: trip, error: null }
}
