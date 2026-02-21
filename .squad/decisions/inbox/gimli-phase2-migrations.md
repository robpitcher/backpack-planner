# Gimli — Phase 2 Migrations Decision

**Date:** 2026-02-21
**Item:** #19 — Phase 2 Database Migrations & RLS

## Decisions

### 1. gear_templates table is a shared read-only resource
- All authenticated users can SELECT from gear_templates (RLS policy uses `auth.role() = 'authenticated'`).
- No INSERT/UPDATE/DELETE policies for regular users — templates are seeded via migration.
- Future: admin role can manage templates if needed.

### 2. Phase 1 schema already covered most Phase 2 needs
- Reviewed all existing migrations. The Phase 1 schema (tables, columns, RLS) already includes everything needed for trips, days, waypoints, gear_items, and conditions.
- Only `gear_templates` was missing. No ALTER TABLE migrations were needed.

### 3. conditions.source kept as ENUM
- Task spec listed `source TEXT`, but Phase 1 created it as `condition_source` ENUM (`NWS`, `USGS`, `recreation_gov`).
- Kept the ENUM — it provides stronger validation. If new sources are needed, we add enum values via `ALTER TYPE`.

### 4. Gear template items structure
- `items` JSONB column stores an array of objects: `{name, category, weight_oz, quantity}`.
- `category` values match the `gear_category` enum for consistency when importing into `gear_items`.
- Templates do NOT include `is_worn` or `is_packed` — those are user-specific choices set at import time.

## Impact
- Pippin: New `GearTemplate` and `GearTemplateItem` TypeScript types added to `src/types/index.ts`. No store changes made.
- Frontend: Can query `gear_templates` to populate a template picker UI.
