import { describe, it, expect } from 'vitest'
import { parseGPX } from './import'

describe('GPX Import', () => {
  describe('parseGPX', () => {
    it('parses valid GPX with track and waypoints', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <ele>2000</ele>
    <name>Trailhead</name>
  </wpt>
  <trk>
    <name>Trail Route</name>
    <trkseg>
      <trkpt lat="38.5" lon="-111.0"><ele>2000</ele></trkpt>
      <trkpt lat="38.6" lon="-111.1"><ele>2100</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.route).not.toBeNull()
      expect(result.route?.geometry.type).toBe('LineString')
      expect(result.waypoints).toHaveLength(1)
      expect(result.waypoints[0].name).toBe('Trailhead')
      expect(result.waypoints[0].lat).toBe(38.5)
      expect(result.waypoints[0].lng).toBe(-111.0)
      expect(result.waypoints[0].elevation).toBe(2000)
    })

    it('handles GPX with no track', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <name>Point A</name>
  </wpt>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.route).toBeNull()
      expect(result.waypoints).toHaveLength(1)
    })

    it('handles GPX with no waypoints', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
      <trkpt lat="38.5" lon="-111.0"><ele>2000</ele></trkpt>
      <trkpt lat="38.6" lon="-111.1"><ele>2100</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.route).not.toBeNull()
      expect(result.waypoints).toHaveLength(0)
    })

    it('throws error on invalid XML', () => {
      const invalidGPX = 'This is not XML'

      expect(() => parseGPX(invalidGPX)).toThrow('Invalid GPX file')
    })

    it('throws error on malformed GPX', () => {
      const malformedGPX = '<?xml version="1.0"?><gpx><unclosed>'

      expect(() => parseGPX(malformedGPX)).toThrow('Invalid GPX file')
    })

    it('assigns default waypoint name if missing', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <ele>2000</ele>
  </wpt>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.waypoints[0].name).toBe('Waypoint')
    })

    it('handles waypoint without elevation', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <name>Flat Point</name>
  </wpt>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.waypoints[0].elevation).toBeNull()
    })

    it('assigns poi type to all imported waypoints', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <name>A</name>
  </wpt>
  <wpt lat="38.6" lon="-111.1">
    <name>B</name>
  </wpt>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.waypoints[0].type).toBe('poi')
      expect(result.waypoints[1].type).toBe('poi')
    })

    it('flattens MultiLineString to LineString', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
      <trkpt lat="38.5" lon="-111.0"></trkpt>
      <trkpt lat="38.6" lon="-111.1"></trkpt>
    </trkseg>
    <trkseg>
      <trkpt lat="38.7" lon="-111.2"></trkpt>
      <trkpt lat="38.8" lon="-111.3"></trkpt>
    </trkseg>
  </trk>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.route).not.toBeNull()
      expect(result.route?.geometry.type).toBe('LineString')
      const coords = (result.route?.geometry as GeoJSON.LineString).coordinates
      expect(coords.length).toBeGreaterThan(2)
    })

    it('handles empty GPX file', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.route).toBeNull()
      expect(result.waypoints).toHaveLength(0)
    })

    it('handles multiple waypoints with varied data', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <ele>2000</ele>
    <name>Start</name>
  </wpt>
  <wpt lat="38.6" lon="-111.1">
    <name>Middle</name>
  </wpt>
  <wpt lat="38.7" lon="-111.2">
    <ele>3000</ele>
    <name>End</name>
  </wpt>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.waypoints).toHaveLength(3)
      expect(result.waypoints[0].elevation).toBe(2000)
      expect(result.waypoints[1].elevation).toBeNull()
      expect(result.waypoints[2].elevation).toBe(3000)
    })

    it('extracts coordinates in correct order (lng, lat, ele)', () => {
      const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="38.5" lon="-111.0">
    <ele>2000</ele>
    <name>Test</name>
  </wpt>
</gpx>`

      const result = parseGPX(gpxString)

      expect(result.waypoints[0].lat).toBe(38.5)
      expect(result.waypoints[0].lng).toBe(-111.0)
    })
  })
})
