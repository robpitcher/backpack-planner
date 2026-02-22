import { useRef, useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Map, Backpack, CalendarDays, CloudSun, PanelLeftClose, PanelLeft, UserCircle, Pencil, Github } from 'lucide-react'
import { toast } from 'sonner'
import maplibregl from 'maplibre-gl'
import MapView, { type MapViewHandle } from '@/components/map/MapView'
import { panToWaypoint } from '@/components/map/WaypointLayer'
import ElevationProfile from '@/components/map/ElevationProfile'
import Breadcrumb from '@/components/Breadcrumb'
import WaypointList from '@/components/sidebar/WaypointList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import GearTab from '@/components/gear/GearTab'
import ItineraryTab from '@/components/itinerary/ItineraryTab'
import ConditionsTab from '@/components/conditions/ConditionsTab'
import GPXImportButton from '@/components/map/GPXImportButton'
import GPXExportButton from '@/components/map/GPXExportButton'
import ShareToggle from '@/components/ShareToggle'
import ThemeToggle from '@/components/ThemeToggle'
import ProfileModal from '@/components/ProfileModal'
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
  const { logout } = useAuthStore()
  const currentTrip = trips.find((t) => t.id === tripId) ?? null
  const [tripName, setTripName] = useState<string>(currentTrip?.title ?? '')
  const [isPublic, setIsPublic] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const updateTrip = useTripStore((s) => s.updateTrip)

  // Load trip's is_public status
  useEffect(() => {
    if (!tripId) return
    getTrip(tripId).then((res) => {
      if (res.data) {
        setIsPublic(res.data.is_public)
        setTripName(res.data.title)
      }
    })
  }, [tripId])

  // Sync isPublic when trips list updates
  useEffect(() => {
    if (currentTrip) {
      setIsPublic(currentTrip.is_public)
      setTripName(currentTrip.title)
    }
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

  const resetMapView = useCallback(() => {
    setSelectedWaypointId(null)
    const map = mapRef.current?.getMap() ?? null
    if (map && waypoints.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      waypoints.forEach((wp) => bounds.extend([wp.lng, wp.lat]))
      if (route) {
        const coords = (route as { geometry: { coordinates: number[][] } }).geometry?.coordinates
        coords?.forEach((c) => bounds.extend(c as [number, number]))
      }
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1200 })
    }
  }, [waypoints, route])

  const handleWaypointSelect = useCallback(
    (waypoint: Waypoint) => {
      if (selectedWaypointId === waypoint.id) {
        resetMapView()
      } else {
        setSelectedWaypointId(waypoint.id)
        const map = mapRef.current?.getMap() ?? null
        panToWaypoint(map, waypoint)
      }
    },
    [selectedWaypointId, resetMapView],
  )

  const startEditingName = useCallback(() => {
    setEditingName(tripName)
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.select(), 0)
  }, [tripName])

  const saveEditingName = useCallback(async () => {
    setIsEditingName(false)
    const trimmed = editingName.trim()
    if (!trimmed || trimmed === tripName || !tripId) return
    setTripName(trimmed)
    const result = await updateTrip(tripId, { title: trimmed })
    if (result) {
      toast.success('Trip renamed')
    } else {
      setTripName(tripName) // revert on failure
      toast.error('Failed to rename trip')
    }
  }, [editingName, tripName, tripId, updateTrip])

  const cancelEditingName = useCallback(() => {
    setIsEditingName(false)
  }, [])

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
          <Breadcrumb items={[
            { label: 'TrailForge', href: '/dashboard' },
            { label: 'Trip Planner', onClick: resetMapView },
          ]} />
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
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/robpitcher/backpack-planner" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Profile menu" className="cursor-pointer">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          {/* Logo */}
          <div className="flex justify-center border-b px-3 py-3">
            <img src="/logo.png" alt="TrailForge" className="h-32 w-auto opacity-100" />
          </div>

          <Tabs defaultValue="map" className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b px-3 pb-2 pt-3">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  className="w-full text-base font-bold tracking-wide break-words bg-transparent border-b-2 border-primary outline-none"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveEditingName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEditingName()
                    if (e.key === 'Escape') cancelEditingName()
                  }}
                  autoFocus
                />
              ) : (
                <button
                  className="group flex w-full items-center gap-1.5 text-left cursor-pointer"
                  onClick={startEditingName}
                  title="Click to rename"
                >
                  <h2 className="text-base font-bold tracking-wide break-words">
                    {tripName || 'Trip Planner'}
                  </h2>
                  <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <TabsList className="mx-2 mt-2 flex h-auto w-auto shrink-0 flex-wrap gap-1">
              <TabsTrigger value="map" className="text-xs px-2 py-1 focus-visible:ring-0 focus-visible:outline-none">
                <Map className="mr-1 h-3.5 w-3.5" />
                Map
              </TabsTrigger>
              <TabsTrigger value="gear" className="text-xs px-2 py-1 focus-visible:ring-0 focus-visible:outline-none">
                <Backpack className="mr-1 h-3.5 w-3.5" />
                Gear
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="text-xs px-2 py-1 focus-visible:ring-0 focus-visible:outline-none">
                <CalendarDays className="mr-1 h-3.5 w-3.5" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="conditions" className="text-xs px-2 py-1 focus-visible:ring-0 focus-visible:outline-none">
                <CloudSun className="mr-1 h-3.5 w-3.5" />
                Conditions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="min-h-0 flex-1 overflow-y-auto">
              <WaypointList
                waypoints={waypoints}
                selectedWaypointId={selectedWaypointId}
                onSelect={handleWaypointSelect}
                onDeselect={resetMapView}
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

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  )
}
