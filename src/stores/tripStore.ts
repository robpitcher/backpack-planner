import { create } from 'zustand'
import type { Trip, TripStatus } from '@/types'
import {
  getUserTrips,
  createTrip as apiCreateTrip,
  updateTrip as apiUpdateTrip,
  deleteTrip as apiDeleteTrip,
  archiveTrip as apiArchiveTrip,
} from '@/lib/api/trips'
import type { CreateTripInput, UpdateTripInput } from '@/lib/api/trips'

interface TripState {
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
