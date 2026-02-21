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

interface DeleteTripDialogProps {
  tripId: string
  tripTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteTripDialog({
  tripId,
  tripTitle,
  open,
  onOpenChange,
}: DeleteTripDialogProps) {
  const deleteTripAction = useTripStore((s) => s.deleteTrip)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const ok = await deleteTripAction(tripId)
    setIsDeleting(false)

    if (ok) {
      toast.success('Trip deleted')
      onOpenChange(false)
    } else {
      toast.error('Failed to delete trip')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &lsquo;{tripTitle}&rsquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. All trip data including waypoints, itinerary, and gear lists will
            be permanently deleted.
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
