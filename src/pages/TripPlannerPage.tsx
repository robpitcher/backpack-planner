import { useRef, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Map, Backpack, CalendarDays } from 'lucide-react'
import MapView, { type MapViewHandle } from '@/components/map/MapView'
import { panToWaypoint } from '@/components/map/WaypointLayer'
import WaypointList from '@/components/sidebar/WaypointList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GearTab from '@/components/gear/GearTab'
import ItineraryTab from '@/components/itinerary/ItineraryTab'
import GPXImportButton from '@/components/map/GPXImportButton'
import GPXExportButton from '@/components/map/GPXExportButton'
import ShareToggle from '@/components/ShareToggle'
import { useTripStore } from '@/stores/tripStore'
import { getTrip } from '@/lib/api/trips'
import type { Waypoint } from '@/types'

export default function TripPlannerPage() {
  const { tripId } = useParams()
  const mapRef = useRef<MapViewHandle>(null)
  const waypoints = useTripStore((s) => s.waypoints)
  const trips = useTripStore((s) => s.trips)
  const currentTrip = trips.find((t) => t.id === tripId) ?? null
  const [isPublic, setIsPublic] = useState(false)

  // Load trip's is_public status
  useEffect(() => {
    if (!tripId) return
    getTrip(tripId).then((res) => {
      if (res.data) setIsPublic(res.data.is_public)
    })
  }, [tripId])

  // Sync isPublic when trips list updates
  useEffect(() => {
    if (currentTrip) setIsPublic(currentTrip.is_public)
  }, [currentTrip])

  const handleWaypointSelect = useCallback(
    (waypoint: Waypoint) => {
      const map = mapRef.current?.getMap() ?? null
      panToWaypoint(map, waypoint)
    },
    [],
  )

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <h1 className="text-lg font-semibold">Trip Planner</h1>
        <div className="flex items-center gap-3">
          {tripId && (
            <>
              <GPXImportButton tripId={tripId} />
              <GPXExportButton tripId={tripId} />
              <div className="h-6 w-px bg-gray-200" />
              <ShareToggle tripId={tripId} isPublic={isPublic} />
            </>
          )}
          <span className="text-sm text-gray-500">
            {tripId ? `Trip: ${tripId.slice(0, 8)}…` : 'New Trip'}
          </span>
        </div>
      </header>

      {/* Main layout: sidebar + map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-80 shrink-0 flex-col border-r bg-white">
          <Tabs defaultValue="map" className="flex h-full flex-col">
            <TabsList className="mx-2 mt-2 w-auto">
              <TabsTrigger value="map">
                <Map className="mr-1 h-4 w-4" />
                Map
              </TabsTrigger>
              <TabsTrigger value="gear">
                <Backpack className="mr-1 h-4 w-4" />
                Gear
              </TabsTrigger>
              <TabsTrigger value="itinerary">
                <CalendarDays className="mr-1 h-4 w-4" />
                Itinerary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="flex-1 overflow-y-auto">
              <WaypointList
                waypoints={waypoints}
                onSelect={handleWaypointSelect}
              />
            </TabsContent>

            <TabsContent value="gear" className="flex-1 overflow-hidden">
              {tripId ? (
                <GearTab tripId={tripId} />
              ) : (
                <p className="text-muted-foreground p-4 text-sm">
                  Save your trip first to manage gear.
                </p>
              )}
            </TabsContent>

            <TabsContent value="itinerary" className="flex-1 overflow-hidden">
              {tripId ? (
                <ItineraryTab
                  tripId={tripId}
                  startDate={currentTrip?.start_date ?? null}
                />
              ) : (
                <p className="text-muted-foreground p-4 text-sm">
                  Save your trip first to plan your itinerary.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </aside>

        {/* Map fills remaining space */}
        <div className="relative flex-1">
          <MapView ref={mapRef} tripId={tripId} />
        </div>
      </div>
    </div>
  )
}
