import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  Mountain,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { WAYPOINT_STYLES } from '@/components/map/waypointUtils'
import { formatDistance, formatElevation } from '@/utils/units'
import type { Day, Waypoint, UnitSystem } from '@/types'

interface DayCardProps {
  day: Day
  dayDate: string | null
  waypoints: Waypoint[]
  unassignedWaypoints: Waypoint[]
  units: UnitSystem
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdateNotes: (notes: string) => void
  onAssignWaypoint: (waypointId: string, dayId: string | null) => void
}

export default function DayCard({
  day,
  dayDate,
  waypoints,
  unassignedWaypoints,
  units,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdateNotes,
  onAssignWaypoint,
}: DayCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(day.notes ?? '')

  function handleSaveNotes() {
    onUpdateNotes(notesValue)
    setEditingNotes(false)
    toast.success('Notes saved')
  }

  return (
    <div className="rounded-lg border bg-white">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Day {day.day_number}</span>
            {dayDate && (
              <span className="text-xs text-gray-500">{dayDate}</span>
            )}
            <Badge variant="outline" className="text-[10px]">
              {waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {/* Inline stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
            {day.target_miles != null && day.target_miles > 0 && (
              <span className="flex items-center gap-0.5">
                <Mountain className="h-3 w-3" />
                {formatDistance(day.target_miles, units)}
              </span>
            )}
            {day.elevation_gain != null && day.elevation_gain > 0 && (
              <span className="flex items-center gap-0.5 text-green-600">
                <TrendingUp className="h-3 w-3" />
                +{formatElevation(day.elevation_gain, units)}
              </span>
            )}
            {day.elevation_loss != null && day.elevation_loss > 0 && (
              <span className="flex items-center gap-0.5 text-red-600">
                <TrendingDown className="h-3 w-3" />
                -{formatElevation(day.elevation_loss, units)}
              </span>
            )}
          </div>
        </div>
        {/* Reorder + delete buttons (stop propagation to avoid toggle) */}
        <div
          className="flex shrink-0 items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label="Move day up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Move day down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive"
                aria-label="Delete day"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Day {day.day_number}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the day and unassign its waypoints. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t px-3 py-2 space-y-2">
          {/* Waypoints list */}
          {waypoints.length > 0 ? (
            <ul className="space-y-1">
              {waypoints.map((wp) => {
                const style = WAYPOINT_STYLES[wp.type]
                return (
                  <li
                    key={wp.id}
                    className="group flex items-center gap-2 rounded px-1.5 py-1 hover:bg-gray-50"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] opacity-0 group-hover:opacity-100"
                      onClick={() => onAssignWaypoint(wp.id, null)}
                    >
                      Remove
                    </Button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-xs text-gray-400 py-1">
              No waypoints assigned to this day.
            </p>
          )}

          {/* Assign waypoint dropdown */}
          {unassignedWaypoints.length > 0 && (
            <Select
              onValueChange={(wpId) => onAssignWaypoint(wpId, day.id)}
              value=""
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="+ Assign waypoint…" />
              </SelectTrigger>
              <SelectContent>
                {unassignedWaypoints.map((wp) => (
                  <SelectItem key={wp.id} value={wp.id}>
                    {wp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Notes */}
          {editingNotes ? (
            <div className="space-y-1">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Day notes…"
                className="min-h-[60px] text-xs"
              />
              <div className="flex gap-1">
                <Button size="sm" className="h-7 text-xs" onClick={handleSaveNotes}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditingNotes(false)
                    setNotesValue(day.notes ?? '')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingNotes(true)}
              className="w-full text-left text-xs text-gray-400 hover:text-gray-600 rounded px-1 py-0.5"
            >
              {day.notes || '+ Add notes…'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
