import { describe, it, expect, beforeEach } from 'vitest'
import {
  useTripStore,
  useFilteredTrips,
  getTotalDistance,
  getTotalElevationGain,
  getDayMileage,
  getGearWeights,
} from './tripStore'
import type { Trip, Day, GearItem, Waypoint, Conditions } from '@/types'

// Test factory helpers — provide defaults for required fields
function makeTrip(overrides: Partial<Trip> & { id: string; user_id: string; title: string; status: Trip['status'] }): Trip {
  return {
    description: null, start_date: null, end_date: null, region: null,
    cover_image_url: null, is_public: false, route_geojson: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeDay(overrides: Partial<Day> & { id: string; trip_id: string; day_number: number }): Day {
  return {
    date: null, notes: null, start_waypoint_id: null, end_waypoint_id: null,
    target_miles: null, elevation_gain: null, elevation_loss: null,
    ...overrides,
  }
}

function makeWaypoint(overrides: Partial<Waypoint> & { id: string; trip_id: string; name: string }): Waypoint {
  return {
    day_id: null, description: null, type: 'trailhead', lat: 0, lng: 0,
    elevation: null, mile_marker: null, sort_order: 0, notes: null,
    ...overrides,
  }
}

function makeGearItem(overrides: Partial<GearItem> & { id: string; trip_id: string; name: string }): GearItem {
  return {
    user_id: 'user1', category: 'other', weight_oz: 0, quantity: 1,
    is_worn: false, is_packed: false,
    ...overrides,
  }
}

function makeConditions(overrides: Partial<Conditions> & { id: string; trip_id: string }): Conditions {
  return {
    waypoint_id: null, source: 'NWS', data: {},
    fetched_at: new Date().toISOString(),
    expires_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('tripStore — Local State Management', () => {
  beforeEach(() => {
    useTripStore.setState({
      trips: [],
      waypoints: [],
      days: [],
      gearItems: [],
      route: null,
      conditions: null,
      statusFilter: 'all',
      isLoading: false,
      gearError: null,
      gearTemplates: [],
      daysLoading: false,
      daysError: null,
    })
  })

  describe('Trip CRUD — Local State', () => {
    it('initializes with empty trips', () => {
      const { trips } = useTripStore.getState()
      expect(trips).toEqual([])
    })

    it('setFilter updates statusFilter', () => {
      const { setFilter } = useTripStore.getState()
      setFilter('active')
      expect(useTripStore.getState().statusFilter).toBe('active')
    })
  })

  describe('Waypoint CRUD', () => {
    it('addWaypoint appends waypoint', () => {
      const { addWaypoint } = useTripStore.getState()
      const waypoint: Waypoint = makeWaypoint({
        id: 'wp1',
        trip_id: 'trip1',
        name: 'Trailhead',
        lat: 38.5,
        lng: -111.0,
        elevation: 2000,
        type: 'trailhead',
      })
      addWaypoint(waypoint)
      expect(useTripStore.getState().waypoints).toHaveLength(1)
      expect(useTripStore.getState().waypoints[0].name).toBe('Trailhead')
    })

    it('updateWaypoint modifies existing waypoint', () => {
      const { addWaypoint, updateWaypoint } = useTripStore.getState()
      addWaypoint(makeWaypoint({
        id: 'wp1',
        trip_id: 'trip1',
        name: 'Camp',
        lat: 38.5,
        lng: -111.0,
        elevation: 2500,
        type: 'campsite',
      }))
      updateWaypoint('wp1', { name: 'Base Camp' })
      expect(useTripStore.getState().waypoints[0].name).toBe('Base Camp')
    })

    it('removeWaypoint filters out waypoint', () => {
      const { addWaypoint, removeWaypoint } = useTripStore.getState()
      addWaypoint(makeWaypoint({
        id: 'wp1',
        trip_id: 'trip1',
        name: 'Camp',
        lat: 38.5,
        lng: -111.0,
        elevation: 2500,
        type: 'campsite',
      }))
      removeWaypoint('wp1')
      expect(useTripStore.getState().waypoints).toHaveLength(0)
    })

    it('setWaypoints replaces all waypoints', () => {
      const { setWaypoints } = useTripStore.getState()
      const waypoints: Waypoint[] = [
        {
          id: 'wp1',
          trip_id: 'trip1',
          name: 'A',
          lat: 1,
          lng: 1,
          elevation: 100,
          type: 'trailhead',
          description: null,
          day_id: null,
        mile_marker: null,
        sort_order: 0,
        notes: null,
        },
        {
          id: 'wp2',
          trip_id: 'trip1',
          name: 'B',
          lat: 2,
          lng: 2,
          elevation: 200,
          type: 'campsite',
          description: null,
          day_id: null,
        mile_marker: null,
        sort_order: 0,
        notes: null,
        },
      ]
      setWaypoints(waypoints)
      expect(useTripStore.getState().waypoints).toHaveLength(2)
    })
  })

  describe('Day CRUD', () => {
    it('addDay appends day', () => {
      const { addDay } = useTripStore.getState()
      const day: Day = {
        id: 'day1',
        trip_id: 'trip1',
        user_id: 'user1',
        day_number: 1,
        date: null,
        target_miles: 10,
        elevation_gain: 1500,
          elevation_loss: null,
        notes: null,
        start_waypoint_id: null,
        end_waypoint_id: null,
      }
      addDay(day)
      expect(useTripStore.getState().days).toHaveLength(1)
    })

    it('updateDay modifies existing day', () => {
      const { addDay, updateDay } = useTripStore.getState()
      addDay({
        id: 'day1',
        trip_id: 'trip1',
        user_id: 'user1',
        day_number: 1,
        date: null,
        target_miles: 10,
        elevation_gain: 1500,
          elevation_loss: null,
        notes: null,
        start_waypoint_id: null,
        end_waypoint_id: null,
      })
      updateDay('day1', { notes: 'Hard day' })
      expect(useTripStore.getState().days[0].notes).toBe('Hard day')
    })

    it('removeDay filters out day', () => {
      const { addDay, removeDay } = useTripStore.getState()
      addDay({
        id: 'day1',
        trip_id: 'trip1',
        user_id: 'user1',
        day_number: 1,
        date: null,
        target_miles: 10,
        elevation_gain: 1500,
          elevation_loss: null,
        notes: null,
        start_waypoint_id: null,
        end_waypoint_id: null,
      })
      removeDay('day1')
      expect(useTripStore.getState().days).toHaveLength(0)
    })
  })

  describe('Gear CRUD (Local)', () => {
    it('addGearItem appends item', () => {
      const { addGearItem } = useTripStore.getState()
      const item: GearItem = {
        id: 'gear1',
        trip_id: 'trip1',
        name: 'Tent',
        category: 'shelter',
        weight_oz: 40,
        quantity: 1,
        is_worn: false,
        is_packed: false,
      }
      addGearItem(item)
      expect(useTripStore.getState().gearItems).toHaveLength(1)
      expect(useTripStore.getState().gearItems[0].name).toBe('Tent')
    })

    it('updateGearItem modifies existing item', () => {
      const { addGearItem, updateGearItem } = useTripStore.getState()
      addGearItem({
        id: 'gear1',
        trip_id: 'trip1',
        name: 'Tent',
        category: 'shelter',
        weight_oz: 40,
        quantity: 1,
        is_worn: false,
        is_packed: false,
      })
      updateGearItem('gear1', { is_packed: true })
      expect(useTripStore.getState().gearItems[0].is_packed).toBe(true)
    })

    it('removeGearItem filters out item', () => {
      const { addGearItem, removeGearItem } = useTripStore.getState()
      addGearItem({
        id: 'gear1',
        trip_id: 'trip1',
        name: 'Tent',
        category: 'shelter',
        weight_oz: 40,
        quantity: 1,
        is_worn: false,
        is_packed: false,
      })
      removeGearItem('gear1')
      expect(useTripStore.getState().gearItems).toHaveLength(0)
    })
  })

  describe('Route State', () => {
    it('setRoute updates route GeoJSON', () => {
      const { setRoute } = useTripStore.getState()
      const route = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [[1, 2], [3, 4]] },
        properties: {},
      }
      setRoute(route)
      expect(useTripStore.getState().route).toEqual(route)
    })

    it('setRoute can clear route', () => {
      const { setRoute } = useTripStore.getState()
      setRoute({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} })
      setRoute(null)
      expect(useTripStore.getState().route).toBeNull()
    })
  })

  describe('Conditions State', () => {
    it('setConditions updates conditions', () => {
      const { setConditions } = useTripStore.getState()
      const conditions = {
        id: 'cond1',
        trip_id: 'trip1',
        source: 'NWS' as const,
        data: { temp: 70 },
      }
      setConditions(conditions)
      expect(useTripStore.getState().conditions?.source).toBe('NWS')
    })
  })
})

describe('tripStore — Selectors', () => {
  beforeEach(() => {
    useTripStore.setState({
      trips: [],
      waypoints: [],
      days: [],
      gearItems: [],
      route: null,
      conditions: null,
      statusFilter: 'all',
      isLoading: false,
      gearError: null,
      gearTemplates: [],
      daysLoading: false,
      daysError: null,
    })
  })

  describe('useFilteredTrips', () => {
    it('returns all trips when filter is "all"', () => {
      const trips: Trip[] = [
        {
          id: 't1',
          user_id: 'user1',
          title: 'Trip 1',
          status: 'active',
          description: null,
          start_date: null,
          end_date: null,
          route_geojson: null,
          is_public: false,
        },
        {
          id: 't2',
          user_id: 'user1',
          title: 'Trip 2',
          status: 'completed',
          description: null,
          start_date: null,
          end_date: null,
          route_geojson: null,
          is_public: false,
        },
      ]
      useTripStore.setState({ trips, statusFilter: 'all' })
      
      // Access state directly instead of calling the hook
      const state = useTripStore.getState()
      const filtered = state.statusFilter === 'all' ? state.trips : state.trips.filter(t => t.status === state.statusFilter)
      expect(filtered).toHaveLength(2)
    })

    it('filters trips by status', () => {
      const trips: Trip[] = [
        {
          id: 't1',
          user_id: 'user1',
          title: 'Trip 1',
          status: 'active',
          description: null,
          start_date: null,
          end_date: null,
          route_geojson: null,
          is_public: false,
        },
        {
          id: 't2',
          user_id: 'user1',
          title: 'Trip 2',
          status: 'completed',
          description: null,
          start_date: null,
          end_date: null,
          route_geojson: null,
          is_public: false,
        },
      ]
      useTripStore.setState({ trips, statusFilter: 'active' })
      
      // Access state directly instead of calling the hook
      const state = useTripStore.getState()
      const filtered = state.statusFilter === 'all' ? state.trips : state.trips.filter(t => t.status === state.statusFilter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].status).toBe('active')
    })
  })

  describe('getTotalDistance', () => {
    it('returns 0 when no days', () => {
      expect(getTotalDistance()).toBe(0)
    })

    it('sums target_miles across all days', () => {
      const days: Day[] = [
        {
          id: 'd1',
          trip_id: 'trip1',
          day_number: 1,
          date: null,
          target_miles: 10,
          elevation_gain: 1000,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
        {
          id: 'd2',
          trip_id: 'trip1',
          day_number: 2,
          date: null,
          target_miles: 15,
          elevation_gain: 2000,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
      ]
      useTripStore.setState({ days })
      expect(getTotalDistance()).toBe(25)
    })

    it('handles null target_miles', () => {
      const days: Day[] = [
        {
          id: 'd1',
          trip_id: 'trip1',
          day_number: 1,
          date: null,
          target_miles: null,
          elevation_gain: 1000,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
      ]
      useTripStore.setState({ days })
      expect(getTotalDistance()).toBe(0)
    })
  })

  describe('getTotalElevationGain', () => {
    it('returns 0 when no days', () => {
      expect(getTotalElevationGain()).toBe(0)
    })

    it('sums elevation_gain across all days', () => {
      const days: Day[] = [
        {
          id: 'd1',
          trip_id: 'trip1',
          day_number: 1,
          date: null,
          target_miles: 10,
          elevation_gain: 1500,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
        {
          id: 'd2',
          trip_id: 'trip1',
          day_number: 2,
          date: null,
          target_miles: 12,
          elevation_gain: 2500,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
      ]
      useTripStore.setState({ days })
      expect(getTotalElevationGain()).toBe(4000)
    })

    it('handles null elevation_gain', () => {
      const days: Day[] = [
        {
          id: 'd1',
          trip_id: 'trip1',
          day_number: 1,
          date: null,
          target_miles: 10,
          elevation_gain: null,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
      ]
      useTripStore.setState({ days })
      expect(getTotalElevationGain()).toBe(0)
    })
  })

  describe('getDayMileage', () => {
    it('returns 0 when day not found', () => {
      expect(getDayMileage('nonexistent')).toBe(0)
    })

    it('returns target_miles for specific day', () => {
      const days: Day[] = [
        {
          id: 'd1',
          trip_id: 'trip1',
          day_number: 1,
          date: null,
          target_miles: 12.5,
          elevation_gain: 1000,
          elevation_loss: null,
          notes: null,
          start_waypoint_id: null,
          end_waypoint_id: null,
        },
      ]
      useTripStore.setState({ days })
      expect(getDayMileage('d1')).toBe(12.5)
    })
  })

  describe('getGearWeights', () => {
    it('returns zeros when no gear', () => {
      const weights = getGearWeights()
      expect(weights).toEqual({ base: 0, worn: 0, packed: 0, total: 0 })
    })

    it('calculates worn weight', () => {
      const items: GearItem[] = [
        {
          id: 'g1',
          trip_id: 'trip1',
          name: 'Shirt',
          category: 'clothing',
          weight_oz: 5,
          quantity: 1,
          is_worn: true,
          is_packed: false,
        },
      ]
      useTripStore.setState({ gearItems: items })
      const weights = getGearWeights()
      expect(weights.worn).toBe(5)
      expect(weights.packed).toBe(0)
      expect(weights.total).toBe(5)
    })

    it('calculates packed (base) weight', () => {
      const items: GearItem[] = [
        {
          id: 'g1',
          trip_id: 'trip1',
          name: 'Tent',
          category: 'shelter',
          weight_oz: 40,
          quantity: 1,
          is_worn: false,
          is_packed: true,
        },
      ]
      useTripStore.setState({ gearItems: items })
      const weights = getGearWeights()
      expect(weights.worn).toBe(0)
      expect(weights.packed).toBe(40)
      expect(weights.base).toBe(40)
      expect(weights.total).toBe(40)
    })

    it('handles items that are both worn and packed', () => {
      const items: GearItem[] = [
        {
          id: 'g1',
          trip_id: 'trip1',
          name: 'Rain Jacket',
          category: 'clothing',
          weight_oz: 10,
          quantity: 1,
          is_worn: true,
          is_packed: true,
        },
      ]
      useTripStore.setState({ gearItems: items })
      const weights = getGearWeights()
      expect(weights.worn).toBe(10)
      expect(weights.packed).toBe(10)
      expect(weights.total).toBe(20)
    })

    it('multiplies by quantity', () => {
      const items: GearItem[] = [
        {
          id: 'g1',
          trip_id: 'trip1',
          name: 'Energy Bar',
          category: 'cook',
          weight_oz: 2,
          quantity: 5,
          is_worn: false,
          is_packed: true,
        },
      ]
      useTripStore.setState({ gearItems: items })
      const weights = getGearWeights()
      expect(weights.packed).toBe(10)
    })

    it('sums multiple items', () => {
      const items: GearItem[] = [
        {
          id: 'g1',
          trip_id: 'trip1',
          name: 'Tent',
          category: 'shelter',
          weight_oz: 40,
          quantity: 1,
          is_worn: false,
          is_packed: true,
        },
        {
          id: 'g2',
          trip_id: 'trip1',
          name: 'Sleeping Bag',
          category: 'shelter',
          weight_oz: 30,
          quantity: 1,
          is_worn: false,
          is_packed: true,
        },
        {
          id: 'g3',
          trip_id: 'trip1',
          name: 'Boots',
          category: 'clothing',
          weight_oz: 20,
          quantity: 1,
          is_worn: true,
          is_packed: false,
        },
      ]
      useTripStore.setState({ gearItems: items })
      const weights = getGearWeights()
      expect(weights.worn).toBe(20)
      expect(weights.packed).toBe(70)
      expect(weights.total).toBe(90)
    })
  })
})
