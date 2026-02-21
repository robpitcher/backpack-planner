import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { parseGPX } from '@/lib/gpx/import'
import { useTripStore } from '@/stores/tripStore'
import { createWaypoint } from '@/lib/api/waypoints'
import { updateTrip } from '@/lib/api/trips'
import { kilometersToMiles } from '@/utils/units'
import length from '@turf/length'
import { lineString } from '@turf/helpers'

interface GPXImportButtonProps {
  tripId: string
}

export default function GPXImportButton({ tripId }: GPXImportButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const setRoute = useTripStore((s) => s.setRoute)
  const addWaypoint = useTripStore((s) => s.addWaypoint)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)

    try {
      const text = await file.text()
      const result = parseGPX(text)

      if (!result.route && result.waypoints.length === 0) {
        toast.error('GPX file contains no route or waypoints')
        return
      }

      // Import route
      if (result.route) {
        const geojson = result.route as unknown as Record<string, unknown>
        setRoute(geojson)
        // Persist to DB
        await updateTrip(tripId, { route_geojson: geojson })
      }

      // Import waypoints
      let wpCount = 0
      for (const wp of result.waypoints) {
        const { data } = await createWaypoint(tripId, {
          name: wp.name,
          type: wp.type,
          lat: wp.lat,
          lng: wp.lng,
          elevation: wp.elevation,
          sort_order: wpCount,
        })
        if (data) {
          addWaypoint(data)
          wpCount++
        }
      }

      // Calculate distance for toast
      let distStr = ''
      if (result.route?.geometry.type === 'LineString') {
        const coords = (result.route.geometry as GeoJSON.LineString).coordinates
        if (coords.length >= 2) {
          const mi = kilometersToMiles(
            length(lineString(coords), { units: 'kilometers' }),
          )
          distStr = `${mi.toFixed(1)} mi, `
        }
      }

      toast.success(`Imported route (${distStr}${wpCount} waypoints)`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to import GPX file',
      )
    } finally {
      setImporting(false)
      // Reset so same file can be re-imported
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={importing}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mr-1 h-4 w-4" />
        {importing ? 'Importing…' : 'Import GPX'}
      </Button>
    </>
  )
}
