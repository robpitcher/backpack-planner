import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTripStore } from '@/stores/tripStore'
import { deleteWaypoint as apiDeleteWaypoint } from '@/lib/api/waypoints'

interface DeleteWaypointDialogProps {
  waypointId: string
  waypointName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteWaypointDialog({
  waypointId,
  waypointName,
  open,
  onOpenChange,
}: DeleteWaypointDialogProps) {
  const removeWaypoint = useTripStore((s) => s.removeWaypoint)
  const waypoints = useTripStore((s) => s.waypoints)
  const setWaypoints = useTripStore((s) => s.setWaypoints)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const prev = waypoints

    // Optimistic removal
    removeWaypoint(waypointId)

    const { error } = await apiDeleteWaypoint(waypointId)
    setIsDeleting(false)

    if (error) {
      setWaypoints(prev)
      toast.error('Failed to delete waypoint')
    } else {
      toast.success('Waypoint deleted')
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &lsquo;{waypointName}&rsquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. The waypoint will be permanently removed from your trip.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
