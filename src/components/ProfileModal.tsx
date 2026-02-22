import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { getUserProfile, updateUserProfile } from '@/lib/api/profile'
import type { UpdateProfileInput } from '@/lib/api/profile'
import type { UnitSystem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, setPreferredUnits } = useAuthStore()

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [skillLevel, setSkillLevel] = useState<string>('beginner')
  const [units, setUnits] = useState<UnitSystem>('imperial')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open || !user) return

    setIsLoading(true)
    getUserProfile(user.id).then(({ data, error }) => {
      if (error || !data) {
        toast.error('Failed to load profile')
        setIsLoading(false)
        return
      }
      setDisplayName(data.display_name ?? '')
      setAvatarUrl(data.avatar_url ?? '')
      setSkillLevel(data.skill_level ?? 'beginner')
      setUnits(data.preferred_units)
      setIsLoading(false)
    })
  }, [open, user])

  async function handleSave() {
    if (!user) return

    setIsSaving(true)
    const input: UpdateProfileInput = {
      display_name: displayName,
      avatar_url: avatarUrl || null,
      skill_level: skillLevel,
      preferred_units: units,
    }

    const { error } = await updateUserProfile(user.id, input)
    setIsSaving(false)

    if (error) {
      toast.error('Failed to save profile')
      return
    }

    setPreferredUnits(units)
    toast.success('Profile saved')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your display name, avatar, and preferences.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="modal-display-name">Display Name</Label>
              <Input
                id="modal-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-avatar-url">Avatar URL</Label>
              <Input
                id="modal-avatar-url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-skill-level">Skill Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger id="modal-skill-level">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="modal-unit-toggle">Unit Preference</Label>
                <p className="text-sm text-muted-foreground">
                  {units === 'metric'
                    ? 'Metric (km, m, g, °C)'
                    : 'Imperial (mi, ft, oz, °F)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Imperial</span>
                <Switch
                  id="modal-unit-toggle"
                  checked={units === 'metric'}
                  onCheckedChange={(checked) =>
                    setUnits(checked ? 'metric' : 'imperial')
                  }
                />
                <span className="text-sm text-muted-foreground">Metric</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
