# Samwise — History

## Project Context

- **Project:** Backpack Planner — a webapp for outdoor adventurers with interactive maps, trip planning, gear management, and route tracking
- **Stack:** React + TypeScript + Vite frontend, Supabase backend, MapLibre GL JS for maps, Zustand for state, shadcn/ui components, Tailwind CSS
- **User:** Rob

## Learnings

### Elevation Data Flow (investigated 2025-07)
- **Key files**: `src/components/map/ElevationProfile.tsx`, `src/lib/gpx/import.ts`, `src/lib/gpx/export.ts`, `src/lib/api/waypoints.ts`, `src/utils/units.ts`
- **Internal unit convention**: ElevationProfile treats route Z coordinates as meters and converts to feet internally. `formatElevation()` in `src/utils/units.ts` expects feet as input.
- **Unit mismatch bug**: GPX import stores waypoint elevation in meters (per GPX spec) but display code treats it as feet. GPX export writes the raw value back to `<ele>` without conversion.
- **Hardcoded units**: `WaypointPopup.tsx` and `WaypointList.tsx` hardcode "ft" instead of using user's preferred unit system. `TripDetailPage.tsx` hardcodes 'imperial'.
- **No elevation for map-placed waypoints**: `WaypointLayer.tsx` creates waypoints without elevation — no elevation API is called on map click.
- **Database schema**: `waypoints.elevation` is `NUMERIC(8,1)`, `days.elevation_gain`/`elevation_loss` are `NUMERIC(8,1)` — no unit documented.
- **Sea-level edge case**: `hasElevation` check in ElevationProfile excludes Z=0 coordinates, treating sea-level GPS tracks as "no elevation data".

