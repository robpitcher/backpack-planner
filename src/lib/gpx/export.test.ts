import { describe, it, expect } from 'vitest'
import { buildGPX } from './export'
import type { Trip, Waypoint } from '@/types'

describe('GPX Export', () => {
  describe('buildGPX', () => {
    it('generates valid GPX XML structure', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Test Trip',
        description: 'A test hike',
      }
      const gpx = buildGPX(trip, null, [])
      
      expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(gpx).toContain('<gpx version="1.1"')
      expect(gpx).toContain('<name>Test Trip</name>')
      expect(gpx).toContain('<desc>A test hike</desc>')
      expect(gpx).toContain('</gpx>')
    })

    it('includes waypoints with coordinates', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Trip',
        description: null,
      }
      const waypoints: Waypoint[] = [
        {
          id: 'wp1',
          trip_id: 'trip1',
          user_id: 'user1',
          name: 'Trailhead',
          lat: 38.5,
          lng: -111.0,
          elevation: 2000,
          type: 'trailhead',
          description: 'Start point',
          day_id: null,
          created_at: new Date().toISOString(),
        },
      ]
      
      const gpx = buildGPX(trip, null, waypoints)
      
      expect(gpx).toContain('<wpt lat="38.5" lon="-111">')
      expect(gpx).toContain('<name>Trailhead</name>')
      expect(gpx).toContain('<ele>2000</ele>')
      expect(gpx).toContain('<desc>Start point</desc>')
      expect(gpx).toContain('<type>trailhead</type>')
      expect(gpx).toContain('</wpt>')
    })

    it('handles waypoint without elevation', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Trip',
        description: null,
      }
      const waypoints: Waypoint[] = [
        {
          id: 'wp1',
          trip_id: 'trip1',
          user_id: 'user1',
          name: 'Camp',
          lat: 38.6,
          lng: -111.2,
          elevation: null,
          type: 'campsite',
          description: null,
          day_id: null,
          created_at: new Date().toISOString(),
        },
      ]
      
      const gpx = buildGPX(trip, null, waypoints)
      
      expect(gpx).toContain('<wpt lat="38.6" lon="-111.2">')
      expect(gpx).toContain('<name>Camp</name>')
      expect(gpx).not.toContain('<ele>')
      expect(gpx).not.toContain('<desc>')
    })

    it('includes route track from GeoJSON LineString', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Trail',
        description: null,
      }
      const route = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-111.0, 38.5, 2000],
            [-111.1, 38.6, 2100],
          ],
        },
        properties: {},
      }
      
      const gpx = buildGPX(trip, route, [])
      
      expect(gpx).toContain('<trk>')
      expect(gpx).toContain('<trkseg>')
      expect(gpx).toContain('<trkpt lat="38.5" lon="-111"><ele>2000</ele></trkpt>')
      expect(gpx).toContain('<trkpt lat="38.6" lon="-111.1"><ele>2100</ele></trkpt>')
      expect(gpx).toContain('</trkseg>')
      expect(gpx).toContain('</trk>')
    })

    it('handles route without elevation (2D coordinates)', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Flat Trail',
        description: null,
      }
      const route = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-111.0, 38.5],
            [-111.1, 38.6],
          ],
        },
        properties: {},
      }
      
      const gpx = buildGPX(trip, route, [])
      
      expect(gpx).toContain('<trkpt lat="38.5" lon="-111"></trkpt>')
      expect(gpx).toContain('<trkpt lat="38.6" lon="-111.1"></trkpt>')
    })

    it('escapes XML special characters in names', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Trip <Test> & "More"',
        description: "Description with 'quotes'",
      }
      
      const gpx = buildGPX(trip, null, [])
      
      expect(gpx).toContain('&lt;Test&gt;')
      expect(gpx).toContain('&amp;')
      expect(gpx).toContain('&quot;')
      expect(gpx).toContain('&apos;')
    })

    it('handles empty waypoints and null route', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Empty Trip',
        description: null,
      }
      
      const gpx = buildGPX(trip, null, [])
      
      expect(gpx).toContain('<gpx')
      expect(gpx).toContain('<name>Empty Trip</name>')
      expect(gpx).not.toContain('<wpt')
      expect(gpx).not.toContain('<trk>')
      expect(gpx).toContain('</gpx>')
    })

    it('handles multiple waypoints', () => {
      const trip: Pick<Trip, 'title' | 'description'> = {
        title: 'Multi-Waypoint Trip',
        description: null,
      }
      const waypoints: Waypoint[] = [
        {
          id: 'wp1',
          trip_id: 'trip1',
          user_id: 'user1',
          name: 'Start',
          lat: 38.5,
          lng: -111.0,
          elevation: 2000,
          type: 'trailhead',
          description: null,
          day_id: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'wp2',
          trip_id: 'trip1',
          user_id: 'user1',
          name: 'Camp',
          lat: 38.6,
          lng: -111.1,
          elevation: 2500,
          type: 'campsite',
          description: null,
          day_id: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'wp3',
          trip_id: 'trip1',
          user_id: 'user1',
          name: 'Summit',
          lat: 38.7,
          lng: -111.2,
          elevation: 3000,
          type: 'summit',
          description: null,
          day_id: null,
          created_at: new Date().toISOString(),
        },
      ]
      
      const gpx = buildGPX(trip, null, waypoints)
      
      expect(gpx).toContain('<name>Start</name>')
      expect(gpx).toContain('<name>Camp</name>')
      expect(gpx).toContain('<name>Summit</name>')
      expect((gpx.match(/<wpt/g) || []).length).toBe(3)
    })
  })
})
