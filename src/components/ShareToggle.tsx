import { useState, useCallback } from 'react'
import { Globe, Lock, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTripStore } from '@/stores/tripStore'

interface ShareToggleProps {
  tripId: string
  isPublic: boolean
}

export default function ShareToggle({ tripId, isPublic }: ShareToggleProps) {
  const [copied, setCopied] = useState(false)
  const updateTrip = useTripStore((s) => s.updateTrip)

  const shareUrl = `${window.location.origin}/trip/${tripId}`

  const handleToggle = useCallback(
    async (checked: boolean) => {
      const result = await updateTrip(tripId, { is_public: checked })
      if (result) {
        toast.success(checked ? 'Trip is now public' : 'Trip is now private')
      } else {
        toast.error('Failed to update sharing')
      }
    },
    [tripId, updateTrip],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }, [shareUrl])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isPublic ? (
          <Globe className="h-4 w-4 text-green-600" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <Label htmlFor="share-toggle" className="text-sm font-medium">
          {isPublic ? 'Public' : 'Private'}
        </Label>
        <Switch
          id="share-toggle"
          checked={isPublic}
          onCheckedChange={handleToggle}
        />
      </div>

      {isPublic && (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 truncate rounded border bg-muted px-2 py-1 text-xs text-muted-foreground"
          />
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
