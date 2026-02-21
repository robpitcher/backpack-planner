import { create } from 'zustand'
import type {
  Trip,
  TripStatus,
  Day,
  Waypoint,
  GearItem,
  GearTemplate,
  Conditions,
} from '@/types'
import {
  getUserTrips,
  createTrip as apiCreateTrip,
  updateTrip as apiUpdateTrip,
  deleteTrip as apiDeleteTrip,
  archiveTrip as apiArchiveTrip,
} from '@/lib/api/trips'
import type { CreateTripInput, UpdateTripInput } from '@/lib/api/trips'
import {
  fetchGearItems as apiFetchGear,
  createGearItem as apiCreateGear,
  updateGearItem as apiUpdateGear,
  deleteGearItem as apiDeleteGear,
  toggleGearPacked as apiTogglePacked,
  toggleGearWorn as apiToggleWorn,
  fetchGearTemplates as apiFetchTemplates,
  loadGearTemplate as apiLoadTemplate,
} from '@/lib/api/gear'
import type { CreateGearItemInput, UpdateGearItemInput } from '@/lib/api/gear'
import {
  fetchDays as apiFetchDays,
  createDay as apiCreateDay,
  updateDay as apiUpdateDay,
  deleteDay as apiDeleteDay,
  reorderDays as apiReorderDays,
} from '@/lib/api/days'
import type { CreateDayInput, UpdateDayInput } from '@/lib/api/days'
import { assignWaypointToDay as apiAssignWaypoint } from '@/lib/api/waypoints'

// ── Phase 2 state ──────────────────────────────────────────

interface TripPlannerState {
  route: Record<string, unknown> | null
  waypoints: Waypoint[]
  days: Day[]
  gearItems: GearItem[]
  conditions: Conditions | null

  // Route actions
  setRoute: (route: Record<string, unknown> | null) => void

  // Waypoint CRUD
  addWaypoint: (waypoint: Waypoint) => void
  updateWaypoint: (id: string, data: Partial<Waypoint>) => void
  removeWaypoint: (id: string) => void
  setWaypoints: (waypoints: Waypoint[]) => void

  // Day CRUD
  addDay: (day: Day) => void
  updateDay: (id: string, data: Partial<Day>) => void
  removeDay: (id: string) => void
  setDays: (days: Day[]) => void

  // Gear CRUD (local)
  addGearItem: (item: GearItem) => void
  updateGearItem: (id: string, data: Partial<GearItem>) => void
  removeGearItem: (id: string) => void
  setGearItems: (items: GearItem[]) => void

  // Gear API actions
  gearTemplates: GearTemplate[]
  gearError: string | null
  fetchGear: (tripId: string) => Promise<void>
  addGear: (tripId: string, input: CreateGearItemInput) => Promise<GearItem | null>
  updateGear: (itemId: string, updates: UpdateGearItemInput) => Promise<GearItem | null>
  deleteGear: (itemId: string) => Promise<boolean>
  togglePacked: (itemId: string, isPacked: boolean) => Promise<boolean>
  toggleWorn: (itemId: string, isWorn: boolean) => Promise<boolean>
  fetchTemplates: () => Promise<void>
  loadTemplate: (tripId: string, templateId: string) => Promise<boolean>

  // Day API actions
  daysLoading: boolean
  daysError: string | null
  fetchDays: (tripId: string) => Promise<void>
  createDayApi: (tripId: string, input: CreateDayInput) => Promise<Day | null>
  updateDayApi: (dayId: string, updates: UpdateDayInput) => Promise<Day | null>
  deleteDayApi: (dayId: string) => Promise<boolean>
  reorderDaysApi: (tripId: string, dayIds: string[]) => Promise<boolean>

  // Waypoint assignment
  assignWaypointToDay: (
    waypointId: string,
    dayId: string | null,
  ) => Promise<boolean>

  // Conditions
  setConditions: (conditions: Conditions | null) => void
}

interface TripState extends TripPlannerState {
  trips: Trip[]
  isLoading: boolean
  statusFilter: TripStatus | 'all'
  fetchTrips: (userId: string) => Promise<void>
  setFilter: (filter: TripStatus | 'all') => void
  createTrip: (input: CreateTripInput) => Promise<Trip | null>
  updateTrip: (tripId: string, input: UpdateTripInput) => Promise<Trip | null>
  deleteTrip: (tripId: string) => Promise<boolean>
  archiveTrip: (tripId: string) => Promise<boolean>
}

export const useTripStore = create<TripState>()((set, get) => ({
  trips: [],
  isLoading: false,
  statusFilter: 'all',

  // Phase 2 initial state
  route: null,
  waypoints: [],
  days: [],
  gearItems: [],
  gearTemplates: [],
  gearError: null,
  conditions: null,
  daysLoading: false,
  daysError: null,

  // Route actions
  setRoute: (route) => set({ route }),

  // Waypoint CRUD
  addWaypoint: (waypoint) =>
    set({ waypoints: [...get().waypoints, waypoint] }),
  updateWaypoint: (id, data) =>
    set({
      waypoints: get().waypoints.map((w) =>
        w.id === id ? { ...w, ...data } : w,
      ),
    }),
  removeWaypoint: (id) =>
    set({ waypoints: get().waypoints.filter((w) => w.id !== id) }),
  setWaypoints: (waypoints) => set({ waypoints }),

  // Day CRUD
  addDay: (day) => set({ days: [...get().days, day] }),
  updateDay: (id, data) =>
    set({
      days: get().days.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }),
  removeDay: (id) => set({ days: get().days.filter((d) => d.id !== id) }),
  setDays: (days) => set({ days }),

  // Gear CRUD (local)
  addGearItem: (item) => set({ gearItems: [...get().gearItems, item] }),
  updateGearItem: (id, data) =>
    set({
      gearItems: get().gearItems.map((g) =>
        g.id === id ? { ...g, ...data } : g,
      ),
    }),
  removeGearItem: (id) =>
    set({ gearItems: get().gearItems.filter((g) => g.id !== id) }),
  setGearItems: (items) => set({ gearItems: items }),

  // Gear API actions
  fetchGear: async (tripId: string) => {
    set({ gearError: null })
    const { data, error } = await apiFetchGear(tripId)
    if (error) {
      console.error('Failed to fetch gear:', error.message)
      set({ gearError: error.message })
      return
    }
    set({ gearItems: data ?? [] })
  },

  addGear: async (tripId: string, input: CreateGearItemInput) => {
    set({ gearError: null })
    const { data, error } = await apiCreateGear(tripId, input)
    if (error || !data) {
      console.error('Failed to create gear item:', error?.message)
      set({ gearError: error?.message ?? 'Failed to create gear item' })
      return null
    }
    set({ gearItems: [...get().gearItems, data] })
    return data
  },

  updateGear: async (itemId: string, updates: UpdateGearItemInput) => {
    const prev = get().gearItems
    set({
      gearError: null,
      gearItems: prev.map((g) => (g.id === itemId ? { ...g, ...updates } : g)),
    })
    const { data, error } = await apiUpdateGear(itemId, updates)
    if (error || !data) {
      console.error('Failed to update gear item:', error?.message)
      set({ gearItems: prev, gearError: error?.message ?? 'Failed to update gear item' })
      return null
    }
    set({ gearItems: get().gearItems.map((g) => (g.id === itemId ? data : g)) })
    return data
  },

  deleteGear: async (itemId: string) => {
    const prev = get().gearItems
    set({ gearError: null, gearItems: prev.filter((g) => g.id !== itemId) })
    const { error } = await apiDeleteGear(itemId)
    if (error) {
      console.error('Failed to delete gear item:', error.message)
      set({ gearItems: prev, gearError: error.message })
      return false
    }
    return true
  },

  togglePacked: async (itemId: string, isPacked: boolean) => {
    const prev = get().gearItems
    set({
      gearError: null,
      gearItems: prev.map((g) =>
        g.id === itemId ? { ...g, is_packed: isPacked } : g,
      ),
    })
    const { error } = await apiTogglePacked(itemId, isPacked)
    if (error) {
      console.error('Failed to toggle packed:', error.message)
      set({ gearItems: prev, gearError: error.message })
      return false
    }
    return true
  },

  toggleWorn: async (itemId: string, isWorn: boolean) => {
    const prev = get().gearItems
    set({
      gearError: null,
      gearItems: prev.map((g) =>
        g.id === itemId ? { ...g, is_worn: isWorn } : g,
      ),
    })
    const { error } = await apiToggleWorn(itemId, isWorn)
    if (error) {
      console.error('Failed to toggle worn:', error.message)
      set({ gearItems: prev, gearError: error.message })
      return false
    }
    return true
  },

  fetchTemplates: async () => {
    set({ gearError: null })
    const { data, error } = await apiFetchTemplates()
    if (error) {
      console.error('Failed to fetch templates:', error.message)
      set({ gearError: error.message })
      return
    }
    set({ gearTemplates: data ?? [] })
  },

  loadTemplate: async (tripId: string, templateId: string) => {
    set({ gearError: null })
    const { data, error } = await apiLoadTemplate(tripId, templateId)
    if (error || !data) {
      console.error('Failed to load template:', error?.message)
      set({ gearError: error?.message ?? 'Failed to load template' })
      return false
    }
    set({ gearItems: [...get().gearItems, ...data] })
    return true
  },

  // Conditions
  setConditions: (conditions) => set({ conditions }),

  // Day API actions
  fetchDays: async (tripId: string) => {
    set({ daysLoading: true, daysError: null })
    const { data, error } = await apiFetchDays(tripId)
    if (error) {
      console.error('Failed to fetch days:', error.message)
      set({ daysError: error.message, daysLoading: false })
      return
    }
    set({ days: data ?? [], daysLoading: false })
  },

  createDayApi: async (tripId: string, input: CreateDayInput) => {
    set({ daysError: null })
    const { data, error } = await apiCreateDay(tripId, input)
    if (error || !data) {
      console.error('Failed to create day:', error?.message)
      set({ daysError: error?.message ?? 'Failed to create day' })
      return null
    }
    set({ days: [...get().days, data] })
    return data
  },

  updateDayApi: async (dayId: string, updates: UpdateDayInput) => {
    const prev = get().days
    set({
      daysError: null,
      days: prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d)),
    })
    const { data, error } = await apiUpdateDay(dayId, updates)
    if (error || !data) {
      console.error('Failed to update day:', error?.message)
      set({ days: prev, daysError: error?.message ?? 'Failed to update day' })
      return null
    }
    set({ days: get().days.map((d) => (d.id === dayId ? data : d)) })
    return data
  },

  deleteDayApi: async (dayId: string) => {
    const prev = get().days
    // Unassign waypoints from deleted day
    const prevWaypoints = get().waypoints
    set({
      daysError: null,
      days: prev.filter((d) => d.id !== dayId),
      waypoints: prevWaypoints.map((w) =>
        w.day_id === dayId ? { ...w, day_id: null } : w,
      ),
    })
    const { error } = await apiDeleteDay(dayId)
    if (error) {
      console.error('Failed to delete day:', error.message)
      set({ days: prev, waypoints: prevWaypoints, daysError: error.message })
      return false
    }
    return true
  },

  reorderDaysApi: async (tripId: string, dayIds: string[]) => {
    const prev = get().days
    // Optimistic: reorder days locally
    const reordered = dayIds
      .map((id, i) => {
        const day = prev.find((d) => d.id === id)
        return day ? { ...day, day_number: i + 1 } : null
      })
      .filter((d): d is Day => d !== null)
    set({ daysError: null, days: reordered })
    const { data, error } = await apiReorderDays(tripId, dayIds)
    if (error || !data) {
      console.error('Failed to reorder days:', error?.message)
      set({
        days: prev,
        daysError: error?.message ?? 'Failed to reorder days',
      })
      return false
    }
    set({ days: data })
    return true
  },

  assignWaypointToDay: async (
    waypointId: string,
    dayId: string | null,
  ) => {
    const prev = get().waypoints
    set({
      waypoints: prev.map((w) =>
        w.id === waypointId ? { ...w, day_id: dayId } : w,
      ),
    })
    const { data, error } = await apiAssignWaypoint(waypointId, dayId)
    if (error || !data) {
      console.error('Failed to assign waypoint:', error?.message)
      set({ waypoints: prev })
      return false
    }
    set({
      waypoints: get().waypoints.map((w) =>
        w.id === waypointId ? data : w,
      ),
    })
    return true
  },

  fetchTrips: async (userId: string) => {
    set({ isLoading: true })
    const { data, error } = await getUserTrips(userId)
    if (error) {
      console.error('Failed to fetch trips:', error.message)
    }
    set({ trips: data ?? [], isLoading: false })
  },

  setFilter: (filter) => set({ statusFilter: filter }),

  createTrip: async (input: CreateTripInput) => {
    const { data, error } = await apiCreateTrip(input)
    if (error || !data) {
      console.error('Failed to create trip:', error?.message)
      return null
    }
    set({ trips: [data, ...get().trips] })
    return data
  },

  updateTrip: async (tripId: string, input: UpdateTripInput) => {
    // Optimistic update
    const prev = get().trips
    set({
      trips: prev.map((t) => (t.id === tripId ? { ...t, ...input } : t)),
    })
    const { data, error } = await apiUpdateTrip(tripId, input)
    if (error || !data) {
      console.error('Failed to update trip:', error?.message)
      set({ trips: prev }) // rollback
      return null
    }
    // Replace with server-confirmed data
    set({
      trips: get().trips.map((t) => (t.id === tripId ? data : t)),
    })
    return data
  },

  deleteTrip: async (tripId: string) => {
    const prev = get().trips
    set({ trips: prev.filter((t) => t.id !== tripId) })
    const { error } = await apiDeleteTrip(tripId)
    if (error) {
      console.error('Failed to delete trip:', error.message)
      set({ trips: prev }) // rollback
      return false
    }
    return true
  },

  archiveTrip: async (tripId: string) => {
    const prev = get().trips
    set({
      trips: prev.map((t) =>
        t.id === tripId ? { ...t, status: 'completed' as TripStatus } : t,
      ),
    })
    const { data, error } = await apiArchiveTrip(tripId)
    if (error || !data) {
      console.error('Failed to archive trip:', error?.message)
      set({ trips: prev }) // rollback
      return false
    }
    set({
      trips: get().trips.map((t) => (t.id === tripId ? data : t)),
    })
    return true
  },
}))

/** Selector: trips filtered by current status filter */
export function useFilteredTrips(): Trip[] {
  const trips = useTripStore((s) => s.trips)
  const filter = useTripStore((s) => s.statusFilter)
  if (filter === 'all') return trips
  return trips.filter((t) => t.status === filter)
}

// ── Phase 2 Selectors ──────────────────────────────────────

/** Total distance across all days (sum of target_miles) */
export function getTotalDistance(): number {
  const days = useTripStore.getState().days
  return days.reduce((sum, d) => sum + (d.target_miles ?? 0), 0)
}

/** Total elevation gain across all days */
export function getTotalElevationGain(): number {
  const days = useTripStore.getState().days
  return days.reduce((sum, d) => sum + (d.elevation_gain ?? 0), 0)
}

/** Mileage for a specific day */
export function getDayMileage(dayId: string): number {
  const day = useTripStore.getState().days.find((d) => d.id === dayId)
  return day?.target_miles ?? 0
}

/** Gear weight breakdown: base, worn, packed, total (all in oz) */
export function getGearWeights(): {
  base: number
  worn: number
  packed: number
  total: number
} {
  const items = useTripStore.getState().gearItems
  let worn = 0
  let packed = 0

  for (const item of items) {
    const weight = item.weight_oz * item.quantity
    if (item.is_worn) worn += weight
    if (item.is_packed) packed += weight
  }

  // Base weight = packed gear (not worn, not consumable)
  const base = packed
  const total = worn + packed

  return { base, worn, packed, total }
}
