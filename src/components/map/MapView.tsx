import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import length from '@turf/length'
import { lineString } from '@turf/helpers'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { Loader2, AlertTriangle } from 'lucide-react'
import MapStyleToggle, { type MapStyle } from './MapStyleToggle'
import DrawControls from './DrawControls'
import RouteStats from './RouteStats'
import WaypointLayer from './WaypointLayer'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { kilometersToMiles } from '@/utils/units'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

// Draw styling — trail-colored route line with vertex circles
const DRAW_STYLES: object[] = [
  // Active line (while drawing)
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: [
      'all',
      ['==', '$type', 'LineString'],
      ['==', 'active', 'true'],
    ],
    paint: {
      'line-color': '#D97706',
      'line-width': 4,
      'line-dasharray': [2, 2],
    },
  },
  // Inactive line (finished route)
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', '$type', 'LineString'],
      ['==', 'active', 'false'],
    ],
    paint: {
      'line-color': '#C2410C',
      'line-width': 3.5,
    },
  },
  // Vertex points
  {
    id: 'gl-draw-point',
    type: 'circle',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 5,
      'circle-color': '#FFFFFF',
      'circle-stroke-color': '#C2410C',
      'circle-stroke-width': 2,
    },
  },
]

export interface MapViewHandle {
  getMap: () => mapboxgl.Map | null
  getIsPlacing: () => boolean
  setIsPlacing: (v: boolean) => void
}

interface RouteGeoJSON {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: number[][]
  }
  properties: Record<string, unknown>
  id?: string
}

const MapView = forwardRef<MapViewHandle, { tripId?: string }>(function MapView({ tripId }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<MapStyle>('outdoors-v12')
  const [isDrawing, setIsDrawing] = useState(false)
  const [routeCoords, setRouteCoords] = useState<number[][]>([])
  const [isPlacingWaypoint, setIsPlacingWaypoint] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const setRoute = useTripStore((s) => s.setRoute)
  const storedRoute = useTripStore((s) => s.route)
  const preferredUnits = useAuthStore((s) => s.preferredUnits)

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    getIsPlacing: () => isPlacingWaypoint,
    setIsPlacing: (v: boolean) => setIsPlacingWaypoint(v),
  }))

  // Calculate distance from coordinates
  const distanceMiles =
    routeCoords.length >= 2
      ? kilometersToMiles(
          length(lineString(routeCoords), { units: 'kilometers' }),
        )
      : 0

  // Sync draw state → store
  const syncRouteToStore = useCallback(
    (coords: number[][]) => {
      setRouteCoords(coords)
      if (coords.length >= 2) {
        const geojson: RouteGeoJSON = {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        }
        setRoute(geojson as unknown as Record<string, unknown>)
      } else {
        setRoute(null)
      }
    },
    [setRoute],
  )

  // Extract coordinates from draw instance
  const readDrawCoords = useCallback((): number[][] => {
    const draw = drawRef.current
    if (!draw) return []
    const all = draw.getAll() as GeoJSON.FeatureCollection
    if (!all.features.length) return []
    const feat = all.features[0]
    if (feat.geometry.type === 'LineString') {
      return feat.geometry.coordinates
    }
    return []
  }, [])

  // ── Map init ──
  useEffect(() => {
    if (!containerRef.current) return
    if (!MAPBOX_TOKEN) {
      setError(
        'Mapbox token is missing. Set VITE_MAPBOX_TOKEN in your .env.local file.',
      )
      setIsLoading(false)
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [-111.0937, 38.5733],
      zoom: 6,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-left')

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: 'simple_select',
      styles: DRAW_STYLES,
    })
    map.addControl(draw as unknown as mapboxgl.IControl)
    drawRef.current = draw

    // Load existing route from store
    const onLoad = () => {
      setIsLoading(false)
      setMapReady(true)
      if (storedRoute) {
        const feat = storedRoute as unknown as RouteGeoJSON
        if (feat?.geometry?.coordinates?.length >= 2) {
          draw.add(feat as unknown as GeoJSON.Feature)
          setRouteCoords(feat.geometry.coordinates)
        }
      }
    }

    map.on('load', onLoad)

    // Draw events
    const onDrawUpdate = () => {
      const coords = readDrawCoords()
      syncRouteToStore(coords)
    }

    map.on('draw.create', onDrawUpdate)
    map.on('draw.update', onDrawUpdate)
    map.on('draw.delete', () => syncRouteToStore([]))

    map.on('error', (e) => {
      const msg =
        e.error?.message ?? 'Map failed to load. Check your token and network.'
      setError(msg)
      setIsLoading(false)
    })

    mapRef.current = map

    return () => {
      drawRef.current = null
      mapRef.current = null
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Style changes ──
  const handleStyleChange = useCallback(
    (style: MapStyle) => {
      setMapStyle(style)
      const map = mapRef.current
      const draw = drawRef.current
      if (!map || !draw) return

      // Save current features before style swap
      const features = draw.getAll() as GeoJSON.FeatureCollection
      map.setStyle(`mapbox://styles/mapbox/${style}`)

      // Restore features after new style loads
      map.once('style.load', () => {
        if (features.features.length > 0) {
          draw.set(features as GeoJSON.FeatureCollection)
        }
      })
    },
    [],
  )

  // ── Draw control handlers ──
  const handleStartDraw = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return

    // Exit waypoint placement mode when starting to draw
    if (isPlacingWaypoint) setIsPlacingWaypoint(false)

    if (isDrawing) {
      // Toggle off — finish current drawing
      draw.changeMode('simple_select')
      setIsDrawing(false)
      const coords = readDrawCoords()
      syncRouteToStore(coords)
      return
    }

    // Clear existing and start new line
    const all = draw.getAll() as GeoJSON.FeatureCollection
    if (all.features.length === 0) {
      draw.changeMode('draw_line_string')
    } else {
      // Continue editing existing — enter direct_select on first feature
      const id = all.features[0].id as string
      draw.changeMode('direct_select', { featureId: id })
    }
    setIsDrawing(true)
  }, [isDrawing, isPlacingWaypoint, readDrawCoords, syncRouteToStore])

  const handleUndo = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    const all = draw.getAll() as GeoJSON.FeatureCollection
    if (!all.features.length) return

    const feat = all.features[0]
    if (feat.geometry.type === 'LineString') {
      const coords = feat.geometry.coordinates
      if (coords.length <= 1) {
        draw.deleteAll()
        syncRouteToStore([])
        setIsDrawing(false)
        return
      }
      const newCoords = coords.slice(0, -1)
      feat.geometry.coordinates = newCoords
      draw.set(all as GeoJSON.FeatureCollection)
      syncRouteToStore(newCoords)

      // Stay in draw mode if still drawing
      if (isDrawing) {
        draw.changeMode('draw_line_string')
      }
    }
  }, [isDrawing, syncRouteToStore])

  const handleClear = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    draw.deleteAll()
    syncRouteToStore([])
    setIsDrawing(false)
  }, [syncRouteToStore])

  const handleFinish = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    draw.changeMode('simple_select')
    setIsDrawing(false)
    const coords = readDrawCoords()
    syncRouteToStore(coords)
  }, [readDrawCoords, syncRouteToStore])

  const handleToggleWaypoint = useCallback(() => {
    setIsPlacingWaypoint((prev) => !prev)
    // Exit draw mode when placing waypoints
    if (!isPlacingWaypoint && isDrawing) {
      const draw = drawRef.current
      if (draw) {
        draw.changeMode('simple_select')
        setIsDrawing(false)
        const coords = readDrawCoords()
        syncRouteToStore(coords)
      }
    }
  }, [isPlacingWaypoint, isDrawing, readDrawCoords, syncRouteToStore])

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
      <MapStyleToggle currentStyle={mapStyle} onToggle={handleStyleChange} />
      <DrawControls
        isDrawing={isDrawing}
        hasPoints={routeCoords.length > 0}
        isPlacingWaypoint={isPlacingWaypoint}
        onStartDraw={handleStartDraw}
        onUndo={handleUndo}
        onClear={handleClear}
        onFinish={handleFinish}
        onToggleWaypoint={handleToggleWaypoint}
      />
      <RouteStats
        distanceMiles={distanceMiles}
        pointCount={routeCoords.length}
        units={preferredUnits}
      />
      {mapReady && tripId && (
        <WaypointLayer
          map={mapRef.current}
          tripId={tripId}
          isPlacing={isPlacingWaypoint}
          onPlacingDone={() => setIsPlacingWaypoint(false)}
        />
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
})

export default MapView
