import { Pencil, Undo2, Trash2, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DrawControlsProps {
  isDrawing: boolean
  hasPoints: boolean
  isPlacingWaypoint: boolean
  onStartDraw: () => void
  onUndo: () => void
  onClear: () => void
  onFinish: () => void
  onToggleWaypoint: () => void
}

export default function DrawControls({
  isDrawing,
  hasPoints,
  isPlacingWaypoint,
  onStartDraw,
  onUndo,
  onClear,
  onFinish,
  onToggleWaypoint,
}: DrawControlsProps) {
  return (
    <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
      <Button
        variant={isDrawing ? 'default' : 'secondary'}
        size="icon"
        onClick={onStartDraw}
        className="h-9 w-9 bg-white text-gray-700 shadow-md hover:bg-gray-100 data-[active=true]:bg-orange-600 data-[active=true]:text-white data-[active=true]:hover:bg-orange-700"
        data-active={isDrawing}
        title={isDrawing ? 'Drawing route…' : 'Draw route'}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        variant={isPlacingWaypoint ? 'default' : 'secondary'}
        size="icon"
        onClick={onToggleWaypoint}
        className="h-9 w-9 bg-white text-gray-700 shadow-md hover:bg-gray-100 data-[active=true]:bg-purple-600 data-[active=true]:text-white data-[active=true]:hover:bg-purple-700"
        data-active={isPlacingWaypoint}
        title={isPlacingWaypoint ? 'Placing waypoint…' : 'Place waypoint'}
      >
        <MapPin className="h-4 w-4" />
      </Button>

      {hasPoints && (
        <>
          <Button
            variant="secondary"
            size="icon"
            onClick={onUndo}
            className="h-9 w-9 bg-white text-gray-700 shadow-md hover:bg-gray-100"
            title="Undo last point"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={onClear}
            className="h-9 w-9 bg-white text-gray-700 shadow-md hover:bg-gray-100"
            title="Clear route"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {isDrawing && (
            <Button
              variant="secondary"
              size="icon"
              onClick={onFinish}
              className="h-9 w-9 bg-white text-gray-700 shadow-md hover:bg-gray-100"
              title="Finish drawing"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}
