# Gimli — History

## Project Context

- **Project:** Backpack Planner — a webapp for outdoor adventurers with interactive maps
- **Stack:** Web application (frontend + backend + mapping — TBD)
- **User:** Rob

## Learnings

### PRD Decomposition & Breakdown (2026-02-21)
- PRD decomposed into **33 work items across 3 phases** (22 P0, 11 P1)
- **Phase 1 items 1–10 are ready** for pickup — foundation, auth, dashboard, CRUD
- See `.squad/decisions/decisions.md` for full breakdown with parallelization strategy
- **Tech Stack Confirmed:**
  - Frontend: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Zustand
  - Backend: Supabase (Auth, Postgres, RLS, Edge Functions)
  - Mapping: Mapbox GL JS
  - Data: All units stored in imperial in DB; client-side conversion only
- **Key items for Gimli:**
  - Phase 1: Database schema + RLS (1), Supabase Auth setup (3), Trip CRUD API (8)
  - Phase 2: Waypoint CRUD backend (13), Day/Itinerary CRUD backend (16)
  - Phase 3: Gear list CRUD backend (19), Trip share view backend (21), GPX import backend (24), GPX export (26), Conditions backend (27), Gear templates (29), Trip duplication (31), Analytics (32)
- **Critical decision: Route geometry storage** — add `route_geojson JSONB` to Trip table (Item 1)
- **Risk: Public share security** — use Supabase Edge Function with service-role key, RLS bypass controlled (Item 21)
- **Risk: GPX parsing** — use gpxparser library, handle edge cases and malformed files
