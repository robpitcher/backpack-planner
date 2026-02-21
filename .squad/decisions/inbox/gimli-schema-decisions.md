# Schema Decisions — Gimli (2026-02-21)

Work Item #1: Database Schema & RLS

## Decisions Made

### 1. Users table extends auth.users via FK
The `public.users` table uses `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`. This means Supabase Auth owns the user lifecycle — deleting an auth user cascades to our profile row and all downstream data.

### 2. route_geojson stored as JSONB on trips
Per Strider's architectural gap analysis, added `route_geojson JSONB` to the trips table. Stores a full GeoJSON FeatureCollection/LineString. No PostGIS extension needed for MVP — spatial queries are not required yet.

### 3. Public trip sharing via RLS (not Edge Function)
RLS policies allow unauthenticated SELECT on trips, days, waypoints, and conditions where `is_public = true`. This means the share view can use the standard Supabase anon key — no service-role Edge Function needed for basic reads. Gear lists and recommendations are owner-only (not visible in share view).

### 4. Gear items scoped to both user_id and trip_id
Gear items have FKs to both users and trips. RLS checks `auth.uid() = user_id` directly. This supports future cross-trip gear management (e.g., "my gear closet") while keeping items trip-scoped for MVP.

### 5. Day-Waypoint relationship uses SET NULL
Days reference start/end waypoints with ON DELETE SET NULL. Waypoints can exist unassigned to any day (e.g., during initial trip planning before itinerary is organized).

## Files Created
- `supabase/migrations/20260221090001_create_enums.sql`
- `supabase/migrations/20260221090002_create_tables.sql`
- `supabase/migrations/20260221090003_create_rls_policies.sql`
