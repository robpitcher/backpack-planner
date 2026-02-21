import { supabase } from '@/lib/supabase'
import type { GearItem, GearTemplate, GearCategory } from '@/types/index'
import type { PostgrestError } from '@supabase/supabase-js'

// ── Result wrapper ───────────────────────────────────────────

export interface ApiResult<T = void> {
  data: T | null
  error: PostgrestError | null
}

// ── Input types ──────────────────────────────────────────────

export type CreateGearItemInput = {
  name: string
  category: GearCategory
  weight_oz: number
  quantity?: number
  is_worn?: boolean
  is_packed?: boolean
}

export type UpdateGearItemInput = Partial<
  Omit<GearItem, 'id' | 'trip_id' | 'user_id'>
>

// ── Fetch gear items for a trip ──────────────────────────────

export async function fetchGearItems(
  tripId: string,
): Promise<ApiResult<GearItem[]>> {
  const { data, error } = await supabase
    .from('gear_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('category')

  return { data: (data as GearItem[]) ?? null, error }
}

// ── Create gear item ─────────────────────────────────────────

export async function createGearItem(
  tripId: string,
  item: CreateGearItemInput,
): Promise<ApiResult<GearItem>> {
  const { data, error } = await supabase
    .from('gear_items')
    .insert({
      trip_id: tripId,
      name: item.name,
      category: item.category,
      weight_oz: item.weight_oz,
      quantity: item.quantity ?? 1,
      is_worn: item.is_worn ?? false,
      is_packed: item.is_packed ?? false,
    })
    .select()
    .single()

  return { data: data as GearItem | null, error }
}

// ── Update gear item ─────────────────────────────────────────

export async function updateGearItem(
  itemId: string,
  updates: UpdateGearItemInput,
): Promise<ApiResult<GearItem>> {
  const { data, error } = await supabase
    .from('gear_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  return { data: data as GearItem | null, error }
}

// ── Delete gear item ─────────────────────────────────────────

export async function deleteGearItem(
  itemId: string,
): Promise<ApiResult> {
  const { error } = await supabase
    .from('gear_items')
    .delete()
    .eq('id', itemId)

  return { data: null, error }
}

// ── Toggle packed status ─────────────────────────────────────

export async function toggleGearPacked(
  itemId: string,
  isPacked: boolean,
): Promise<ApiResult<GearItem>> {
  return updateGearItem(itemId, { is_packed: isPacked })
}

// ── Toggle worn status ───────────────────────────────────────

export async function toggleGearWorn(
  itemId: string,
  isWorn: boolean,
): Promise<ApiResult<GearItem>> {
  return updateGearItem(itemId, { is_worn: isWorn })
}

// ── Fetch gear templates ─────────────────────────────────────

export async function fetchGearTemplates(): Promise<ApiResult<GearTemplate[]>> {
  const { data, error } = await supabase
    .from('gear_templates')
    .select('*')
    .order('name')

  return { data: (data as GearTemplate[]) ?? null, error }
}

// ── Load template into trip ──────────────────────────────────

export async function loadGearTemplate(
  tripId: string,
  templateId: string,
): Promise<ApiResult<GearItem[]>> {
  // Fetch the template
  const { data: template, error: templateError } = await supabase
    .from('gear_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (templateError || !template) {
    return { data: null, error: templateError }
  }

  const templateData = template as GearTemplate
  const rows = templateData.items.map((item) => ({
    trip_id: tripId,
    name: item.name,
    category: item.category,
    weight_oz: item.weight_oz,
    quantity: item.quantity,
    is_worn: false,
    is_packed: false,
  }))

  const { data, error } = await supabase
    .from('gear_items')
    .insert(rows)
    .select()

  return { data: (data as GearItem[]) ?? null, error }
}
