import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { buildGPX, downloadGPX } from '@/lib/gpx/export'
import { useTripStore } from '@/stores/tripStore'
import { getTrip } from '@/lib/api/trips'

interface GPXExportButtonProps {
  tripId: string
}

export default function GPXExportButton({ tripId }: GPXExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const route = useTripStore((s) => s.route)
  const waypoints = useTripStore((s) => s.waypoints)

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data: trip } = await getTrip(tripId)
      if (!trip) {
        toast.error('Could not load trip data')
        return
      }

      if (!route && waypoints.length === 0) {
        toast.error('Nothing to export — draw a route or add waypoints first')
        return
      }

      const gpxContent = buildGPX(trip, route, waypoints)
      downloadGPX(gpxContent, trip.title)
      toast.success('GPX file downloaded')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to export GPX',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={exporting}
      onClick={handleExport}
    >
      <Download className="mr-1 h-4 w-4" />
      {exporting ? 'Exporting…' : 'Export GPX'}
    </Button>
  )
}
