# Strider — History

## Project Context

- **Project:** Backpack Planner — outdoor adventure webapp
- **Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui, MapLibre GL JS, Supabase, Zustand
- **User:** Rob

## Learnings

- Decomposed Phase 2 into 22 work items across 4 parallel streams (Map, Itinerary, Gear, Conditions/Export)
- Critical path: map infrastructure (items 1-4) blocks downstream features
- PRD at specs/mvp.md (TrailForge v1.1)

### Auto-Route Research (Issue #8)
- **Best option:** OpenRouteService (ORS) with `foot-hiking` profile
  - Free tier: 2,000 req/day (40/min) with no credit card
  - Native GeoJSON + elevation output (3D LineString)
  - Up to 50 waypoints per route
  - Self-hosting available (Docker) for scale
- **Architecture:** Client-side API calls sufficient for MVP; Edge Function only if rate limits exceeded
- **UX pattern:** "Suggest Route" button (not auto-generate) preserves manual drawing as primary workflow
- **Key risk:** OSM trail data sparse in wilderness areas — needs "Beta" label + user feedback mechanism
- **Alternatives considered:** BRouter (requires self-hosting), GraphHopper (less hiking-focused), Mapbox/Google (expensive, no hiking profiles)
- **Estimate:** Medium (2-3 days) — good Phase 3 polish feature
- Trail routing quality depends on OpenStreetMap data coverage (excellent in popular areas, variable in remote wilderness)
