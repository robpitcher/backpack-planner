import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTripStore } from '@/stores/tripStore'

interface RenameTripDialogProps {
  tripId: string
  currentTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RenameTripDialog({
  tripId,
  currentTitle,
  open,
  onOpenChange,
}: RenameTripDialogProps) {
  const updateTrip = useTripStore((s) => s.updateTrip)
  const [title, setTitle] = useState(currentTitle)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || title.trim() === currentTitle) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    const result = await updateTrip(tripId, { title: title.trim() })
    setIsSubmitting(false)

    if (result) {
      toast.success('Trip renamed')
      onOpenChange(false)
    } else {
      toast.error('Failed to rename trip')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTitle(currentTitle)
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Trip</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="rename-title">Title</Label>
            <Input
              id="rename-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
