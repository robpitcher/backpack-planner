# Strider — History

## Project Context

- **Project:** Backpack Planner — a webapp for outdoor adventurers with interactive maps
- **Stack:** Web application (frontend + backend + mapping — TBD)
- **User:** Rob

## Learnings

### PRD Decomposition (TrailForge MVP v1.1)
- **Stack confirmed:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Zustand + Mapbox GL JS + Supabase (Auth, Postgres+RLS, Storage, Edge Functions)
- **Data model gap found:** PRD data model has no field for route polyline geometry. Decision: add `route_geojson JSONB` to Trip table.
- **Unit system:** All values stored in imperial in DB. Conversion is client-side only via `src/utils/units.ts`. No backend conversion.
- **Share view security:** Public share uses Supabase Edge Function with service-role key, bypasses RLS, filters to `is_public = true` only.
- **API contract-first:** Shared TypeScript types/interfaces should be defined before Pippin and Gimli build independently.
- **Key file paths:** PRD at `specs/mvp.md`, decisions at `.squad/decisions/`, work breakdown at `.squad/decisions/inbox/strider-prd-decomposition.md`
- **Route structure:** `/login`, `/dashboard`, `/trip/:tripId/plan` (planner), `/trip/:tripId` (share view)
- **Decomposition:** 33 work items (22 P0, 11 P1) across 3 months. Month 2 (map + itinerary) is the critical path.
- **Rob prefers:** Actionable specificity — work items should be pick-up-and-go, not vague.
- **Risks flagged:** Route geometry storage (resolved), Mapbox key management, GPX edge cases, elevation data source, drag-and-drop library choice.

### Phase 1 Kickoff (2026-02-21)
- **Item #1 (Schema):** Completed by Gimli. 7 tables in supabase/migrations/ with cascading FKs, indexes, RLS policies. route_geojson JSONB on Trip; public sharing via is_public flag.
- **Item #2 (Scaffold):** Completed by Pippin. Vite + React 19 + TypeScript strict + Tailwind v4 + shadcn/ui + Zustand + React Router (5 routes) + Supabase client. Boots on localhost:5173.
- **React 19 + Tailwind v4 chosen** as tech stack (finalized in decisions.md).
- **Items #3, #6, #7 now unblocked** for next wave.
