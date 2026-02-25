# Auto Route Creation Feasibility Research

**Date:** 2026-02-22  
**Author:** Strider  
**Issue:** #8  
**Status:** Research Complete — Ready for Team Discussion

---

## Executive Summary

Auto-routing between waypoints is **technically feasible** with multiple free/open-source options available. **Recommendation: OpenRouteService (ORS) with foot-hiking profile** for MVP, with optional self-hosted fallback for production scale.

**Key findings:**
- ORS provides free hiking-specific routing (2,000 req/day) with GeoJSON output + elevation
- Client-side API calls sufficient for MVP; no backend changes required
- Best UX: "Suggest Route" button that generates editable route vs replacing manual draw
- Trail accuracy depends on OpenStreetMap data quality (good in popular areas, sparse in wilderness)

---

## 1. Routing Service Evaluation

### OpenRouteService (ORS) ⭐ RECOMMENDED
**Profile:** `foot-hiking`  
**Cost:** FREE (2,000 req/day, 40/min) — No credit card required  
**Elevation:** YES — Built-in, returns 3D GeoJSON with Z coordinates  
**Multi-waypoint:** YES — Up to 50 waypoints per route  
**Output:** GeoJSON LineString (direct compatibility)  
**Self-hosting:** YES — Docker container available  
**Trail quality:** EXCELLENT — Dedicated hiking profile respects OSM hiking tags (surface, difficulty, waymarks)

**Pros:**
- Zero cost for typical user (<100 plans/month)
- Native hiking support (not just "foot" routing on roads)
- Elevation included (no separate API needed)
- Easy self-hosting if we exceed limits
- HeiGIT (Heidelberg University) backing — stable, well-documented

**Cons:**
- Public API rate limit (mitigated by self-hosting option)
- Depends on OSM trail data quality (sparse in remote wilderness)

**Example API call:**
```javascript
GET https://api.openrouteservice.org/v2/directions/foot-hiking/geojson
Body: {
  "coordinates": [[lng1,lat1], [lng2,lat2], [lng3,lat3]],
  "elevation": true,
  "instructions": false
}
```

---

### BRouter
**Profile:** Custom hiking profiles available  
**Cost:** FREE (self-hosted only)  
**Elevation:** YES (SRTM data included)  
**Multi-waypoint:** YES  
**Output:** GeoJSON via config  
**Self-hosting:** REQUIRED — Java server + OSM data files  

**Pros:**
- Deep customization (script-based routing profiles)
- Beloved by hiking community for long-distance trail accuracy
- No API limits (self-hosted)

**Cons:**
- NO public API — must self-host from day one
- Complex setup (Java + OSM data + SRTM data download)
- Higher ops burden (data updates, server maintenance)

**Verdict:** Best for V2 or if we need trail-specific customization. Too heavy for MVP.

---

### GraphHopper
**Profile:** `foot` (custom hiking profiles possible)  
**Cost:** FREE tier available (details unclear) OR self-hosted  
**Elevation:** Partial (requires configuration)  
**Multi-waypoint:** YES  
**Output:** GeoJSON  

**Pros:**
- Fast routing (contraction hierarchies)
- Active development

**Cons:**
- Hiking profile not as specialized as ORS
- Free tier limits unclear (docs less transparent than ORS)

---

### Valhalla
**Profile:** `pedestrian` with hiking options  
**Cost:** FREE (self-hosted only — no public API)  
**Elevation:** YES  
**Multi-waypoint:** YES  
**Output:** GeoJSON  

**Pros:**
- Excellent for isochrones (future feature: "How far can I hike in 4 hours?")
- Rich routing features

**Cons:**
- NO public API (Mapbox formerly hosted, now self-host only)
- Requires self-hosting from start

---

### OSRM (Open Source Routing Machine)
**Profile:** `foot` (road-focused)  
**Cost:** FREE (public demo servers exist, but self-host recommended)  
**Elevation:** NO  
**Multi-waypoint:** YES  

**Verdict:** Not recommended — lacks hiking trail support and elevation data.

---

### Commercial Options (for reference)

**Mapbox Directions API:**
- Walking profile (no dedicated hiking)
- 100,000 req/month free, then $0.50/1,000
- No elevation in routing response (need separate Tilequery API)
- Verdict: More expensive than ORS, less hiking-focused

**Google Directions API:**
- Walking only (no hiking profile)
- $5/1,000 req (expensive at scale)
- Verdict: Not cost-effective for this use case

---

## 2. Architecture Recommendations

### MVP Approach (Client-Side API)
```
User clicks "Suggest Route" 
  → React component reads waypoints from store
  → Calls ORS API directly (with API key in env var)
  → Receives GeoJSON LineString
  → Loads into MapLibre Draw as editable route
  → User can accept/modify/discard
```

**Why client-side:**
- No backend changes needed
- Instant feedback
- ORS CORS-enabled for browser requests

**API Key Security:**
- ORS allows domain restrictions (only backpack-planner.com can use key)
- Rate limit per key (2k/day) sufficient for MVP
- Move to self-hosted Edge Function if abuse becomes issue

---

### Production Scale (Supabase Edge Function)
If we exceed free tier OR need to proxy for security:

```
supabase/functions/generate-route/
  ├── index.ts  (Deno Edge Function)
  └── Calls ORS API server-side with secret key
```

**Advantages:**
- Hide API key from client
- Add caching layer (cache popular trailhead→campsite routes)
- Rate limiting per user
- Fallback to self-hosted ORS instance

**Not needed for MVP** — defer until we see usage patterns.

---

## 3. UX Integration Design

### Option A: "Suggest Route" Button (RECOMMENDED)
**Flow:**
1. User places 2+ waypoints on map
2. "Suggest Route" button appears in DrawControls
3. Click → generates route, loads into MapLibre Draw
4. User can edit vertices, add segments, or clear & redraw
5. Route source stored as `auto-generated` flag (for future analytics)

**Pros:**
- Preserves existing manual draw workflow
- Gives user control (hiking routes often need adjustment)
- Low risk — doesn't replace core feature

**Cons:**
- Extra button in UI

---

### Option B: Auto-generate on Waypoint Drop
**Flow:**
1. User places 2 waypoints → route auto-generates
2. Each new waypoint extends the route
3. User can still edit/redraw manually

**Pros:**
- Feels "magical"
- Faster for simple routes

**Cons:**
- Can be jarring (route appears unexpectedly)
- May generate bad routes in sparse OSM areas → user frustration
- Harder to implement undo/redo logic

**Verdict:** Defer to V2 — too risky for MVP.

---

## 4. Risks & Mitigations

### Risk: Poor Route Quality in Wilderness Areas
**Problem:** OSM trail data is sparse/inaccurate in remote wilderness.  
**Impact:** Generated route follows roads instead of trails, or fails entirely.  
**Mitigation:**
- Show "Beta" label on Suggest Route button
- Allow user to always edit/replace route manually
- Add feedback mechanism ("Report Bad Route") to track quality
- Consider BRouter self-hosting for V2 (better long-distance hiking)

---

### Risk: API Rate Limits
**Problem:** Free tier = 2,000 req/day (83/hour avg). Could be exceeded if popular.  
**Mitigation:**
- Client-side caching (same waypoint pairs → cached route)
- Usage analytics to monitor burn rate
- Self-host ORS Docker instance when limits approached (simple deployment)

---

### Risk: Elevation Data Accuracy
**Problem:** SRTM data (used by ORS) has ~30m resolution — may miss micro-terrain.  
**Impact:** Elevation profiles slightly inaccurate vs GPS tracks.  
**Mitigation:**
- Document data source in UI ("Elevation from SRTM")
- Users can still import GPX with higher-accuracy elevation

---

### Risk: OpenFreeMap Tiles vs Routing Data
**Problem:** We use OpenFreeMap for map tiles, but routing uses OSM data directly (via ORS).  
**Impact:** Route may appear to go "off trail" on map if tile style doesn't render that trail.  
**Reality:** This is cosmetic — the route is correct per OSM, just tile style incomplete.  
**Mitigation:** No action needed — users understand trail maps vary.

---

## 5. Implementation Estimate

**T-shirt size: MEDIUM (2-3 days)**

**Work breakdown:**
1. Add ORS API integration module (`lib/routing/ors.ts`) — 4 hours
2. Create "Suggest Route" button in DrawControls — 2 hours
3. Wire button to fetch route & load into MapLibre Draw — 4 hours
4. Handle errors (no route found, API timeout) — 2 hours
5. Add loading state & user feedback — 2 hours
6. Test with real waypoints (popular trails + edge cases) — 4 hours
7. Documentation (README + user help text) — 2 hours

**Dependencies:**
- None — builds on existing map infrastructure

**Testing needs:**
- E2E test: place waypoints → click suggest → verify route appears
- Error cases: invalid waypoints, API timeout, sparse OSM data
- Manual QA: test popular trails (JMT, AT sections, local parks)

---

## 6. Final Recommendation

✅ **Implement auto-route generation using OpenRouteService (ORS) with `foot-hiking` profile**

**Why:**
- Zero cost for MVP (2k requests/day = ~500 users planning 4 trips/month)
- Best hiking-specific routing available (free or paid)
- Elevation data included (no separate API)
- GeoJSON output = direct compatibility with our stack
- Easy self-hosting path if we scale

**How:**
- Add "Suggest Route" button to DrawControls (don't replace manual draw)
- Client-side API call to ORS
- Load result into MapLibre Draw as editable route
- Mark as "Beta" feature with feedback mechanism

**When:**
- After Phase 2 core features complete (not blocking MVP launch)
- Good candidate for Phase 3 "polish" sprint

**Don't:**
- Don't replace manual drawing (keep it as primary method)
- Don't auto-generate on waypoint drop (too aggressive for MVP)
- Don't build self-hosted routing for MVP (premature optimization)

---

## Appendix: Alternative Architectures Considered

### Self-Hosted Routing from Day One
**Rejected because:**
- Adds ops complexity (Docker service, OSM data updates, monitoring)
- ORS free tier sufficient for MVP validation
- Can migrate to self-hosted in <1 week if needed

### Mapbox Directions API
**Rejected because:**
- No hiking profile (only walking on roads)
- Elevation requires separate Tilequery API (extra complexity)
- Cost adds up faster than ORS

### Google Directions API
**Rejected because:**
- $5/1,000 requests = 4x more expensive than Mapbox
- Walking profile only (no trail support)

### Hybrid Approach (ORS + BRouter)
**Deferred to V2:**
- Use ORS for MVP
- Add BRouter self-hosted for "advanced routing" mode (V2 feature)
- Let users choose: "Fast route" (ORS) vs "Trail-optimized" (BRouter)
