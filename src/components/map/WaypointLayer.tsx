import { useEffect, useRef, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import mapboxgl from 'mapbox-gl'
import { toast } from 'sonner'
import type { Waypoint } from '@/types'
import { useTripStore } from '@/stores/tripStore'
import {
  createWaypoint as apiCreateWaypoint,
  updateWaypoint as apiUpdateWaypoint,
  deleteWaypoint as apiDeleteWaypoint,
  fetchWaypoints as apiFetchWaypoints,
} from '@/lib/api/waypoints'
import { createMarkerElement } from './waypointUtils'
import WaypointForm from './WaypointForm'
import type { WaypointFormData } from './WaypointForm'
import WaypointPopup from './WaypointPopup'

interface WaypointLayerProps {
  map: mapboxgl.Map | null
  tripId: string
  isPlacing: boolean
  onPlacingDone: () => void
  onWaypointSelect?: (waypointId: string) => void
}

export default function WaypointLayer({
  map,
  tripId,
  isPlacing,
  onPlacingDone,
  onWaypointSelect,
}: WaypointLayerProps) {
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const createPopupRef = useRef<mapboxgl.Popup | null>(null)
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null)

  const waypoints = useTripStore((s) => s.waypoints)
  const addWaypoint = useTripStore((s) => s.addWaypoint)
  const updateWaypointStore = useTripStore((s) => s.updateWaypoint)
  const removeWaypoint = useTripStore((s) => s.removeWaypoint)
  const setWaypoints = useTripStore((s) => s.setWaypoints)

  // Load existing waypoints on mount
  useEffect(() => {
    if (!tripId) return
    apiFetchWaypoints(tripId).then(({ data, error }) => {
      if (error) {
        console.error('Failed to load waypoints:', error.message)
        return
      }
      if (data) setWaypoints(data)
    })
  }, [tripId, setWaypoints])

  // Close any open popup
  const closePopups = useCallback(() => {
    popupRef.current?.remove()
    popupRef.current = null
    createPopupRef.current?.remove()
    createPopupRef.current = null
  }, [])

  // Handle creating a waypoint from the form
  const handleCreate = useCallback(
    async (lngLat: { lng: number; lat: number }, data: WaypointFormData) => {
      const { data: created, error } = await apiCreateWaypoint(tripId, {
        name: data.name,
        type: data.type,
        lat: lngLat.lat,
        lng: lngLat.lng,
        notes: data.notes || null,
      })
      if (error || !created) {
        toast.error('Failed to create waypoint')
        return
      }
      addWaypoint(created)
      toast.success(`Waypoint "${created.name}" created`)
      closePopups()
      onPlacingDone()
    },
    [tripId, addWaypoint, closePopups, onPlacingDone],
  )

  // Handle editing a waypoint
  const handleEdit = useCallback(
    async (waypoint: Waypoint, data: WaypointFormData) => {
      const { data: updated, error } = await apiUpdateWaypoint(waypoint.id, {
        name: data.name,
        type: data.type,
        notes: data.notes || null,
      })
      if (error || !updated) {
        toast.error('Failed to update waypoint')
        return
      }
      updateWaypointStore(waypoint.id, updated)
      toast.success(`Waypoint "${updated.name}" updated`)
      closePopups()
      setEditingWaypoint(null)
    },
    [updateWaypointStore, closePopups],
  )

  // Handle deleting a waypoint
  const handleDelete = useCallback(
    async (waypoint: Waypoint) => {
      if (!confirm(`Delete waypoint "${waypoint.name}"?`)) return
      const { error } = await apiDeleteWaypoint(waypoint.id)
      if (error) {
        toast.error('Failed to delete waypoint')
        return
      }
      removeWaypoint(waypoint.id)
      toast.success(`Waypoint "${waypoint.name}" deleted`)
      closePopups()
    },
    [removeWaypoint, closePopups],
  )

  // Handle waypoint drag
  const handleDrag = useCallback(
    async (waypoint: Waypoint, lngLat: mapboxgl.LngLat) => {
      updateWaypointStore(waypoint.id, { lat: lngLat.lat, lng: lngLat.lng })
      const { error } = await apiUpdateWaypoint(waypoint.id, {
        lat: lngLat.lat,
        lng: lngLat.lng,
      })
      if (error) {
        toast.error('Failed to update waypoint position')
        // Revert
        updateWaypointStore(waypoint.id, { lat: waypoint.lat, lng: waypoint.lng })
      }
    },
    [updateWaypointStore],
  )

  // Show info popup for a waypoint
  const showWaypointPopup = useCallback(
    (waypoint: Waypoint) => {
      if (!map) return
      closePopups()

      const container = document.createElement('div')
      container.style.minWidth = '200px'
      const root = createRoot(container)

      if (editingWaypoint?.id === waypoint.id) {
        // Edit mode
        root.render(
          <WaypointForm
            lat={waypoint.lat}
            lng={waypoint.lng}
            initialData={waypoint}
            onSubmit={(data) => handleEdit(waypoint, data)}
            onCancel={() => {
              setEditingWaypoint(null)
              closePopups()
            }}
          />,
        )
      } else {
        // View mode
        root.render(
          <WaypointPopup
            waypoint={waypoint}
            onEdit={() => {
              setEditingWaypoint(waypoint)
              // Re-render in edit mode
              const editContainer = document.createElement('div')
              editContainer.style.minWidth = '220px'
              const editRoot = createRoot(editContainer)
              editRoot.render(
                <WaypointForm
                  lat={waypoint.lat}
                  lng={waypoint.lng}
                  initialData={waypoint}
                  onSubmit={(data) => handleEdit(waypoint, data)}
                  onCancel={() => {
                    setEditingWaypoint(null)
                    closePopups()
                  }}
                />,
              )
              popupRef.current?.setDOMContent(editContainer)
            }}
            onDelete={() => handleDelete(waypoint)}
          />,
        )
      }

      const popup = new mapboxgl.Popup({
        closeOnClick: false,
        maxWidth: '280px',
        offset: 20,
      })
        .setLngLat([waypoint.lng, waypoint.lat])
        .setDOMContent(container)
        .addTo(map)

      popup.on('close', () => {
        popupRef.current = null
        setEditingWaypoint(null)
      })
      popupRef.current = popup
      onWaypointSelect?.(waypoint.id)
    },
    [map, closePopups, editingWaypoint, handleEdit, handleDelete, onWaypointSelect],
  )

  // Placement click handler
  useEffect(() => {
    if (!map || !isPlacing) return

    map.getCanvas().style.cursor = 'crosshair'

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      closePopups()

      const container = document.createElement('div')
      container.style.minWidth = '220px'
      const root = createRoot(container)
      const lngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }

      root.render(
        <WaypointForm
          lat={lngLat.lat}
          lng={lngLat.lng}
          onSubmit={(data) => handleCreate(lngLat, data)}
          onCancel={() => {
            closePopups()
            onPlacingDone()
          }}
        />,
      )

      const popup = new mapboxgl.Popup({
        closeOnClick: false,
        maxWidth: '280px',
        offset: 12,
      })
        .setLngLat([lngLat.lng, lngLat.lat])
        .setDOMContent(container)
        .addTo(map)

      popup.on('close', () => {
        createPopupRef.current = null
        onPlacingDone()
      })
      createPopupRef.current = popup
    }

    map.on('click', onClick)
    return () => {
      map.off('click', onClick)
      map.getCanvas().style.cursor = ''
    }
  }, [map, isPlacing, handleCreate, closePopups, onPlacingDone])

  // Sync markers with waypoints state
  useEffect(() => {
    if (!map) return

    const currentMarkers = markersRef.current
    const waypointIds = new Set(waypoints.map((w) => w.id))

    // Remove markers for deleted waypoints
    for (const [id, marker] of currentMarkers) {
      if (!waypointIds.has(id)) {
        marker.remove()
        currentMarkers.delete(id)
      }
    }

    // Add or update markers
    for (const wp of waypoints) {
      const existing = currentMarkers.get(wp.id)
      if (existing) {
        // Update position if changed
        const pos = existing.getLngLat()
        if (pos.lng !== wp.lng || pos.lat !== wp.lat) {
          existing.setLngLat([wp.lng, wp.lat])
        }
      } else {
        // Create new marker
        const el = createMarkerElement(wp.type)
        const marker = new mapboxgl.Marker({
          element: el,
          draggable: true,
        })
          .setLngLat([wp.lng, wp.lat])
          .addTo(map)

        // Click → show popup
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          // Get latest waypoint data from store
          const latest = useTripStore
            .getState()
            .waypoints.find((w) => w.id === wp.id)
          if (latest) showWaypointPopup(latest)
        })

        // Drag end → update position
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat()
          const latest = useTripStore
            .getState()
            .waypoints.find((w) => w.id === wp.id)
          if (latest) handleDrag(latest, lngLat)
        })

        currentMarkers.set(wp.id, marker)
      }
    }
  }, [map, waypoints, showWaypointPopup, handleDrag])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const marker of markersRef.current.values()) {
        marker.remove()
      }
      markersRef.current.clear()
      closePopups()
    }
  }, [closePopups])

  return null
}

/** Pan the map to a specific waypoint */
export function panToWaypoint(
  map: mapboxgl.Map | null,
  waypoint: Waypoint,
) {
  if (!map) return
  map.flyTo({
    center: [waypoint.lng, waypoint.lat],
    zoom: Math.max(map.getZoom(), 13),
    duration: 800,
  })
}
