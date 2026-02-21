import { Mountain, Satellite } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type MapStyle = 'outdoors-v12' | 'satellite-streets-v12'

interface MapStyleToggleProps {
  currentStyle: MapStyle
  onToggle: (style: MapStyle) => void
}

export default function MapStyleToggle({
  currentStyle,
  onToggle,
}: MapStyleToggleProps) {
  const isSatellite = currentStyle === 'satellite-streets-v12'

  const toggle = () => {
    onToggle(isSatellite ? 'outdoors-v12' : 'satellite-streets-v12')
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggle}
      className="absolute right-3 top-3 z-10 h-9 w-9 bg-white shadow-md hover:bg-gray-100"
      title={isSatellite ? 'Switch to topo' : 'Switch to satellite'}
    >
      {isSatellite ? (
        <Mountain className="h-4 w-4" />
      ) : (
        <Satellite className="h-4 w-4" />
      )}
    </Button>
  )
}
