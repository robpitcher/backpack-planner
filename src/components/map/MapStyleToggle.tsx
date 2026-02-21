import { Mountain, Satellite } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type MapStyle = 'liberty' | 'positron'

interface MapStyleToggleProps {
  currentStyle: MapStyle
  onToggle: (style: MapStyle) => void
}

export default function MapStyleToggle({
  currentStyle,
  onToggle,
}: MapStyleToggleProps) {
  const isPositron = currentStyle === 'positron'

  const toggle = () => {
    onToggle(isPositron ? 'liberty' : 'positron')
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggle}
      className="absolute right-3 top-3 z-10 h-9 w-9 bg-white shadow-md hover:bg-gray-100"
      title={isPositron ? 'Switch to outdoor' : 'Switch to clean'}
    >
      {isPositron ? (
        <Mountain className="h-4 w-4" />
      ) : (
        <Satellite className="h-4 w-4" />
      )}
    </Button>
  )
}
