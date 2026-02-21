import { gpx } from '@tmcw/togeojson'
import type { WaypointType } from '@/types'

export interface GPXImportResult {
  route: GeoJSON.Feature | null
  waypoints: GPXWaypoint[]
}

export interface GPXWaypoint {
  name: string
  lat: number
  lng: number
  elevation: number | null
  type: WaypointType
}

/**
 * Parse a GPX XML string into structured route + waypoint data.
 */
export function parseGPX(gpxString: string): GPXImportResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(gpxString, 'application/xml')

  // Check for XML parse errors
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Invalid GPX file: could not parse XML')
  }

  const geojson = gpx(doc)

  // Extract first LineString/MultiLineString feature as the route
  let route: GeoJSON.Feature | null = null
  for (const feature of geojson.features) {
    const gType = feature.geometry.type
    if (gType === 'LineString' || gType === 'MultiLineString') {
      if (gType === 'MultiLineString') {
        // Flatten to first LineString segment
        const coords = (feature.geometry as GeoJSON.MultiLineString).coordinates
        if (coords.length > 0) {
          route = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords.flat() },
            properties: feature.properties ?? {},
          }
        }
      } else {
        route = feature
      }
      break
    }
  }

  // Extract Point features as waypoints
  const waypoints: GPXWaypoint[] = geojson.features
    .filter((f) => f.geometry.type === 'Point')
    .map((f) => {
      const [lng, lat, ele] = (f.geometry as GeoJSON.Point).coordinates
      return {
        name: (f.properties?.name as string) || 'Waypoint',
        lat,
        lng,
        elevation: ele != null ? ele : null,
        type: 'poi' as WaypointType,
      }
    })

  return { route, waypoints }
}
