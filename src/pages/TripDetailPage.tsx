import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Mountain,
  Route,
  Backpack,
  ArrowLeft,
  Loader2,
  Lock,
} from 'lucide-react'
import { fetchPublicTrip, type PublicTripData } from '@/lib/api/share'
import { formatDistance, formatWeight, formatElevation } from '@/utils/units'

export default function TripDetailPage() {
  const { tripId } = useParams()
  const [data, setData] = useState<PublicTripData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) return
    setLoading(true)
    fetchPublicTrip(tripId).then((res) => {
      if (res.error || !res.data) {
        setError(res.error ?? 'Trip not found')
      } else {
        setData(res.data)
      }
      setLoading(false)
    })
  }, [tripId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-gray-600">
        <Lock className="h-12 w-12 text-gray-400" />
        <h1 className="text-xl font-semibold">
          {error ?? 'Trip not found or is private'}
        </h1>
        <Link
          to="/"
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Go home
        </Link>
      </div>
    )
  }

  const { trip, days, waypoints, gearSummary } = data

  // Compute stats
  const totalDistance = days.reduce(
    (sum, d) => sum + (d.target_miles ?? 0),
    0,
  )
  const totalElevation = days.reduce(
    (sum, d) => sum + (d.elevation_gain ?? 0),
    0,
  )
  const numDays = days.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
          {trip.description && (
            <p className="mt-2 text-gray-600">{trip.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            {trip.region && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {trip.region}
              </span>
            )}
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {trip.start_date}
                {trip.end_date && ` – ${trip.end_date}`}
              </span>
            )}
            <span className="rounded bg-gray-100 px-2 py-0.5 capitalize">
              {trip.status}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<Route className="h-5 w-5 text-orange-600" />}
            label="Distance"
            value={formatDistance(totalDistance, 'imperial')}
          />
          <StatCard
            icon={<Mountain className="h-5 w-5 text-orange-600" />}
            label="Elevation Gain"
            value={formatElevation(totalElevation, 'imperial')}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-orange-600" />}
            label="Days"
            value={String(numDays)}
          />
          <StatCard
            icon={<Backpack className="h-5 w-5 text-orange-600" />}
            label="Gear"
            value={
              gearSummary.itemCount > 0
                ? `${gearSummary.itemCount} items · ${formatWeight(gearSummary.totalWeightOz, 'imperial')}`
                : '—'
            }
          />
        </div>

        {/* Route map (read-only) */}
        {trip.route_geojson && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Route</h2>
            <div className="overflow-hidden rounded-lg border bg-gray-100">
              <ReadOnlyMap routeGeoJSON={trip.route_geojson} waypoints={waypoints} />
            </div>
          </section>
        )}

        {/* Itinerary */}
        {days.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Itinerary
            </h2>
            <div className="space-y-3">
              {days
                .sort((a, b) => a.day_number - b.day_number)
                .map((day) => {
                  const dayWaypoints = waypoints.filter(
                    (w) => w.day_id === day.id,
                  )
                  return (
                    <div
                      key={day.id}
                      className="rounded-lg border bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          Day {day.day_number}
                          {day.date && (
                            <span className="ml-2 text-sm text-gray-500">
                              {day.date}
                            </span>
                          )}
                        </h3>
                        <div className="flex gap-3 text-sm text-gray-500">
                          {day.target_miles != null && (
                            <span>
                              {formatDistance(day.target_miles, 'imperial')}
                            </span>
                          )}
                          {day.elevation_gain != null && (
                            <span>
                              ↑{' '}
                              {formatElevation(day.elevation_gain, 'imperial')}
                            </span>
                          )}
                        </div>
                      </div>
                      {day.notes && (
                        <p className="mt-1 text-sm text-gray-600">
                          {day.notes}
                        </p>
                      )}
                      {dayWaypoints.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {dayWaypoints.map((wp) => (
                            <span
                              key={wp.id}
                              className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-700"
                            >
                              <MapPin className="h-3 w-3" /> {wp.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </section>
        )}

        {/* Waypoints list (not assigned to days) */}
        {waypoints.filter((w) => !w.day_id).length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Waypoints
            </h2>
            <div className="space-y-2">
              {waypoints
                .filter((w) => !w.day_id)
                .map((wp) => (
                  <div
                    key={wp.id}
                    className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
                  >
                    <MapPin className="h-4 w-4 text-orange-600" />
                    <div>
                      <span className="font-medium text-gray-900">
                        {wp.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400 capitalize">
                        {wp.type.replace('_', ' ')}
                      </span>
                    </div>
                    {wp.elevation != null && (
                      <span className="ml-auto text-sm text-gray-500">
                        {formatElevation(wp.elevation, 'imperial')}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Gear summary */}
        {gearSummary.itemCount > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Gear Summary
            </h2>
            <div className="rounded-lg border bg-white p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {gearSummary.itemCount}
                  </p>
                  <p className="text-sm text-gray-500">Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatWeight(gearSummary.baseWeightOz, 'imperial')}
                  </p>
                  <p className="text-sm text-gray-500">Base Weight</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatWeight(gearSummary.totalWeightOz, 'imperial')}
                  </p>
                  <p className="text-sm text-gray-500">Total Weight</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

// ── Helper Components ──────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
      {icon}
      <div>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// Read-only map — renders route + waypoints without draw controls
function ReadOnlyMap({
  routeGeoJSON,
  waypoints,
}: {
  routeGeoJSON: Record<string, unknown>
  waypoints: Array<{ lat: number; lng: number; name: string }>
}) {
  const containerRef = useState<HTMLDivElement | null>(null)
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  useEffect(() => {
    const container = containerRef[0]
    if (!container || !mapboxToken) return

    // Dynamic import to avoid SSR issues
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = mapboxToken

      const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-111.09, 38.57],
        zoom: 6,
        interactive: true,
        attributionControl: true,
      })

      map.addControl(new mapboxgl.NavigationControl(), 'top-left')

      map.on('load', () => {
        // Add route line
        const geom = routeGeoJSON as {
          geometry?: { type: string; coordinates: number[][] }
        }
        if (geom?.geometry?.coordinates?.length) {
          map.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON as unknown as GeoJSON.Feature,
          })
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#C2410C',
              'line-width': 3.5,
            },
          })

          // Fit bounds to route
          const coords = geom.geometry!.coordinates
          const bounds = coords.reduce(
            (b, c) => b.extend(c as [number, number]),
            new mapboxgl.LngLatBounds(
              coords[0] as [number, number],
              coords[0] as [number, number],
            ),
          )
          map.fitBounds(bounds, { padding: 60 })
        }

        // Add waypoint markers
        for (const wp of waypoints) {
          new mapboxgl.Marker({ color: '#D97706' })
            .setLngLat([wp.lng, wp.lat])
            .setPopup(new mapboxgl.Popup().setText(wp.name))
            .addTo(map)
        }
      })

      return () => map.remove()
    })
  }, [containerRef, mapboxToken, routeGeoJSON, waypoints])

  if (!mapboxToken) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Map unavailable
      </div>
    )
  }

  return (
    <div
      ref={(el) => {
        if (el && el !== containerRef[0]) {
          containerRef[1](el)
        }
      }}
      className="h-80 w-full"
    />
  )
}
