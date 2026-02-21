import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { formatWeight } from '@/utils/units'
import type { GearTemplate } from '@/types'

interface GearTemplateModalProps {
  tripId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GearTemplateModal({
  tripId,
  open,
  onOpenChange,
}: GearTemplateModalProps) {
  const templates = useTripStore((s) => s.gearTemplates)
  const gearItems = useTripStore((s) => s.gearItems)
  const fetchTemplates = useTripStore((s) => s.fetchTemplates)
  const loadTemplate = useTripStore((s) => s.loadTemplate)
  const units = useAuthStore((s) => s.preferredUnits)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    if (open && templates.length === 0) {
      fetchTemplates()
    }
  }, [open, templates.length, fetchTemplates])

  async function handleLoad(template: GearTemplate) {
    setLoadingId(template.id)
    const success = await loadTemplate(tripId, template.id)
    setLoadingId(null)
    if (success) {
      toast.success(`Loaded "${template.name}" — ${template.items.length} items added`)
      onOpenChange(false)
    } else {
      toast.error('Failed to load template')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Load Gear Template</DialogTitle>
          <DialogDescription>
            Choose a template to add items to your gear list.
          </DialogDescription>
        </DialogHeader>

        {gearItems.length > 0 && (
          <p className="text-sm text-amber-600">
            ⚠ Your trip already has {gearItems.length} gear item{gearItems.length !== 1 ? 's' : ''}.
            Template items will be added to your existing list.
          </p>
        )}

        <div className="grid gap-3 py-2">
          {templates.map((t) => (
            <div key={t.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium">{t.name}</h4>
                  {t.description && (
                    <p className="text-muted-foreground text-sm">{t.description}</p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t.items.length} items ·{' '}
                    {formatWeight(
                      t.items.reduce((s, i) => s + i.weight_oz * i.quantity, 0),
                      units,
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedId(expandedId === t.id ? null : t.id)
                    }
                  >
                    {expandedId === t.id ? 'Hide' : 'Preview'}
                  </Button>
                  <Button
                    size="sm"
                    disabled={loadingId !== null}
                    onClick={() => handleLoad(t)}
                  >
                    {loadingId === t.id ? 'Loading…' : 'Load'}
                  </Button>
                </div>
              </div>

              {expandedId === t.id && (
                <div className="mt-3 border-t pt-2">
                  <ul className="grid gap-1">
                    {t.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-muted-foreground flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.category}
                          </Badge>
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {formatWeight(item.weight_oz, units)}
                          {item.quantity > 1 && ` ×${item.quantity}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {templates.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No templates available.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
