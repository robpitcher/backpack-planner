import type { Trip, Waypoint } from '@/types'

/**
 * Convert trip route (GeoJSON) + waypoints to a GPX 1.1 XML string.
 */
export function buildGPX(
  trip: Pick<Trip, 'title' | 'description'>,
  routeGeoJSON: Record<string, unknown> | null,
  waypoints: Waypoint[],
): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="TrailForge" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <metadata>',
    `    <name>${escapeXml(trip.title)}</name>`,
  ]

  if (trip.description) {
    lines.push(`    <desc>${escapeXml(trip.description)}</desc>`)
  }
  lines.push('  </metadata>')

  // Waypoints
  for (const wp of waypoints) {
    lines.push(`  <wpt lat="${wp.lat}" lon="${wp.lng}">`)
    lines.push(`    <name>${escapeXml(wp.name)}</name>`)
    if (wp.elevation != null) {
      lines.push(`    <ele>${wp.elevation}</ele>`)
    }
    if (wp.description) {
      lines.push(`    <desc>${escapeXml(wp.description)}</desc>`)
    }
    lines.push(`    <type>${escapeXml(wp.type)}</type>`)
    lines.push('  </wpt>')
  }

  // Route track from GeoJSON
  const coords = extractCoordinates(routeGeoJSON)
  if (coords.length > 0) {
    lines.push('  <trk>')
    lines.push(`    <name>${escapeXml(trip.title)}</name>`)
    lines.push('    <trkseg>')
    for (const coord of coords) {
      const [lon, lat, ele] = coord
      let trkpt = `      <trkpt lat="${lat}" lon="${lon}">`
      if (ele != null) {
        trkpt += `<ele>${ele}</ele>`
      }
      trkpt += '</trkpt>'
      lines.push(trkpt)
    }
    lines.push('    </trkseg>')
    lines.push('  </trk>')
  }

  lines.push('</gpx>')
  return lines.join('\n')
}

function extractCoordinates(
  geojson: Record<string, unknown> | null,
): number[][] {
  if (!geojson) return []
  const geometry = geojson.geometry as
    | { type: string; coordinates: number[][] }
    | undefined
  if (!geometry) return []
  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates
  }
  return []
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Trigger a browser file download for a GPX string.
 */
export function downloadGPX(
  gpxContent: string,
  tripName: string,
): void {
  const date = new Date().toISOString().slice(0, 10)
  const safeName = tripName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const filename = `${safeName}_${date}.gpx`
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
