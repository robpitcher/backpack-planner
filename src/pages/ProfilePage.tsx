import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getUserProfile, updateUserProfile } from '@/lib/api/profile'
import type { UpdateProfileInput } from '@/lib/api/profile'
import type { UnitSystem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, setPreferredUnits } = useAuthStore()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [skillLevel, setSkillLevel] = useState<string>('beginner')
  const [units, setUnits] = useState<UnitSystem>('imperial')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return

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
  }, [user])

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
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          ← Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill-level">Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger id="skill-level">
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
              <Label htmlFor="unit-toggle">Unit Preference</Label>
              <p className="text-sm text-muted-foreground">
                {units === 'metric'
                  ? 'Metric (km, m, g, °C)'
                  : 'Imperial (mi, ft, oz, °F)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Imperial</span>
              <Switch
                id="unit-toggle"
                checked={units === 'metric'}
                onCheckedChange={(checked) =>
                  setUnits(checked ? 'metric' : 'imperial')
                }
              />
              <span className="text-sm text-muted-foreground">Metric</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
