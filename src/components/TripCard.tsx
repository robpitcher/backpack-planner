import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Ruler, MoreVertical, Pencil, Archive, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import RenameTripDialog from '@/components/RenameTripDialog'
import DeleteTripDialog from '@/components/DeleteTripDialog'
import DuplicateTripDialog from '@/components/DuplicateTripDialog'
import { useTripStore } from '@/stores/tripStore'
import type { Trip, TripStatus, UnitSystem } from '@/types'
import { formatDistance } from '@/utils/units'

const STATUS_STYLES: Record<TripStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  planned: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  active: 'bg-green-100 text-green-700 hover:bg-green-100',
  completed: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start) return null
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  return end ? `${fmt(start)} — ${fmt(end)}` : fmt(start)
}

function computeDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const ms = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

interface TripCardProps {
  trip: Trip
  units: UnitSystem
}

export default function TripCard({ trip, units }: TripCardProps) {
  const navigate = useNavigate()
  const archiveTripAction = useTripStore((s) => s.archiveTrip)
  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  const days = computeDays(trip.start_date, trip.end_date)

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)

  async function handleArchive() {
    const ok = await archiveTripAction(trip.id)
    if (ok) {
      toast.success('Trip archived')
    } else {
      toast.error('Failed to archive trip')
    }
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => navigate(`/trip/${trip.id}/plan`)}
      >
        {/* Map thumbnail placeholder */}
        <div className="flex h-32 items-center justify-center rounded-t-lg bg-muted">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">{trip.title}</CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className={STATUS_STYLES[trip.status]}>
                {trip.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Trip actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {trip.status !== 'completed' && (
                    <DropdownMenuItem onClick={handleArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          {dateRange && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{dateRange}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {days != null && (
              <span>
                {days} {days === 1 ? 'day' : 'days'}
              </span>
            )}
            {trip.route_geojson && (
              <div className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDistance(0, units)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RenameTripDialog
        tripId={trip.id}
        currentTitle={trip.title}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DeleteTripDialog
        tripId={trip.id}
        tripTitle={trip.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <DuplicateTripDialog
        tripId={trip.id}
        tripTitle={trip.title}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
    </>
  )
}
