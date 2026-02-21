import type { Waypoint } from '@/types'
import { WAYPOINT_STYLES } from '@/components/map/waypointUtils'

interface WaypointListProps {
  waypoints: Waypoint[]
  onSelect: (waypoint: Waypoint) => void
}

export default function WaypointList({
  waypoints,
  onSelect,
}: WaypointListProps) {
  if (waypoints.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm text-gray-400">
        No waypoints yet. Click &quot;Place Waypoint&quot; on the map to add one.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Waypoints ({waypoints.length})
        </h3>
      </div>
      <ul className="divide-y">
        {waypoints.map((wp) => {
          const style = WAYPOINT_STYLES[wp.type]
          return (
            <li key={wp.id}>
              <button
                onClick={() => onSelect(wp)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <span
                  className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: style.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800">
                    {wp.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{style.label}</span>
                    {wp.elevation != null && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{Math.round(wp.elevation)} ft</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
