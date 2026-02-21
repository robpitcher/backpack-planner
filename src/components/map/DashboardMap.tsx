import { useRef, useEffect, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Loader2, AlertTriangle } from 'lucide-react'
import type { Trip, Waypoint } from '@/types'
import { fetchWaypoints } from '@/lib/api/waypoints'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

interface TripCentroid {
  tripId: string
  lng: number
  lat: number
}

function getRouteCentroid(routeGeojson: Record<string, unknown> | null): [number, number] | null {
  if (!routeGeojson) return null
  const geom = routeGeojson as { geometry?: { coordinates?: number[][] } }
  const coords = geom.geometry?.coordinates
  if (!coords || coords.length === 0) return null
  let sumLng = 0
  let sumLat = 0
  for (const [lng, lat] of coords) {
    sumLng += lng
    sumLat += lat
  }
  return [sumLng / coords.length, sumLat / coords.length]
}

interface DashboardMapProps {
  trips: Trip[]
  selectedTripId: string | null
  highlightedTripId: string | null
  onMarkerClick?: (tripId: string) => void
  onMarkerHover?: (tripId: string | null) => void
  onMapClick?: () => void
  onWaypointClick?: (tripId: string, waypointId: string) => void
}

export default function DashboardMap({
  trips,
  selectedTripId,
  highlightedTripId,
  onMarkerClick,
  onMarkerHover,
  onMapClick,
  onWaypointClick,
}: DashboardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const waypointMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const routeLayerRef = useRef<string | null>(null)
  const onMapClickRef = useRef(onMapClick)
  const onWaypointClickRef = useRef(onWaypointClick)
  const selectedTripIdRef = useRef(selectedTripId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])

  // Keep callback refs current without re-creating markers
  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])
  useEffect(() => {
    onWaypointClickRef.current = onWaypointClick
  }, [onWaypointClick])
  useEffect(() => {
    selectedTripIdRef.current = selectedTripId
  }, [selectedTripId])
  // Compute centroids
  const centroids: TripCentroid[] = trips
    .map((t) => {
      const c = getRouteCentroid(t.route_geojson)
      if (!c) return null
      return { tripId: t.id, lng: c[0], lat: c[1] }
    })
    .filter((c): c is TripCentroid => c !== null)

  // Init map
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [-98.5, 39.8],
      zoom: 3,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-left')

    map.on('load', () => {
      setIsLoading(false)
      setMapReady(true)
    })

    map.on('error', (e) => {
      setError(e.error?.message ?? 'Map failed to load.')
      setIsLoading(false)
    })

    map.on('click', () => {
      onMapClickRef.current?.()
    })

    mapRef.current = map

    return () => {
      markersRef.current.clear()
      waypointMarkersRef.current.clear()
      mapRef.current = null
      map.remove()
    }
  }, [])

  // Manage markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current
    const existing = markersRef.current

    // Remove old markers not in current centroids
    const currentIds = new Set(centroids.map((c) => c.tripId))
    for (const [id, marker] of existing) {
      if (!currentIds.has(id)) {
        marker.remove()
        existing.delete(id)
      }
    }

    // Add/update markers
    for (const c of centroids) {
      if (existing.has(c.tripId)) {
        existing.get(c.tripId)!.setLngLat([c.lng, c.lat])
      } else {
        const el = document.createElement('div')
        el.className = 'dashboard-map-marker'
        el.style.cssText =
          'width:14px;height:14px;border-radius:50%;background:#C2410C;border:2px solid white;cursor:pointer;transition:transform 0.15s;box-shadow:0 1px 3px rgba(0,0,0,0.3);'

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onMarkerClick?.(c.tripId)
        })
        el.addEventListener('mouseenter', () => {
          onMarkerHover?.(c.tripId)
        })
        el.addEventListener('mouseleave', () => {
          onMarkerHover?.(null)
        })

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([c.lng, c.lat])
          .addTo(map)

        existing.set(c.tripId, marker)
      }
    }

    // Fit bounds to all markers
    if (centroids.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      for (const c of centroids) {
        bounds.extend([c.lng, c.lat])
      }
      map.fitBounds(bounds, { padding: 60, maxZoom: 12 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, JSON.stringify(centroids.map((c) => [c.tripId, c.lng, c.lat]))])

  // Highlight marker on hover
  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      const el = marker.getElement()
      const isHigh = id === highlightedTripId || id === selectedTripId
      el.style.transform = isHigh ? 'scale(1.6)' : 'scale(1)'
      el.style.zIndex = isHigh ? '10' : '1'
      el.style.background = id === selectedTripId ? '#D97706' : '#C2410C'
    }
  }, [highlightedTripId, selectedTripId])

  // Draw selected trip route and zoom to it
  const drawRoute = useCallback(
    (tripId: string | null) => {
      const map = mapRef.current
      if (!map || !mapReady) return

      // Remove existing route layer/source
      if (routeLayerRef.current) {
        if (map.getLayer('dashboard-route-line')) map.removeLayer('dashboard-route-line')
        if (map.getSource('dashboard-route')) map.removeSource('dashboard-route')
        routeLayerRef.current = null
      }

      if (!tripId) {
        return
      }

      const trip = trips.find((t) => t.id === tripId)
      if (!trip?.route_geojson) return

      const geojson = trip.route_geojson as {
        type: string
        geometry?: { type: string; coordinates: number[][] }
      }
      if (!geojson.geometry?.coordinates?.length) return

      map.addSource('dashboard-route', {
        type: 'geojson',
        data: geojson as unknown as GeoJSON.Feature,
      })

      map.addLayer({
        id: 'dashboard-route-line',
        type: 'line',
        source: 'dashboard-route',
        paint: {
          'line-color': '#D97706',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      })

      routeLayerRef.current = tripId
    },
    [trips, mapReady, centroids],
  )

  useEffect(() => {
    drawRoute(selectedTripId)
  }, [selectedTripId, drawRoute])

  // Fetch and display waypoints for selected trip
  useEffect(() => {
    if (!selectedTripId) {
      setWaypoints([])
      return
    }

    fetchWaypoints(selectedTripId).then(({ data, error }) => {
      if (error) {
        console.error('Failed to fetch waypoints:', error.message)
        return
      }
      setWaypoints(data ?? [])
    })
  }, [selectedTripId])

  // Manage waypoint markers and fit bounds to route + waypoints
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current
    const existing = waypointMarkersRef.current

    // Remove old waypoint markers not in current waypoints
    const currentIds = new Set(waypoints.map((w) => w.id))
    for (const [id, marker] of existing) {
      if (!currentIds.has(id)) {
        marker.remove()
        existing.delete(id)
      }
    }

    // Add/update waypoint markers
    for (const wp of waypoints) {
      if (existing.has(wp.id)) {
        existing.get(wp.id)!.setLngLat([wp.lng, wp.lat])
      } else {
        const el = document.createElement('div')
        el.className = 'dashboard-waypoint-marker'
        el.style.cssText = 'cursor:pointer;'
        const dot = document.createElement('div')
        dot.style.cssText =
          'width:14px;height:14px;border-radius:50%;background:#D97706;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 0.15s;'
        el.appendChild(dot)

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          const tripId = selectedTripIdRef.current
          if (tripId) onWaypointClickRef.current?.(tripId, wp.id)
        })
        el.addEventListener('mouseenter', () => {
          dot.style.transform = 'scale(1.4)'
        })
        el.addEventListener('mouseleave', () => {
          dot.style.transform = 'scale(1)'
        })

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([wp.lng, wp.lat])
          .addTo(map)

        existing.set(wp.id, marker)
      }
    }

  }, [mapReady, waypoints])

  // Fly to selected trip — compute center from all available coords
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    if (!selectedTripId) {
      // Deselected — zoom back to all centroids
      if (centroids.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        for (const c of centroids) bounds.extend([c.lng, c.lat])
        map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 800 })
      }
      return
    }

    // Collect all coordinates: route, waypoints, or centroid as fallback
    const allPoints: [number, number][] = []

    const trip = trips.find((t) => t.id === selectedTripId)
    const geojson = trip?.route_geojson as {
      geometry?: { coordinates?: number[][] }
    } | undefined
    const routeCoords = geojson?.geometry?.coordinates
    if (routeCoords) {
      for (const [lng, lat] of routeCoords) allPoints.push([lng, lat])
    }

    for (const wp of waypoints) allPoints.push([wp.lng, wp.lat])

    // Fallback: use the trip centroid if no route/waypoints yet
    if (allPoints.length === 0) {
      const centroid = centroids.find((c) => c.tripId === selectedTripId)
      if (centroid) allPoints.push([centroid.lng, centroid.lat])
    }

    if (allPoints.length === 0) return

    if (allPoints.length === 1) {
      // Single point — flyTo with a reasonable zoom
      map.flyTo({ center: allPoints[0], zoom: 12, duration: 800 })
    } else {
      const bounds = new maplibregl.LngLatBounds()
      for (const pt of allPoints) bounds.extend(pt)
      map.fitBounds(bounds, { padding: 80, duration: 800 })
    }
  }, [mapReady, selectedTripId, waypoints, trips, centroids])

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted text-muted-foreground">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="max-w-md text-center text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
