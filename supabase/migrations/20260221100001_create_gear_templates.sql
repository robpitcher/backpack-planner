-- Phase 2: Gear Templates table
-- Shared resource — readable by all authenticated users, writable by admins (future).
-- For MVP, any authenticated user can read. Seed data provides starter templates.

-- ============================================================
-- Gear Templates
-- ============================================================
CREATE TABLE public.gear_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  items       JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS: Authenticated users can read; no public (anon) access
-- ============================================================
ALTER TABLE public.gear_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view gear templates"
  ON public.gear_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Seed starter templates
-- ============================================================
INSERT INTO public.gear_templates (name, description, items) VALUES
(
  '3-Season Ultralight',
  'Common ultralight gear for spring, summer, and fall backpacking. Focused on minimizing base weight while maintaining comfort and safety.',
  '[
    {"name": "Ultralight Tent (1P)", "category": "shelter", "weight_oz": 28, "quantity": 1},
    {"name": "Groundsheet / Footprint", "category": "shelter", "weight_oz": 4, "quantity": 1},
    {"name": "20°F Down Quilt", "category": "sleep", "weight_oz": 22, "quantity": 1},
    {"name": "Foam Sleeping Pad (Torso)", "category": "sleep", "weight_oz": 6, "quantity": 1},
    {"name": "Inflatable Pillow", "category": "sleep", "weight_oz": 3, "quantity": 1},
    {"name": "Alcohol Stove + Pot (550ml)", "category": "cook", "weight_oz": 8, "quantity": 1},
    {"name": "Spork", "category": "cook", "weight_oz": 0.5, "quantity": 1},
    {"name": "Water Filter (Squeeze)", "category": "cook", "weight_oz": 3, "quantity": 1},
    {"name": "Rain Jacket", "category": "clothing", "weight_oz": 7, "quantity": 1},
    {"name": "Base Layer Top", "category": "clothing", "weight_oz": 5, "quantity": 1},
    {"name": "Insulated Puffy Jacket", "category": "clothing", "weight_oz": 12, "quantity": 1},
    {"name": "Hiking Shorts", "category": "clothing", "weight_oz": 5, "quantity": 1},
    {"name": "First Aid Kit (Mini)", "category": "safety", "weight_oz": 4, "quantity": 1},
    {"name": "Headlamp", "category": "safety", "weight_oz": 2.5, "quantity": 1},
    {"name": "Whistle + Signal Mirror", "category": "safety", "weight_oz": 1, "quantity": 1},
    {"name": "Phone + Battery Bank", "category": "navigation", "weight_oz": 10, "quantity": 1},
    {"name": "Map (Paper)", "category": "navigation", "weight_oz": 1.5, "quantity": 1},
    {"name": "Trowel", "category": "hygiene", "weight_oz": 1, "quantity": 1},
    {"name": "Toothbrush (Cut Handle)", "category": "hygiene", "weight_oz": 0.3, "quantity": 1},
    {"name": "Sunscreen (Mini)", "category": "hygiene", "weight_oz": 1.5, "quantity": 1}
  ]'::jsonb
),
(
  'Winter 4-Season',
  'Cold weather gear for winter backpacking and snowshoeing. Heavier but essential for sub-freezing temperatures and snow conditions.',
  '[
    {"name": "4-Season Tent (2P)", "category": "shelter", "weight_oz": 72, "quantity": 1},
    {"name": "Snow Stakes", "category": "shelter", "weight_oz": 6, "quantity": 4},
    {"name": "0°F Down Sleeping Bag", "category": "sleep", "weight_oz": 42, "quantity": 1},
    {"name": "Insulated Sleeping Pad (R5+)", "category": "sleep", "weight_oz": 20, "quantity": 1},
    {"name": "Closed-Cell Foam Pad (Sit)", "category": "sleep", "weight_oz": 2, "quantity": 1},
    {"name": "Canister Stove + Insulated Pot", "category": "cook", "weight_oz": 16, "quantity": 1},
    {"name": "Insulated Water Bottles (Wide Mouth)", "category": "cook", "weight_oz": 12, "quantity": 2},
    {"name": "Hardshell Jacket (Gore-Tex)", "category": "clothing", "weight_oz": 18, "quantity": 1},
    {"name": "Hardshell Pants", "category": "clothing", "weight_oz": 14, "quantity": 1},
    {"name": "Insulated Puffy Jacket (Belay)", "category": "clothing", "weight_oz": 24, "quantity": 1},
    {"name": "Base Layer Set (Merino)", "category": "clothing", "weight_oz": 14, "quantity": 1},
    {"name": "Insulated Gloves + Liner Gloves", "category": "clothing", "weight_oz": 8, "quantity": 1},
    {"name": "Balaclava", "category": "clothing", "weight_oz": 3, "quantity": 1},
    {"name": "Gaiters", "category": "clothing", "weight_oz": 8, "quantity": 1},
    {"name": "Microspikes / Crampons", "category": "safety", "weight_oz": 22, "quantity": 1},
    {"name": "Ice Axe", "category": "safety", "weight_oz": 16, "quantity": 1},
    {"name": "Avalanche Beacon", "category": "safety", "weight_oz": 7, "quantity": 1},
    {"name": "Probe + Shovel", "category": "safety", "weight_oz": 24, "quantity": 1},
    {"name": "First Aid Kit", "category": "safety", "weight_oz": 8, "quantity": 1},
    {"name": "Headlamp (Lithium Batteries)", "category": "safety", "weight_oz": 4, "quantity": 1},
    {"name": "GPS Device", "category": "navigation", "weight_oz": 8, "quantity": 1},
    {"name": "Compass", "category": "navigation", "weight_oz": 2, "quantity": 1},
    {"name": "Hand/Toe Warmers", "category": "other", "weight_oz": 3, "quantity": 4}
  ]'::jsonb
),
(
  'Desert / Arid',
  'Desert-specific gear emphasizing hydration, sun protection, and heat management. Extra water capacity and UV protection are critical.',
  '[
    {"name": "Tarp Shelter / Ultralight Tent", "category": "shelter", "weight_oz": 24, "quantity": 1},
    {"name": "Bug Net (Head)", "category": "shelter", "weight_oz": 1.5, "quantity": 1},
    {"name": "40°F Sleeping Bag / Quilt", "category": "sleep", "weight_oz": 16, "quantity": 1},
    {"name": "Sleeping Pad", "category": "sleep", "weight_oz": 14, "quantity": 1},
    {"name": "Stove + Pot", "category": "cook", "weight_oz": 12, "quantity": 1},
    {"name": "Water Bladder (3L)", "category": "cook", "weight_oz": 6, "quantity": 1},
    {"name": "Water Bottles (1L)", "category": "cook", "weight_oz": 4, "quantity": 3},
    {"name": "Electrolyte Packets", "category": "cook", "weight_oz": 2, "quantity": 10},
    {"name": "Water Filter + Purification Tablets", "category": "cook", "weight_oz": 5, "quantity": 1},
    {"name": "Sun Hoodie (UPF 50+)", "category": "clothing", "weight_oz": 7, "quantity": 1},
    {"name": "Sun Hat (Wide Brim)", "category": "clothing", "weight_oz": 4, "quantity": 1},
    {"name": "Lightweight Pants (Ventilated)", "category": "clothing", "weight_oz": 8, "quantity": 1},
    {"name": "Buff / Neck Gaiter", "category": "clothing", "weight_oz": 1.5, "quantity": 1},
    {"name": "Sunglasses (UV400)", "category": "clothing", "weight_oz": 1, "quantity": 1},
    {"name": "Lightweight Wind Jacket", "category": "clothing", "weight_oz": 4, "quantity": 1},
    {"name": "First Aid Kit + Snake Bite Kit", "category": "safety", "weight_oz": 6, "quantity": 1},
    {"name": "Headlamp", "category": "safety", "weight_oz": 2.5, "quantity": 1},
    {"name": "Signal Mirror + Whistle", "category": "safety", "weight_oz": 1, "quantity": 1},
    {"name": "Phone + Solar Charger", "category": "navigation", "weight_oz": 14, "quantity": 1},
    {"name": "Map + Compass", "category": "navigation", "weight_oz": 3, "quantity": 1},
    {"name": "Sunscreen (SPF 50+)", "category": "hygiene", "weight_oz": 4, "quantity": 1},
    {"name": "Lip Balm (SPF)", "category": "hygiene", "weight_oz": 0.5, "quantity": 1},
    {"name": "Trowel", "category": "hygiene", "weight_oz": 1, "quantity": 1}
  ]'::jsonb
),
(
  'Budget Starter',
  'Basic affordable gear for beginning backpackers. Prioritizes reliability and value over weight savings. Great for your first few trips.',
  '[
    {"name": "Budget 2P Tent", "category": "shelter", "weight_oz": 64, "quantity": 1},
    {"name": "30°F Synthetic Sleeping Bag", "category": "sleep", "weight_oz": 48, "quantity": 1},
    {"name": "Foam Sleeping Pad (Full Length)", "category": "sleep", "weight_oz": 14, "quantity": 1},
    {"name": "Canister Stove + Pot Set", "category": "cook", "weight_oz": 18, "quantity": 1},
    {"name": "Spork + Bowl", "category": "cook", "weight_oz": 3, "quantity": 1},
    {"name": "Water Bottles (1L)", "category": "cook", "weight_oz": 4, "quantity": 2},
    {"name": "Water Filter (Pump)", "category": "cook", "weight_oz": 11, "quantity": 1},
    {"name": "Rain Jacket (Budget)", "category": "clothing", "weight_oz": 14, "quantity": 1},
    {"name": "Fleece Midlayer", "category": "clothing", "weight_oz": 12, "quantity": 1},
    {"name": "Synthetic Base Layer", "category": "clothing", "weight_oz": 8, "quantity": 1},
    {"name": "Hiking Pants (Zip-Off)", "category": "clothing", "weight_oz": 12, "quantity": 1},
    {"name": "Wool Hiking Socks", "category": "clothing", "weight_oz": 3, "quantity": 2},
    {"name": "Baseball Cap / Sun Hat", "category": "clothing", "weight_oz": 3, "quantity": 1},
    {"name": "First Aid Kit", "category": "safety", "weight_oz": 8, "quantity": 1},
    {"name": "Headlamp", "category": "safety", "weight_oz": 4, "quantity": 1},
    {"name": "Whistle", "category": "safety", "weight_oz": 0.5, "quantity": 1},
    {"name": "Emergency Blanket", "category": "safety", "weight_oz": 2, "quantity": 1},
    {"name": "Phone + Battery Bank", "category": "navigation", "weight_oz": 12, "quantity": 1},
    {"name": "Printed Trail Map", "category": "navigation", "weight_oz": 1.5, "quantity": 1},
    {"name": "Trowel", "category": "hygiene", "weight_oz": 2, "quantity": 1},
    {"name": "Toiletry Kit (Mini)", "category": "hygiene", "weight_oz": 4, "quantity": 1},
    {"name": "Trash Bags (Pack Out)", "category": "other", "weight_oz": 1, "quantity": 3}
  ]'::jsonb
);
