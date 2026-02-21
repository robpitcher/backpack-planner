import { useNavigate } from 'react-router-dom'
import { Calendar, Ruler, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Trip, TripStatus, UnitSystem } from '@/types'
import { formatDistance } from '@/utils/units'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<TripStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
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

function getRouteDistance(routeGeojson: Record<string, unknown> | null): number | null {
  if (!routeGeojson) return null
  const geom = routeGeojson as { geometry?: { coordinates?: number[][] } }
  const coords = geom.geometry?.coordinates
  if (!coords || coords.length < 2) return null
  // Simple haversine-based distance estimate
  let totalKm = 0
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1]
    const [lon2, lat2] = coords[i]
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2
    totalKm += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
  return totalKm * 0.621371 // km to miles
}

interface TripListItemProps {
  trip: Trip
  units: UnitSystem
  isSelected?: boolean
  isHighlighted?: boolean
  onHover?: (tripId: string | null) => void
  onClick?: (tripId: string) => void
}

export default function TripListItem({
  trip,
  units,
  isSelected,
  isHighlighted,
  onHover,
  onClick,
}: TripListItemProps) {
  const navigate = useNavigate()
  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  const distance = getRouteDistance(trip.route_geojson)

  const handleClick = () => {
    if (onClick) {
      onClick(trip.id)
    } else {
      navigate(`/trip/${trip.id}/plan`)
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full flex-col gap-1 border-b px-3 py-2.5 text-left transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent',
        isHighlighted && !isSelected && 'bg-accent/30',
      )}
      onMouseEnter={() => onHover?.(trip.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="line-clamp-1 text-sm font-medium text-foreground">
          {trip.title}
        </span>
        <Badge
          variant="secondary"
          className={cn('shrink-0 text-[10px] px-1.5 py-0', STATUS_STYLES[trip.status])}
        >
          {trip.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {dateRange && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            {dateRange}
          </span>
        )}
        {distance != null && (
          <span className="flex items-center gap-1">
            <Ruler className="h-3 w-3 shrink-0" />
            {formatDistance(distance, units)}
          </span>
        )}
        {trip.route_geojson && !distance && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            Route
          </span>
        )}
      </div>
    </button>
  )
}
