# Session Log — MapLibre Migration
## 2026-02-21T22:08Z

### Objective
Migrate from Mapbox GL JS (credit card requirement) to MapLibre GL JS (open-source, token-free) with OpenFreeMap tiles.

### Outcome
✅ **SUCCESS** — All components migrated, token removed, 149 tests passing, build clean.

### Changes Made

#### Package Dependencies
- Removed: `mapbox-gl`, `@types/mapbox-gl`
- Added: `maplibre-gl@5`, `maplibre-gl-draw@1.6.9`
- Reason: MapLibre is a drop-in replacement with nearly identical API and built-in TypeScript support

#### Tile Provider Swap
- **From:** Mapbox styles (`mapbox://styles/mapbox/outdoors-v12`, `satellite-streets-v12`)
- **To:** OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`, `positron`)
- **Why:** Free, no API key, outdoor-friendly cartography. Satellite removed (no free provider).

#### Environment Configuration
- Removed `VITE_MAPBOX_TOKEN` from:
  - `.env.example`
  - `.env.local`
  - `.env.local.example`
  - `README.md` (setup instructions)
  - `DEVELOPING.md` (dev guide)
- **Result:** Fresh clone + npm install now requires zero additional secrets

#### Source Code Updates
- **MapView.tsx:** Swapped mapbox-gl imports, changed style URLs, updated attribution control syntax
- **WaypointLayer.tsx:** Updated mapboxgl import to maplibregl
- **MapStyleToggle.tsx:** Removed token validity check (not needed for OpenFreeMap)
- **TripDetailPage.tsx:** Removed token validation
- **Type declarations:** `src/types/mapbox-gl-draw.d.ts` updated to declare `maplibre-gl-draw`

#### Test Results
- 149 tests passing (no test failures introduced)
- Map component tests validated with OpenFreeMap tiles
- Draw/waypoint layer tests updated imports
- All CI checks passing

### Design Decisions

1. **Library Choice: MapLibre GL JS**
   - Nearly identical API to Mapbox GL JS → minimal code changes
   - Open-source (Apache 2.0) → no licensing friction
   - Ships with TypeScript types → no need for `@types` package
   - Active community maintenance

2. **Tile Provider: OpenFreeMap**
   - Free (no API key, no credit card)
   - Good coverage (global OpenStreetMap-based tiles)
   - Multiple style options (liberty outdoor, positron clean cartography)
   - Fallback contingency: Stadia Maps free tier or MapTiler community if needed

3. **Style Toggle: Liberty ↔ Positron**
   - Liberty: outdoor-focused (trails, terrain, green spaces)
   - Positron: clean cartographic (minimal, readable)
   - Both free and widely used
   - Removed satellite option (no free provider)

### Impact Across Squad

**Pippin (Frontend):**
- Map component now zero-friction for development
- No secret management for map tiles

**Gimli (Backend):**
- No impact — this is purely frontend

**Legolas (Testing):**
- May need to update any map mock assertions
- Import statements updated; test suite passes

**Strider (DevOps/Integration):**
- No CI/CD changes needed
- No secrets to rotate
- Builds cleanly

**User (Rob):**
- No credit card friction for development setup
- Same map UX (nearly identical MapLibre API)
- Slightly different satellite option (none available free)

### Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| OpenFreeMap service interruption | Low | Stadia Maps (free tier) or MapTiler (community) as fallback |
| Minor API differences in edge cases | Low | MapLibre is purpose-built to be drop-in compatible |
| Performance regression | Very low | MapLibre v5 is performant; OpenFreeMap tiles comparable |

### Verification
- ✅ Build passes
- ✅ All 149 tests passing
- ✅ Map renders at startup
- ✅ Draw, waypoint, style toggle features work
- ✅ No VITE_MAPBOX_TOKEN in any file
- ✅ All documentation updated

### Files Modified (Summary)
- 6 source files (MapView, WaypointLayer, MapStyleToggle, TripDetailPage, type declarations)
- 4 documentation files (README, DEVELOPING, env examples)
- 1 package.json (dependencies)

### Next Steps
- Merge orchestration log and decision into team records
- Update Pippin's history.md with implementation details
- Squad aware of token-free approach (inform Legolas, Gimli of map changes)
- Monitor OpenFreeMap tiles in staging/production

---

**Owner:** Pippin (Frontend Dev)  
**Status:** Implemented ✅  
**Decision Recorded:** `.squad/decisions/inbox/pippin-maplibre-migration.md`
