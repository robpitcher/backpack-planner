import { Route, MapPin } from 'lucide-react'
import type { UnitSystem } from '@/types'
import { formatDistance } from '@/utils/units'

interface RouteStatsProps {
  distanceMiles: number
  pointCount: number
  units: UnitSystem
}

export default function RouteStats({
  distanceMiles,
  pointCount,
  units,
}: RouteStatsProps) {
  if (pointCount === 0) return null

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-lg bg-white/95 px-4 py-2 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Route className="h-4 w-4 text-orange-600" />
        <span>{formatDistance(distanceMiles, units)}</span>
      </div>
      <div className="h-4 w-px bg-gray-300" />
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <MapPin className="h-4 w-4 text-orange-600" />
        <span>
          {pointCount} {pointCount === 1 ? 'point' : 'points'}
        </span>
      </div>
    </div>
  )
}
