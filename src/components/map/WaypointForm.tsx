import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WaypointType, Waypoint } from '@/types'
import { WAYPOINT_STYLES, WAYPOINT_TYPES } from './waypointUtils'

export interface WaypointFormData {
  name: string
  type: WaypointType
  notes: string
}

interface WaypointFormProps {
  lat: number
  lng: number
  initialData?: Partial<Waypoint>
  onSubmit: (data: WaypointFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function WaypointForm({
  lat,
  lng,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WaypointFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [type, setType] = useState<WaypointType>(
    initialData?.type ?? 'poi',
  )
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), type, notes: notes.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-1">
      <div className="space-y-1">
        <Label htmlFor="wp-name" className="text-xs">
          Name *
        </Label>
        <Input
          id="wp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Trail Junction"
          className="h-8 text-sm"
          autoFocus
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="wp-type" className="text-xs">
          Type
        </Label>
        <Select value={type} onValueChange={(v) => setType(v as WaypointType)}>
          <SelectTrigger id="wp-type" className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WAYPOINT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                <span
                  className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: WAYPOINT_STYLES[t].color }}
                />
                {WAYPOINT_STYLES[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Coordinates</Label>
        <p className="text-xs text-muted-foreground">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="wp-notes" className="text-xs">
          Notes
        </Label>
        <Textarea
          id="wp-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes…"
          className="h-16 resize-none text-sm"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? 'Saving…' : initialData?.id ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
