import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { gramsToOunces, ouncesToGrams } from '@/utils/units'
import type { GearItem, GearCategory } from '@/types'

const GEAR_CATEGORIES: { value: GearCategory; label: string }[] = [
  { value: 'shelter', label: 'Shelter' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'cook', label: 'Cook' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'safety', label: 'Safety' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'hygiene', label: 'Hygiene' },
  { value: 'other', label: 'Other' },
]

interface GearFormProps {
  tripId: string
  editItem?: GearItem | null
  onClose: () => void
}

export default function GearForm({ tripId, editItem, onClose }: GearFormProps) {
  const addGear = useTripStore((s) => s.addGear)
  const updateGear = useTripStore((s) => s.updateGear)
  const units = useAuthStore((s) => s.preferredUnits)

  const isMetric = units === 'metric'
  const weightLabel = isMetric ? 'Weight (g)' : 'Weight (oz)'

  const [name, setName] = useState('')
  const [category, setCategory] = useState<GearCategory>('other')
  const [weight, setWeight] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [isWorn, setIsWorn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editItem) {
      setName(editItem.name)
      setCategory(editItem.category)
      const displayWeight = isMetric
        ? ouncesToGrams(editItem.weight_oz)
        : editItem.weight_oz
      setWeight(String(parseFloat(displayWeight.toFixed(1))))
      setQuantity(String(editItem.quantity))
      setIsWorn(editItem.is_worn)
    }
  }, [editItem, isMetric])

  function validate(): string | null {
    if (!name.trim()) return 'Name is required'
    if (name.trim().length > 50) return 'Name must be 50 characters or less'
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) return 'Weight must be a positive number'
    const q = parseInt(quantity, 10)
    if (isNaN(q) || q < 1) return 'Quantity must be at least 1'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) {
      toast.error(err)
      return
    }

    const weightNum = parseFloat(weight)
    const weightOz = isMetric ? gramsToOunces(weightNum) : weightNum

    setIsSubmitting(true)

    if (editItem) {
      const result = await updateGear(editItem.id, {
        name: name.trim(),
        category,
        weight_oz: weightOz,
        quantity: parseInt(quantity, 10),
        is_worn: isWorn,
      })
      setIsSubmitting(false)
      if (result) {
        toast.success('Gear item updated')
        onClose()
      } else {
        toast.error('Failed to update gear item')
      }
    } else {
      const result = await addGear(tripId, {
        name: name.trim(),
        category,
        weight_oz: weightOz,
        quantity: parseInt(quantity, 10),
        is_worn: isWorn,
      })
      setIsSubmitting(false)
      if (result) {
        toast.success('Gear item added')
        onClose()
      } else {
        toast.error('Failed to add gear item')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="gear-name">Name *</Label>
        <Input
          id="gear-name"
          placeholder="e.g. Tent, Sleeping Bag"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="gear-category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as GearCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GEAR_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gear-weight">{weightLabel}</Label>
          <Input
            id="gear-weight"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="gear-qty">Quantity</Label>
          <Input
            id="gear-qty"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="flex items-end gap-2 pb-1">
          <Checkbox
            id="gear-worn"
            checked={isWorn}
            onCheckedChange={(checked) => setIsWorn(checked === true)}
          />
          <Label htmlFor="gear-worn" className="cursor-pointer">
            Worn weight
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : editItem ? 'Update' : 'Add Item'}
        </Button>
      </div>
    </form>
  )
}
