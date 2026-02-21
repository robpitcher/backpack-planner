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

### Phase 1 Batch 2 Complete (2026-02-21)
- **Item #3 (Auth):** Completed by Gimli. Email + Google OAuth; src/lib/auth.ts (6 functions + getUserProfile); AuthResult<T> wrapper.
- **Item #6 (Unit Conversion):** Completed by Pippin. src/utils/units.ts (8 functions, 4 formatters); 39 Vitest tests passing.
- **Item #7 (Shared Types):** Completed by Pippin. src/types/index.ts (6 interfaces, 5 enums); ISO 8601 timestamps, JSONB as Record<string, unknown>.
- **5 of 10 Phase 1 items done (50%).** Items #3, #6, #7 done. Auth at src/lib/auth.ts, types at src/types/index.ts, units at src/utils/units.ts.
- **Items #4, #5, #8 now unblocked** for next wave: Auth UI, User profile, Trip CRUD API.

## 🎉 Phase 1 Complete (10/10 Items)

**Date:** 2026-02-21  
**Status:** ✅ ALL FOUNDATION ITEMS DONE

**Summary:** Phase 1 foundation complete — all 10 items delivered. Built: Supabase schema + RLS, email+Google auth, dashboard with trip cards, Trip CRUD (create/rename/delete/archive), unit system, shared types. All CI checks passing. Ready for Phase 2: map integration, route drawing, waypoints, itinerary panel. Squad synchronized.
