# Legolas — History

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
- **Legolas testing responsibilities:**
  - **Phase 1:** Unit conversion tests (Item 6) — property-based tests for round-trip conversions (mi↔km, ft↔m, oz↔g, °F↔°C); Auth flow tests
  - **Phase 2:** Integration tests for map, route, waypoint, day management
  - **Phase 3:** GPX edge-case tests with malformed files, elevation profile validation, full E2E tests; QA polish heavy involvement (Item 33)
- **Risk: Unit conversion correctness** — centralized utility must have thorough unit tests (Item 6 support)
- **Risk: GPX edge cases** — write edge-case tests with malformed GPX files for Item 24
