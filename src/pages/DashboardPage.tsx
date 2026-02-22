import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Compass, UserCircle, PanelLeft, PanelLeftClose, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'
import { useTripStore, useFilteredTrips } from '@/stores/tripStore'
import TripListItem from '@/components/TripListItem'
import DashboardMap from '@/components/map/DashboardMap'
import Breadcrumb from '@/components/Breadcrumb'
import ThemeToggle from '@/components/ThemeToggle'
import CreateTripDialog from '@/components/CreateTripDialog'
import ProfileModal from '@/components/ProfileModal'
import type { TripStatus } from '@/types'

const FILTER_OPTIONS: { label: string; value: TripStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Planned', value: 'planned' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]

function ListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b px-3 py-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-2/5" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const userProfile = useAuthStore((s) => s.userProfile)
  const { logout } = useAuthStore()
  const { isLoading, statusFilter, fetchTrips, setFilter } = useTripStore()
  const filteredTrips = useFilteredTrips()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [highlightedTripId, setHighlightedTripId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const units = userProfile?.preferred_units ?? 'imperial'

  useEffect(() => {
    if (user?.id) {
      fetchTrips(user.id)
    }
  }, [user?.id, fetchTrips])

  const handleTripClick = useCallback(
    (tripId: string) => {
      if (selectedTripId === tripId) {
        // Double-click / re-click navigates to planner
        navigate(`/trip/${tripId}/plan`)
      } else {
        setSelectedTripId(tripId)
      }
    },
    [selectedTripId, navigate],
  )

  const handleMarkerClick = useCallback(
    (tripId: string) => {
      setSelectedTripId((prev) => (prev === tripId ? null : tripId))
    },
    [],
  )

  const handleMapBackgroundClick = useCallback(() => {
    setSelectedTripId(null)
  }, [])

  const handleWaypointClick = useCallback(
    (tripId: string, waypointId: string) => {
      if (selectedTripId) {
        navigate(`/trip/${tripId}/plan?waypoint=${waypointId}`)
      } else {
        setSelectedTripId(tripId)
      }
    },
    [selectedTripId, navigate],
  )

  const handleTripDelete = useCallback(
    (tripId: string) => {
      if (selectedTripId === tripId) {
        setSelectedTripId(null)
      }
    },
    [selectedTripId],
  )

  return (
    <div className="flex h-screen min-h-0 w-full flex-col">
      {/* Compact header */}
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
          <Breadcrumb items={[{ label: 'TrailForge', onClick: () => setSelectedTripId(null) }]} />
        </div>
        <div className="flex items-center gap-2">
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
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'flex' : 'hidden'
          } w-full shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground sm:w-[280px] lg:flex lg:w-80`}
        >
          {/* Logo */}
          <div className="flex justify-center border-b px-3 py-3">
            <img src="/logo.png" alt="TrailForge" className="h-38 w-auto opacity-100" />
          </div>

          {/* Sidebar header */}
          <div className="shrink-0 border-b px-3 pb-2 pt-3">
            <h2 className="text-base font-bold tracking-wide">Trips</h2>
            <p className="mb-1.5 mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Filters</p>
            <div className="flex flex-wrap gap-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    statusFilter.has(opt.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trip list — scrollable */}
          <div
            className="min-h-0 flex-1 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedTripId(null)
            }}
          >
            {isLoading ? (
              <ListSkeleton />
            ) : filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Compass className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">No trips yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first trip to get started
                </p>
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <TripListItem
                  key={trip.id}
                  trip={trip}
                  units={units}
                  isSelected={trip.id === selectedTripId}
                  isHighlighted={trip.id === highlightedTripId}
                  onHover={setHighlightedTripId}
                  onClick={handleTripClick}
                  onDelete={handleTripDelete}
                />
              ))
            )}
          </div>

          {/* Create button — sticky bottom */}
          <div className="shrink-0 border-t p-2">
            <Button className="w-full" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Trip
            </Button>
          </div>
        </aside>

        {/* Floating sidebar toggle for mobile when sidebar is closed */}
        {!sidebarOpen && (
          <Button
            variant="secondary"
            size="sm"
            className="fixed bottom-4 left-4 z-30 shadow-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="mr-1 h-4 w-4" />
            Trips
          </Button>
        )}

        {/* Map area */}
        <div className="relative flex min-h-[300px] flex-1 flex-col">
          <DashboardMap
            trips={filteredTrips}
            selectedTripId={selectedTripId}
            highlightedTripId={highlightedTripId}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={setHighlightedTripId}
            onMapClick={handleMapBackgroundClick}
            onWaypointClick={handleWaypointClick}
          />
        </div>
      </div>

      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  )
}
