import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { lineString } from '@turf/helpers'
import length from '@turf/length'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Mountain,
} from 'lucide-react'
import type { UnitSystem, Day } from '@/types'
import {
  formatDistance,
  formatElevation,
  kilometersToMiles,
  milesToKilometers,
  feetToMeters,
} from '@/utils/units'

interface ElevationProfileProps {
  routeGeoJSON: Record<string, unknown> | null
  days?: Day[]
  units: UnitSystem
}

interface ElevationPoint {
  distance: number // miles from start
  elevation: number // feet
}

const SAMPLE_COUNT = 100

function extractCoordinates(
  route: Record<string, unknown>,
): number[][] | null {
  const geom = route as {
    geometry?: { type: string; coordinates: number[][] }
    type?: string
    coordinates?: number[][]
  }

  // GeoJSON Feature
  if (geom.geometry?.type === 'LineString' && geom.geometry.coordinates?.length) {
    return geom.geometry.coordinates
  }
  // Raw LineString
  if (geom.type === 'LineString' && geom.coordinates?.length) {
    return geom.coordinates
  }
  return null
}

/**
 * Sample elevation at regular intervals along the route.
 * If route vertices have elevation (Z coordinate), interpolate from those.
 * Otherwise, fall back to a flat line at 0.
 */
function sampleElevationProfile(coords: number[][]): ElevationPoint[] {
  if (coords.length < 2) return []

  const hasElevation = coords.some((c) => c.length >= 3 && c[2] !== 0)
  const line = lineString(coords)
  const totalLenKm = length(line, { units: 'kilometers' })
  const totalLenMi = kilometersToMiles(totalLenKm)

  if (totalLenMi < 0.01) return []

  const points: ElevationPoint[] = []
  const step = totalLenKm / SAMPLE_COUNT

  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const distKm = Math.min(i * step, totalLenKm)
    const distMi = kilometersToMiles(distKm)

    let elevation = 0
    if (hasElevation) {
      elevation = interpolateElevation(coords, distKm)
    }

    points.push({ distance: distMi, elevation })
  }

  return points
}

/**
 * Interpolate elevation at a given distance along the route
 * using the Z coordinates of the route vertices.
 */
function interpolateElevation(
  coords: number[][],
  distKm: number,
): number {
  if (coords.length < 2) return coords[0]?.[2] ?? 0

  // Build cumulative distances for each vertex
  const cumDists: number[] = [0]
  for (let i = 1; i < coords.length; i++) {
    const segLine = lineString([coords[i - 1], coords[i]])
    const segLen = length(segLine, { units: 'kilometers' })
    cumDists.push(cumDists[i - 1] + segLen)
  }

  // Find the segment containing our target distance
  for (let i = 1; i < cumDists.length; i++) {
    if (distKm <= cumDists[i] || i === cumDists.length - 1) {
      const segStart = cumDists[i - 1]
      const segEnd = cumDists[i]
      const segLen = segEnd - segStart
      const t = segLen > 0 ? (distKm - segStart) / segLen : 0

      const elev0 = coords[i - 1][2] ?? 0
      const elev1 = coords[i][2] ?? 0
      // Convert meters to feet (route elevation is typically in meters)
      const elevMeters = elev0 + t * (elev1 - elev0)
      // Assume elevation from GeoJSON/GPX is in meters, convert to feet for storage
      return elevMeters / 0.3048
    }
  }

  return 0
}

function computeStats(points: ElevationPoint[]): {
  totalGain: number
  totalLoss: number
  maxElev: number
  minElev: number
} {
  if (points.length === 0) {
    return { totalGain: 0, totalLoss: 0, maxElev: 0, minElev: 0 }
  }

  let totalGain = 0
  let totalLoss = 0
  let maxElev = points[0].elevation
  let minElev = points[0].elevation

  for (let i = 1; i < points.length; i++) {
    const diff = points[i].elevation - points[i - 1].elevation
    if (diff > 0) totalGain += diff
    else totalLoss += Math.abs(diff)
    maxElev = Math.max(maxElev, points[i].elevation)
    minElev = Math.min(minElev, points[i].elevation)
  }

  return { totalGain, totalLoss, maxElev, minElev }
}

// TODO: fix duplicate `units` prop destructuring causing build error
export default function ElevationProfile({
  routeGeoJSON,
  days,
  units,
}: ElevationProfileProps) {
  const [collapsed, setCollapsed] = useState(false)

  const coords = useMemo(
    () => (routeGeoJSON ? extractCoordinates(routeGeoJSON) : null),
    [routeGeoJSON],
  )

  const points = useMemo(
    () => (coords ? sampleElevationProfile(coords) : []),
    [coords],
  )

  const stats = useMemo(() => computeStats(points), [points])

  // Day boundary mile markers from days data
  const dayBoundaries = useMemo(() => {
    if (!days?.length) return []
    return days
      .filter((d) => d.target_miles != null)
      .reduce<{ dayNumber: number; mile: number }[]>((acc, d) => {
        const prevMile = acc.length > 0 ? acc[acc.length - 1].mile : 0
        acc.push({
          dayNumber: d.day_number,
          mile: prevMile + (d.target_miles ?? 0),
        })
        return acc
      }, [])
  }, [days])

  if (!coords || points.length === 0) return null

  // Format chart data for the user's preferred units
  const chartData = points.map((p) => ({
    distance:
      units === 'metric' ? milesToKilometers(p.distance) : p.distance,
    elevation:
      units === 'metric' ? feetToMeters(p.elevation) : p.elevation,
    rawDistanceMi: p.distance,
    rawElevFt: p.elevation,
  }))

  const distLabel = units === 'metric' ? 'km' : 'mi'
  const elevLabel = units === 'metric' ? 'm' : 'ft'

  return (
    <div className="border-t bg-white">
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <Mountain className="h-4 w-4" />
          Elevation Profile
        </span>
        {collapsed ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-3">
          {/* Chart */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="distance"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(v: number) => `${v.toFixed(1)}`}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: distLabel,
                    position: 'insideBottomRight',
                    offset: -5,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  dataKey="elevation"
                  type="number"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: elevLabel,
                    angle: -90,
                    position: 'insideLeft',
                    fontSize: 10,
                  }}
                  width={45}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as (typeof chartData)[0]
                    return (
                      <div className="rounded border bg-white px-2 py-1 text-xs shadow">
                        <p>
                          {formatDistance(d.rawDistanceMi, units)} ·{' '}
                          {formatElevation(d.rawElevFt, units)}
                        </p>
                      </div>
                    )
                  }}
                />
                {/* Day boundary lines */}
                {dayBoundaries.map((b) => (
                  <ReferenceLine
                    key={b.dayNumber}
                    x={units === 'metric' ? milesToKilometers(b.mile) : b.mile}
                    stroke="#D97706"
                    strokeDasharray="4 4"
                    label={{
                      value: `D${b.dayNumber}`,
                      position: 'top',
                      fontSize: 9,
                      fill: '#D97706',
                    }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="elevation"
                  stroke="#C2410C"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: '#C2410C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
            <StatBox
              icon={<TrendingUp className="h-3 w-3 text-green-600" />}
              label="Gain"
              value={formatElevation(stats.totalGain, units)}
            />
            <StatBox
              icon={<TrendingDown className="h-3 w-3 text-red-600" />}
              label="Loss"
              value={formatElevation(stats.totalLoss, units)}
            />
            <StatBox
              icon={<Mountain className="h-3 w-3 text-gray-600" />}
              label="Max"
              value={formatElevation(stats.maxElev, units)}
            />
            <StatBox
              icon={<Mountain className="h-3 w-3 text-gray-400" />}
              label="Min"
              value={formatElevation(stats.minElev, units)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded bg-gray-50 p-1.5">
      {icon}
      <span className="font-medium text-gray-900">{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  )
}
