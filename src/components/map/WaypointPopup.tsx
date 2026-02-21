import type { Waypoint } from '@/types'
import { WAYPOINT_STYLES } from './waypointUtils'

interface WaypointPopupProps {
  waypoint: Waypoint
  onEdit: () => void
  onDelete: () => void
}

export default function WaypointPopup({
  waypoint,
  onEdit,
  onDelete,
}: WaypointPopupProps) {
  const style = WAYPOINT_STYLES[waypoint.type]

  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: style.color }}
        />
        <span className="font-semibold text-sm">{waypoint.name}</span>
      </div>

      <div className="text-xs text-gray-500">
        {style.label}
      </div>

      {waypoint.elevation != null && (
        <div className="text-xs text-gray-500">
          Elevation: {Math.round(waypoint.elevation)} ft
        </div>
      )}

      {waypoint.notes && (
        <p className="text-xs text-gray-600 whitespace-pre-wrap">
          {waypoint.notes}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
