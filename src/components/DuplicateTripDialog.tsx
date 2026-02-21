import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { duplicateTrip } from '@/lib/api/duplicate'

interface DuplicateTripDialogProps {
  tripId: string
  tripTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DuplicateTripDialog({
  tripId,
  tripTitle,
  open,
  onOpenChange,
}: DuplicateTripDialogProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(`${tripTitle} (Copy)`)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    const { data, error } = await duplicateTrip(tripId, title.trim())
    setIsSubmitting(false)

    if (error || !data) {
      toast.error('Failed to duplicate trip')
      return
    }

    toast.success('Trip duplicated')
    onOpenChange(false)
    navigate(`/trip/${data.id}/plan`)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTitle(`${tripTitle} (Copy)`)
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Duplicate &lsquo;{tripTitle}&rsquo;</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="duplicate-title">New trip name</Label>
            <Input
              id="duplicate-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? 'Duplicating…' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
