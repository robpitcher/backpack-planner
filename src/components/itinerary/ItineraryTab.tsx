import { useEffect, useMemo, useCallback } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WAYPOINT_STYLES } from '@/components/map/waypointUtils'
import { formatElevation } from '@/utils/units'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import type { Waypoint } from '@/types'
import DayCard from './DayCard'

interface ItineraryTabProps {
  tripId: string
  startDate: string | null
}

/** Compute a display date from trip start_date and day offset */
function computeDayDate(startDate: string | null, dayNumber: number): string | null {
  if (!startDate) return null
  const d = new Date(startDate + 'T00:00:00')
  d.setDate(d.getDate() + dayNumber - 1)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ItineraryTab({ tripId, startDate }: ItineraryTabProps) {
  const days = useTripStore((s) => s.days)
  const waypoints = useTripStore((s) => s.waypoints)
  const daysLoading = useTripStore((s) => s.daysLoading)
  const fetchDays = useTripStore((s) => s.fetchDays)
  const createDayApi = useTripStore((s) => s.createDayApi)
  const updateDayApi = useTripStore((s) => s.updateDayApi)
  const deleteDayApi = useTripStore((s) => s.deleteDayApi)
  const reorderDaysApi = useTripStore((s) => s.reorderDaysApi)
  const assignWaypointToDay = useTripStore((s) => s.assignWaypointToDay)
  const units = useAuthStore((s) => s.preferredUnits)

  useEffect(() => {
    fetchDays(tripId)
  }, [tripId, fetchDays])

  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.day_number - b.day_number),
    [days],
  )

  const unassignedWaypoints = useMemo(
    () => waypoints.filter((w) => !w.day_id).sort((a, b) => a.sort_order - b.sort_order),
    [waypoints],
  )

  // Map day_id → waypoints
  const waypointsByDay = useMemo(() => {
    const map = new Map<string, Waypoint[]>()
    for (const w of waypoints) {
      if (w.day_id) {
        const list = map.get(w.day_id) ?? []
        list.push(w)
        map.set(w.day_id, list)
      }
    }
    // Sort each list by sort_order
    for (const [, list] of map) {
      list.sort((a, b) => a.sort_order - b.sort_order)
    }
    return map
  }, [waypoints])

  const handleAddDay = useCallback(async () => {
    const nextNumber = sortedDays.length > 0
      ? Math.max(...sortedDays.map((d) => d.day_number)) + 1
      : 1
    const result = await createDayApi(tripId, { day_number: nextNumber })
    if (result) toast.success(`Day ${nextNumber} added`)
    else toast.error('Failed to add day')
  }, [tripId, sortedDays, createDayApi])

  const handleDeleteDay = useCallback(
    async (dayId: string, dayNumber: number) => {
      const ok = await deleteDayApi(dayId)
      if (ok) toast.success(`Day ${dayNumber} deleted`)
      else toast.error('Failed to delete day')
    },
    [deleteDayApi],
  )

  const handleMoveDay = useCallback(
    async (dayIndex: number, direction: 'up' | 'down') => {
      const swapIndex = direction === 'up' ? dayIndex - 1 : dayIndex + 1
      if (swapIndex < 0 || swapIndex >= sortedDays.length) return
      const newOrder = [...sortedDays]
      const tmp = newOrder[dayIndex]
      newOrder[dayIndex] = newOrder[swapIndex]
      newOrder[swapIndex] = tmp
      const ok = await reorderDaysApi(
        tripId,
        newOrder.map((d) => d.id),
      )
      if (!ok) toast.error('Failed to reorder days')
    },
    [tripId, sortedDays, reorderDaysApi],
  )

  const handleUpdateNotes = useCallback(
    async (dayId: string, notes: string) => {
      await updateDayApi(dayId, { notes: notes || null })
    },
    [updateDayApi],
  )

  const handleAssignWaypoint = useCallback(
    async (waypointId: string, dayId: string | null) => {
      const ok = await assignWaypointToDay(waypointId, dayId)
      if (!ok) toast.error('Failed to assign waypoint')
    },
    [assignWaypointToDay],
  )

  if (daysLoading && days.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Itinerary</h2>
        <Badge variant="outline" className="text-xs">
          {sortedDays.length} day{sortedDays.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Unassigned waypoints */}
      {unassignedWaypoints.length > 0 && (
        <div className="rounded-lg border border-dashed bg-gray-50 p-2.5">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Unassigned Waypoints ({unassignedWaypoints.length})
          </h3>
          <ul className="space-y-1">
            {unassignedWaypoints.map((wp) => {
              const style = WAYPOINT_STYLES[wp.type]
              return (
                <li
                  key={wp.id}
                  className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-white"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: style.color }}
                  />
                  <span className="flex-1 truncate text-sm">{wp.name}</span>
                  {wp.elevation != null && (
                    <span className="text-xs text-gray-500">
                      {formatElevation(wp.elevation, units)}
                    </span>
                  )}
                  {sortedDays.length > 0 && (
                    <Select
                      onValueChange={(dayId) =>
                        handleAssignWaypoint(wp.id, dayId)
                      }
                      value=""
                    >
                      <SelectTrigger className="h-6 w-auto min-w-[80px] text-[10px]">
                        <SelectValue placeholder="Move to…" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedDays.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            Day {d.day_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Day cards */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {sortedDays.map((day, index) => (
          <DayCard
            key={day.id}
            day={day}
            dayDate={computeDayDate(startDate, day.day_number)}
            waypoints={waypointsByDay.get(day.id) ?? []}
            unassignedWaypoints={unassignedWaypoints}
            units={units}
            isFirst={index === 0}
            isLast={index === sortedDays.length - 1}
            onMoveUp={() => handleMoveDay(index, 'up')}
            onMoveDown={() => handleMoveDay(index, 'down')}
            onDelete={() => handleDeleteDay(day.id, day.day_number)}
            onUpdateNotes={(notes) => handleUpdateNotes(day.id, notes)}
            onAssignWaypoint={handleAssignWaypoint}
          />
        ))}

        {sortedDays.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No days yet. Add a day to start planning your itinerary.
          </p>
        )}
      </div>

      {/* Add Day button */}
      <Button onClick={handleAddDay} className="w-full">
        <Plus className="mr-1 h-4 w-4" />
        Add Day
      </Button>
    </div>
  )
}
