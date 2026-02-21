# Decision: Trip Share View + GPX Import/Export — Gimli

## Context
Items 8, 14, 15 from Phase 2 plan.

## Decisions

### 1. Share view uses anon key + existing RLS (no Edge Function)
The public share view at `/trip/:tripId` uses the standard Supabase anon client. Phase 1 RLS policies already allow anonymous SELECT on trips/days/waypoints where `is_public = true`. No service-role Edge Function was needed.

### 2. Gear summary shows aggregates only in share view
Per decisions.md: gear is owner-only. The share view shows item count, base weight, and total weight — but NOT individual gear items. If RLS blocks anon reads on `gear_items`, the summary gracefully shows zero.

### 3. GPX parsing via @tmcw/togeojson
Used `@tmcw/togeojson` instead of `gpx-parser-builder` — it produces GeoJSON directly which aligns with our `route_geojson JSONB` storage format. No intermediate conversion needed.

### 4. ReadOnlyMap is a separate component (not MapView with flags)
The share view uses a lightweight `ReadOnlyMap` component that renders route as a GeoJSON source/layer without MapboxDraw. This avoids adding complexity to the existing MapView with readonly flags.

### 5. GPX import persists to DB immediately
When importing a GPX file, both the route and waypoints are persisted to Supabase immediately (not just in-memory). This ensures data isn't lost if the user navigates away.
