import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WAYPOINT_STYLES, WAYPOINT_TYPES } from '@/components/map/waypointUtils'
import { useTripStore } from '@/stores/tripStore'
import { updateWaypoint as apiUpdateWaypoint } from '@/lib/api/waypoints'
import type { Waypoint, WaypointType } from '@/types'

interface WaypointEditDialogProps {
  waypoint: Waypoint
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WaypointEditDialog({
  waypoint,
  open,
  onOpenChange,
}: WaypointEditDialogProps) {
  const updateWaypoint = useTripStore((s) => s.updateWaypoint)

  const [name, setName] = useState(waypoint.name)
  const [type, setType] = useState<WaypointType>(waypoint.type)
  const [notes, setNotes] = useState(waypoint.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when waypoint changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(waypoint.name)
      setType(waypoint.type)
      setNotes(waypoint.notes ?? '')
    }
  }, [open, waypoint])

  async function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setIsSaving(true)
    const updates = {
      name: trimmedName,
      type,
      notes: notes.trim() || null,
    }

    // Optimistic local update
    updateWaypoint(waypoint.id, updates)

    const { error } = await apiUpdateWaypoint(waypoint.id, updates)
    setIsSaving(false)

    if (error) {
      // Rollback on failure
      updateWaypoint(waypoint.id, {
        name: waypoint.name,
        type: waypoint.type,
        notes: waypoint.notes,
      })
      toast.error('Failed to update waypoint')
    } else {
      toast.success('Waypoint updated')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Waypoint</DialogTitle>
          <DialogDescription>Update the waypoint details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="wp-name">Name</Label>
            <Input
              id="wp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Waypoint name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wp-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as WaypointType)}>
              <SelectTrigger id="wp-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WAYPOINT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {WAYPOINT_STYLES[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wp-notes">Notes</Label>
            <Textarea
              id="wp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
