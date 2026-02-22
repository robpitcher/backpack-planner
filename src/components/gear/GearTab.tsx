import { useEffect, useState, useMemo } from 'react'
import { Plus, Package, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { formatWeight } from '@/utils/units'
import type { GearItem, GearCategory } from '@/types'
import GearForm from './GearForm'
import GearTemplateModal from './GearTemplateModal'
import PackChecklist from './PackChecklist'

type SortMode = 'category' | 'name'
type ViewMode = 'all' | 'checklist'

interface GearTabProps {
  tripId: string
}

// Group items by category
function groupByCategory(items: GearItem[]): Map<GearCategory, GearItem[]> {
  const map = new Map<GearCategory, GearItem[]>()
  for (const item of items) {
    const group = map.get(item.category) ?? []
    group.push(item)
    map.set(item.category, group)
  }
  return map
}

const CATEGORY_LABELS: Record<GearCategory, string> = {
  shelter: 'Shelter',
  sleep: 'Sleep',
  cook: 'Cook',
  clothing: 'Clothing',
  safety: 'Safety',
  navigation: 'Navigation',
  hygiene: 'Hygiene',
  other: 'Other',
}

export default function GearTab({ tripId }: GearTabProps) {
  const gearItems = useTripStore((s) => s.gearItems)
  const fetchGear = useTripStore((s) => s.fetchGear)
  const deleteGear = useTripStore((s) => s.deleteGear)
  const togglePacked = useTripStore((s) => s.togglePacked)
  const units = useAuthStore((s) => s.preferredUnits)

  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [sortMode, setSortMode] = useState<SortMode>('category')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<GearItem | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)

  useEffect(() => {
    fetchGear(tripId)
  }, [tripId, fetchGear])

  // Weight totals
  const weights = useMemo(() => {
    let worn = 0
    let base = 0
    for (const item of gearItems) {
      const w = item.weight_oz * item.quantity
      if (item.is_worn) worn += w
      else base += w
    }
    return { base, worn, total: base + worn }
  }, [gearItems])

  // Sorted items
  const sortedItems = useMemo(() => {
    const items = [...gearItems]
    if (sortMode === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    }
    return items
  }, [gearItems, sortMode])

  const grouped = useMemo(() => groupByCategory(sortedItems), [sortedItems])

  function handleEdit(item: GearItem) {
    setEditItem(item)
    setFormOpen(true)
  }

  async function handleDelete(item: GearItem) {
    const ok = await deleteGear(item.id)
    if (ok) toast.success(`Deleted "${item.name}"`)
    else toast.error('Failed to delete gear item')
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditItem(null)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 pt-8">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gear</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTemplateOpen(true)}
          >
            <Package className="mr-1 h-4 w-4" />
            Templates
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditItem(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Weight Summary */}
      <div className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-center text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Base</div>
          <div className="font-medium tabular-nums">
            {formatWeight(weights.base, units)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Worn</div>
          <div className="font-medium tabular-nums">
            {formatWeight(weights.worn, units)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Total</div>
          <div className="font-medium tabular-nums">
            {formatWeight(weights.total, units)}
          </div>
        </div>
      </div>

      {/* View / Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
        <div className="flex flex-wrap gap-1">
          <Button
            variant={viewMode === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => setViewMode('all')}
          >
            All Items
          </Button>
          <Button
            variant={viewMode === 'checklist' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => setViewMode('checklist')}
          >
            Checklist
          </Button>
        </div>
        {viewMode === 'all' && (
          <div className="flex flex-wrap gap-1">
            <Button
              variant={sortMode === 'category' ? 'secondary' : 'ghost'}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => setSortMode('category')}
            >
              By Category
            </Button>
            <Button
              variant={sortMode === 'name' ? 'secondary' : 'ghost'}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => setSortMode('name')}
            >
              By Name
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'checklist' ? (
          <PackChecklist items={gearItems} />
        ) : sortMode === 'category' ? (
          // Grouped by category view
          <div className="grid gap-4">
            {Array.from(grouped.entries()).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">
                  {CATEGORY_LABELS[cat]} ({items.length})
                </h3>
                <ul className="grid gap-1">
                  {items.map((item) => (
                    <GearItemRow
                      key={item.id}
                      item={item}
                      units={units}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePacked={togglePacked}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          // Flat list sorted by name
          <ul className="grid gap-1">
            {sortedItems.map((item) => (
              <GearItemRow
                key={item.id}
                item={item}
                units={units}
                showCategory
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePacked={togglePacked}
              />
            ))}
          </ul>
        )}

        {gearItems.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No gear items yet. Add items or load a template to get started.
          </p>
        )}
      </div>

      {/* Gear Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(v) => { if (!v) handleFormClose() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Gear Item' : 'Add Gear Item'}</DialogTitle>
          </DialogHeader>
          <GearForm tripId={tripId} editItem={editItem} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      {/* Template Modal */}
      <GearTemplateModal
        tripId={tripId}
        open={templateOpen}
        onOpenChange={setTemplateOpen}
      />
    </div>
  )
}

// ── Gear Item Row ──────────────────────────────────────────

interface GearItemRowProps {
  item: GearItem
  units: 'imperial' | 'metric'
  showCategory?: boolean
  onEdit: (item: GearItem) => void
  onDelete: (item: GearItem) => void
  onTogglePacked: (id: string, packed: boolean) => Promise<boolean>
}

function GearItemRow({
  item,
  units,
  showCategory,
  onEdit,
  onDelete,
  onTogglePacked,
}: GearItemRowProps) {
  return (
    <li className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
      <Checkbox
        checked={item.is_packed}
        onCheckedChange={(checked) => onTogglePacked(item.id, checked === true)}
        aria-label={`Pack ${item.name}`}
      />

      <span
        className={`flex-1 text-sm ${item.is_packed ? 'text-muted-foreground line-through' : ''}`}
      >
        {item.name}
      </span>

      {item.is_worn && (
        <Badge variant="secondary" className="text-[10px]">
          worn
        </Badge>
      )}
      {showCategory && (
        <Badge variant="outline" className="text-[10px]">
          {item.category}
        </Badge>
      )}

      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
        {formatWeight(item.weight_oz * item.quantity, units)}
        {item.quantity > 1 && ` ×${item.quantity}`}
      </span>

      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive"
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  )
}
