import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { formatWeight } from '@/utils/units'
import type { GearItem } from '@/types'

interface PackChecklistProps {
  items: GearItem[]
}

export default function PackChecklist({ items }: PackChecklistProps) {
  const togglePacked = useTripStore((s) => s.togglePacked)
  const units = useAuthStore((s) => s.preferredUnits)

  const packedCount = items.filter((i) => i.is_packed).length
  const totalCount = items.length

  // Show unpacked first, then packed
  const sorted = [...items].sort((a, b) => {
    if (a.is_packed !== b.is_packed) return a.is_packed ? 1 : -1
    return a.category.localeCompare(b.category)
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {packedCount} of {totalCount} items packed
        </span>
        {totalCount > 0 && (
          <span className="text-muted-foreground">
            {Math.round((packedCount / totalCount) * 100)}%
          </span>
        )}
      </div>
      {totalCount > 0 && (
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${(packedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Items */}
      <ul className="grid gap-1">
        {sorted.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${
              item.is_packed ? 'text-muted-foreground opacity-60' : ''
            }`}
          >
            <Checkbox
              checked={item.is_packed}
              onCheckedChange={(checked) =>
                togglePacked(item.id, checked === true)
              }
            />
            <span
              className={`flex-1 text-sm ${item.is_packed ? 'line-through' : ''}`}
            >
              {item.name}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {item.category}
            </Badge>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {formatWeight(item.weight_oz * item.quantity, units)}
            </span>
          </li>
        ))}
      </ul>

      {totalCount === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No gear items yet. Add some items first.
        </p>
      )}
    </div>
  )
}
