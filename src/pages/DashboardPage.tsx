import { useEffect, useState } from 'react'
import { Plus, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'
import { useTripStore, useFilteredTrips } from '@/stores/tripStore'
import AppHeader from '@/components/AppHeader'
import TripCard from '@/components/TripCard'
import CreateTripDialog from '@/components/CreateTripDialog'
import type { TripStatus } from '@/types'

const FILTER_OPTIONS: { label: string; value: TripStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Planned', value: 'planned' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]

function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Skeleton className="h-32 rounded-b-none rounded-t-lg" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const userProfile = useAuthStore((s) => s.userProfile)
  const { isLoading, statusFilter, fetchTrips, setFilter } = useTripStore()
  const filteredTrips = useFilteredTrips()
  const [createOpen, setCreateOpen] = useState(false)

  const units = userProfile?.preferred_units ?? 'imperial'

  useEffect(() => {
    if (user?.id) {
      fetchTrips(user.id)
    }
  }, [user?.id, fetchTrips])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Trip
          </Button>
        </div>

        {/* Status filter */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Compass className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No trips yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first trip and start planning your next adventure!
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Trip
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} units={units} />
            ))}
          </div>
        )}
      </main>

      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
