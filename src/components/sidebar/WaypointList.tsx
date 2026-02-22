import { useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import WaypointEditDialog from '@/components/sidebar/WaypointEditDialog'
import DeleteWaypointDialog from '@/components/sidebar/DeleteWaypointDialog'
import { WAYPOINT_STYLES } from '@/components/map/waypointUtils'
import type { Waypoint } from '@/types'

interface WaypointListProps {
  waypoints: Waypoint[]
  selectedWaypointId?: string | null
  onSelect: (waypoint: Waypoint) => void
  onDeselect?: () => void
}

export default function WaypointList({
  waypoints,
  selectedWaypointId,
  onSelect,
  onDeselect,
}: WaypointListProps) {
  const [editWaypoint, setEditWaypoint] = useState<Waypoint | null>(null)
  const [deleteWaypoint, setDeleteWaypoint] = useState<Waypoint | null>(null)

  if (waypoints.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
        No waypoints yet. Click &quot;Place Waypoint&quot; on the map to add one.
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-full flex-col">
        <div className="border-b px-3 py-2">
          <h3 className="text-sm font-semibold text-foreground">
            Waypoints ({waypoints.length})
          </h3>
        </div>
        <ul className="divide-y">
          {waypoints.map((wp) => {
            const style = WAYPOINT_STYLES[wp.type]
            return (
              <li key={wp.id} className="group">
                <div
                  className={`flex w-full items-center gap-2.5 px-3 py-2 transition-colors ${
                    wp.id === selectedWaypointId ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <button
                    onClick={() => onSelect(wp)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {wp.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{style.label}</span>
                        {wp.elevation != null && (
                          <>
                            <span className="text-muted-foreground/50">·</span>
                            <span>{Math.round(wp.elevation)} ft</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Waypoint actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => setEditWaypoint(wp)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteWaypoint(wp)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            )
          })}
        </ul>
        {/* Blank area — click to deselect waypoint */}
        <div className="flex-1" onClick={() => onDeselect?.()} />
      </div>

      {editWaypoint && (
        <WaypointEditDialog
          waypoint={editWaypoint}
          open={!!editWaypoint}
          onOpenChange={(open) => { if (!open) setEditWaypoint(null) }}
        />
      )}

      {deleteWaypoint && (
        <DeleteWaypointDialog
          waypointId={deleteWaypoint.id}
          waypointName={deleteWaypoint.name}
          open={true}
          onOpenChange={(open) => { if (!open) setDeleteWaypoint(null) }}
        />
      )}
    </>
  )
}
