import { useRef, useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Map, Backpack, CalendarDays, CloudSun, PanelLeftClose, PanelLeft, ArrowLeft } from 'lucide-react'
import MapView, { type MapViewHandle } from '@/components/map/MapView'
import { panToWaypoint } from '@/components/map/WaypointLayer'
import ElevationProfile from '@/components/map/ElevationProfile'
import WaypointList from '@/components/sidebar/WaypointList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import GearTab from '@/components/gear/GearTab'
import ItineraryTab from '@/components/itinerary/ItineraryTab'
import ConditionsTab from '@/components/conditions/ConditionsTab'
import GPXImportButton from '@/components/map/GPXImportButton'
import GPXExportButton from '@/components/map/GPXExportButton'
import ShareToggle from '@/components/ShareToggle'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { getTrip } from '@/lib/api/trips'
import type { Waypoint } from '@/types'

export default function TripPlannerPage() {
  const { tripId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const mapRef = useRef<MapViewHandle>(null)
  const waypoints = useTripStore((s) => s.waypoints)
  const route = useTripStore((s) => s.route)
  const days = useTripStore((s) => s.days)
  const trips = useTripStore((s) => s.trips)
  const preferredUnits = useAuthStore((s) => s.preferredUnits)
  const currentTrip = trips.find((t) => t.id === tripId) ?? null
  const [isPublic, setIsPublic] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null)

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

  // Auto-select waypoint from query param (e.g., from dashboard click)
  const pendingWaypointId = searchParams.get('waypoint')
  useEffect(() => {
    if (!pendingWaypointId || waypoints.length === 0) return
    const wp = waypoints.find((w) => w.id === pendingWaypointId)
    if (wp) {
      const map = mapRef.current?.getMap() ?? null
      panToWaypoint(map, wp)
      // Clear the query param so it doesn't re-trigger
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('waypoint')
        return next
      }, { replace: true })
    }
  }, [pendingWaypointId, waypoints, setSearchParams])

  const handleWaypointSelect = useCallback(
    (waypoint: Waypoint) => {
      setSelectedWaypointId(waypoint.id)
      const map = mapRef.current?.getMap() ?? null
      panToWaypoint(map, waypoint)
    },
    [],
  )

  return (
    <div className="flex h-screen min-h-0 w-full flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b bg-background px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link to="/dashboard" className="text-base font-bold tracking-tight sm:text-lg">
            TrailForge
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {tripId && (
            <>
              <GPXImportButton tripId={tripId} />
              <GPXExportButton tripId={tripId} />
              <div className="hidden h-6 w-px bg-border sm:block" />
              <ShareToggle tripId={tripId} isPublic={isPublic} />
            </>
          )}
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {tripId ? `Trip: ${tripId.slice(0, 8)}…` : 'New Trip'}
          </span>
        </div>
      </header>

      {/* Main layout: sidebar + map */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar — collapsible on < lg */}
        <aside
          className={`${
            sidebarOpen ? 'flex' : 'hidden'
          } w-full shrink-0 flex-col border-r bg-background sm:w-72 md:w-80 lg:flex lg:w-80`}
        >
          <Tabs defaultValue="map" className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b px-3 pb-2 pt-3">
              <h2 className="text-base font-bold tracking-wide">
                {currentTrip?.name ?? 'Trip Planner'}
              </h2>
            </div>
            <TabsList className="mx-2 mt-2 flex h-auto w-auto shrink-0 flex-wrap gap-1">
              <TabsTrigger value="map" className="text-xs px-2 py-1">
                <Map className="mr-1 h-3.5 w-3.5" />
                Map
              </TabsTrigger>
              <TabsTrigger value="gear" className="text-xs px-2 py-1">
                <Backpack className="mr-1 h-3.5 w-3.5" />
                Gear
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="text-xs px-2 py-1">
                <CalendarDays className="mr-1 h-3.5 w-3.5" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="conditions" className="text-xs px-2 py-1">
                <CloudSun className="mr-1 h-3.5 w-3.5" />
                Conditions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="min-h-0 flex-1 overflow-y-auto">
              <WaypointList
                waypoints={waypoints}
                selectedWaypointId={selectedWaypointId}
                onSelect={handleWaypointSelect}
              />
            </TabsContent>

            <TabsContent value="gear" className="min-h-0 flex-1 overflow-hidden">
              {tripId ? (
                <GearTab tripId={tripId} />
              ) : (
                <p className="text-muted-foreground p-4 text-sm">
                  Save your trip first to manage gear.
                </p>
              )}
            </TabsContent>

            <TabsContent value="itinerary" className="min-h-0 flex-1 overflow-hidden">
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

            <TabsContent value="conditions" className="min-h-0 flex-1 overflow-hidden">
              {tripId ? (
                <ConditionsTab
                  tripId={tripId}
                  startDate={currentTrip?.start_date ?? null}
                  endDate={currentTrip?.end_date ?? null}
                />
              ) : (
                <p className="text-muted-foreground p-4 text-sm">
                  Save your trip first to see conditions.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </aside>

        {/* Map + elevation profile */}
        <div className="relative flex min-h-[300px] flex-1 flex-col">
          <div className="relative flex-1">
            <MapView ref={mapRef} tripId={tripId} onWaypointSelect={setSelectedWaypointId} />
          </div>
          <ElevationProfile
            routeGeoJSON={route}
            days={days}
            units={preferredUnits}
          />
        </div>
      </div>
    </div>
  )
}
