# Pippin — History

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
  - State: All units stored in imperial in DB; client-side conversion only
- **Key items for Pippin:**
  - Phase 1: Project scaffold (2), Auth UI (4), User profile (5), Unit conversion utility (6), Shared types (7), Dashboard UI (9), Trip CRUD UI (10)
  - Phase 2: Mapbox integration (11), Route drawing (12), Waypoint placement (14), Waypoint detail panel (15), Itinerary panel (17), Responsive layout (18)
  - Phase 3: Gear list UI (20), Trip share view frontend (22), Elevation profile (23), GPX import UI (25), Conditions UI (28), Gear templates UI (30), QA polish (33)
- **Risk: Mapbox key** must be env var only (VITE_MAPBOX_TOKEN); **Risk: Drag-and-drop library** choice (@dnd-kit/core vs react-beautiful-dnd) needed before Item 17
