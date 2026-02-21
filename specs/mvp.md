# TrailForge — Product Requirements Document (PRD)

> **Version:** 1.1 — February 21, 2026
> **Author:** TrailForge Product Team
> **Status:** Approved for MVP development

---

## 1. Problem Statement

Planning a multi-day backpacking trip today is fragmented and frustrating. Hikers cobble together information across AllTrails (route), Google Sheets (itinerary), Lighterpack (gear), weather apps, and permit sites — with no single tool that ties the *map*, the *schedule*, and the *logistics* together. Critical decisions (where to camp, how far to hike each day, what to pack) are made in isolation, leading to over-ambitious itineraries, forgotten gear, and unsafe conditions — especially for less experienced backpackers.

**TrailForge** is a map-first, day-by-day trip planner that unifies route planning, campsite/waypoint management, gear lists, and real-time conditions into one clean, modern experience — "Notion meets AllTrails."

---

## 2. Target Users

| Persona | Description | Key Need |
|---|---|---|
| **Weekend Warrior** | 2–5 trips/year, intermediate skill, plans 2–4 day trips | Fast route + itinerary creation; confidence the plan is realistic |
| **Thru-Hiker Planner** | Plans section or thru-hikes (PCT, AT, CDT); advanced | Granular day-by-day control, resupply waypoints, elevation-aware mileage |
| **Group Trip Organizer** | Plans trips for friends/family/scout troops | Shareable read-only view, gear coordination |
| **Beginner Backpacker** | First 1–3 trips; anxious about logistics | Guided experience, smart recommendations, safety-focused defaults |

**Primary target (MVP):** Weekend Warriors and Beginners planning 2–5 day trips in U.S. national forests and parks.

---

## 3. Data Model

```
User
├── id, email, display_name, avatar_url, skill_level
├── preferred_units: ENUM(imperial, metric)
├── created_at

Trip
├── id, user_id (FK), title, description, status (draft|planned|active|completed)
├── start_date, end_date, region, cover_image_url, is_public, created_at

Day
├── id, trip_id (FK), day_number, date, notes
├── start_waypoint_id (FK), end_waypoint_id (FK)
├── target_miles, elevation_gain, elevation_loss

Waypoint
├── id, trip_id (FK), day_id (FK nullable), name, description
├── type: ENUM(trailhead, campsite, water_source, summit, hazard, poi, resupply)
├── lat, lng, elevation, mile_marker, sort_order
├── notes (free-text; used for water source reliability, hazard details, etc.)

GearItem
├── id, trip_id (FK), user_id (FK)
├── name, category (shelter|sleep|cook|clothing|safety|navigation|hygiene|other)
├── weight_oz, quantity, is_worn, is_packed (checklist state)

Conditions  (cached external data)
├── id, trip_id (FK), waypoint_id (FK nullable)
├── source (NWS|USGS|recreation_gov), data (JSONB)
├── fetched_at, expires_at

Recommendation  (future AI layer)
├── id, trip_id (FK), type (itinerary|gear|safety|general)
├── prompt, response, model, created_at
```

All tables include RLS policies scoped to `user_id` via Supabase Auth.

**Key data decisions:**

- **Gear items** are manually entered by the user (no external gear database in MVP). Gear templates provide starter lists to reduce friction.
- **Water source reliability** is captured via the free-text `notes` field on waypoints (e.g., "seasonal creek — verify flow in late summer"). Structured reliability ratings are deferred to V2.
- **Routes** are single, continuous polylines per trip. Multi-segment / disconnected routes (e.g., drive between trailheads) are out of scope for MVP.
- **Units** are user-selectable from day one: imperial (mi, ft, °F, oz) or metric (km, m, °C, g). Stored in `User.preferred_units`, applied globally across UI.

---

## 4. MVP Feature List (Priority-Ranked)

### P0 — Must Have (Launch Blockers)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Auth & User Profile** | Email + OAuth (Google) sign-up/login via Supabase Auth. Basic profile (name, avatar, skill level, preferred units). |
| 2 | **Trip CRUD** | Create, rename, duplicate, archive, delete trips from the dashboard. |
| 3 | **Interactive Map (Mapbox)** | Full-screen map with satellite/topo toggle. Click-to-place waypoints with type picker. Draggable waypoint markers. |
| 4 | **Route Drawing** | Draw a single continuous route polyline on the map. Display total distance and cumulative elevation. |
| 5 | **Waypoint Management** | Add/edit/delete waypoints. Each has a name, type (enum), free-text notes, and coordinates. Displayed as typed icons on the map. Water sources use notes for reliability info. |
| 6 | **Day-by-Day Itinerary** | Sidebar panel to organize waypoints into ordered days. Each day shows start/end waypoint, mileage, and elevation delta. Drag-and-drop reorder. |
| 7 | **Gear List (Manual Entry)** | Manually add gear items with name, category, weight, and quantity. Running totals (base weight, total weight, worn weight). Pack/check toggle for trip prep. |
| 8 | **Trip Detail / Share View** | Public read-only URL showing map, itinerary, and gear summary. No auth required to view. |
| 9 | **Dashboard** | Card grid of user's trips with status badges, dates, thumbnail map, and quick stats (days, miles). |
| 10 | **Unit System (Imperial + Metric)** | User-level preference for imperial or metric. All distances, elevations, weights, and temperatures render in the selected system. Toggle in profile settings. |
| 11 | **Responsive Layout** | Usable on tablet; functional (not optimal) on mobile. Desktop-first. |

### P1 — Should Have (MVP Polish)

| # | Feature | Description |
|---|---------|-------------|
| 12 | **Elevation Profile Chart** | Visual elevation cross-section of the route, with day boundaries marked. |
| 13 | **GPX Import/Export** | Import routes from GPX files; export trip route as GPX for GPS devices. |
| 14 | **Conditions Tab (Weather)** | Fetch and display NWS 7-day forecast for trip start location. Cache in `Conditions` table. |
| 15 | **Gear Templates** | Pre-built starter gear lists (3-season ultralight, winter, desert) users can clone into a trip. |
| 16 | **Trip Duplication** | Deep-clone a trip (route, waypoints, days, gear) as a starting point for a new trip. |

### P2 — Nice to Have (Post-MVP fast-follows)

| # | Feature | Description |
|---|---------|-------------|
| 17 | **Offline Map Tiles** | Cache Mapbox tiles for selected region via Service Worker for trailhead use. |
| 18 | **Print View** | Printer-friendly trip summary (itinerary table, gear checklist, map screenshot). |
| 19 | **Dark Mode** | Full dark theme toggle (Tailwind `dark:` classes). |

---

## 5. User Stories

### Authentication & Profile

- *As a new user*, I want to sign up with Google so I can get started quickly without creating a password.
- *As a returning user*, I want to see my trips immediately after login so I can pick up where I left off.
- *As a user*, I want to choose between imperial and metric units so the app displays measurements I'm familiar with.

### Dashboard

- *As a user*, I want to see all my trips as cards with key stats (dates, miles/km, days) so I can find the right one at a glance.
- *As a user*, I want to filter trips by status (draft, planned, completed) so I can focus on what's relevant.

### Map & Route

- *As a planner*, I want to draw a continuous route on a topographic map so I can visualize the exact trail I'll hike.
- *As a planner*, I want to toggle between satellite and topo basemaps so I can assess terrain.
- *As a planner*, I want to import a GPX file so I can use a route I found on another platform.
- *As a planner*, I want to see total distance and elevation gain update in real time (in my preferred units) as I draw so I can gauge difficulty.

### Waypoints

- *As a planner*, I want to drop typed waypoints (campsite, water source, hazard, etc.) on the map so I can mark important locations.
- *As a planner*, I want each waypoint to show a distinct icon by type so I can scan the map quickly.
- *As a planner*, I want to add free-text notes to a waypoint (e.g., "bear box available", "seasonal creek — verify flow") so I remember key details.
- *As a planner*, I want to note water source reliability in the waypoint notes so I can plan water carries accordingly.

### Itinerary

- *As a planner*, I want to drag waypoints into a day-by-day itinerary so I can structure a realistic schedule.
- *As a planner*, I want each day to show mileage and elevation (in my preferred units) so I can balance effort across days.
- *As a planner*, I want to add rest days or zero days so I can plan recovery.
- *As a planner*, I want to reorder days and reassign waypoints easily so I can iterate on the plan.

### Gear

- *As a planner*, I want to manually build a gear list with weights so I can track my pack weight.
- *As a planner*, I want to see base weight vs. total weight vs. worn weight (in oz or grams) so I can optimize.
- *As a planner*, I want to check off items as I pack them so I don't forget anything.
- *As a new user*, I want to start from a gear template so I don't have to build a list from scratch.

### Conditions

- *As a planner*, I want to see the weather forecast for my trip dates and location (in °F or °C) so I can pack appropriately and assess safety.

### Sharing

- *As a user*, I want to share a read-only link to my trip so friends/family can see my plan (and my emergency contact knows my route).
- *As a viewer*, I want to see the map, itinerary, and gear list without signing up so I can review the plan easily.

---

## 6. Technical Architecture (MVP)

```
┌─────────────────────────────────────────────────┐
│                    Client                        │
│  Vite + React 18 + TypeScript                   │
│  ┌────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │Zustand │ │React     │ │ Mapbox GL JS      │  │
│  │(state) │ │Router v6 │ │ (map, markers,    │  │
│  │        │ │          │ │  draw, geocoder)   │  │
│  └────────┘ └──────────┘ └───────────────────┘  │
│  Tailwind CSS + shadcn/ui components            │
├─────────────────────────────────────────────────┤
│                  Supabase                        │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Auth    │ │ Postgres │ │   Storage      │  │
│  │  (OAuth) │ │  + RLS   │ │  (images/GPX)  │  │
│  └──────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────────────────────────────────────┐   │
│  │  Edge Functions (conditions fetch proxy) │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  Built-in Analytics (usage tracking)     │   │
│  └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│            External APIs (read-only)             │
│  NWS Weather · USGS Elevation · OSM Tiles       │
└─────────────────────────────────────────────────┘
```

**Key decisions:**

- **Zustand** over Redux for minimal boilerplate; trip state is the single store.
- **Supabase Edge Functions** proxy external API calls (NWS, USGS) to avoid CORS and manage caching.
- **Supabase Storage** for GPX uploads, trip cover images, and future photo attachments.
- **Supabase Built-in Analytics** for usage tracking and success metrics — no external analytics dependency needed for MVP.
- **Mapbox GL JS** with `@mapbox/mapbox-gl-draw` for route polyline editing.
- **Row-Level Security** on all tables; public share view uses a Supabase service-role edge function that returns sanitized data for `is_public = true` trips.
- **Unit conversion** handled client-side via a shared utility module. All values stored in imperial (miles, feet, oz) in the database; converted on render based on `User.preferred_units`.

### Route Structure

```
/                        → redirect to /dashboard
/login                   → Auth page
/dashboard               → Trip list (authenticated)
/trip/:tripId/plan       → TripPlanner (map + sidebar tabs)
/trip/:tripId            → TripDetail (read-only share view)
```

---

## 7. Success Metrics

| Metric | Target (3 months post-launch) | Measurement |
|--------|-------------------------------|-------------|
| **Registered Users** | 1,000 | Supabase Auth count |
| **Trips Created** | 2,500 | DB count where status ≠ draft |
| **Trips with ≥ 3 Days Planned** | 40% of all trips | DB query |
| **Gear Lists Created** | 60% of trips have ≥ 5 gear items | DB query |
| **Share Link Views** | 500 unique views/month | Supabase Analytics |
| **D7 Retention** | 30% | Supabase Analytics (users returning within 7 days of signup) |
| **GPX Imports** | 20% of trips | Storage upload count |
| **Metric Unit Adoption** | Track % of users selecting metric | DB query on `preferred_units` |
| **NPS Score** | ≥ 40 | In-app survey (post-trip completion) |

All metrics tracked via **Supabase built-in analytics** dashboards and direct database queries.

---

## 8. Out of Scope (MVP)

| Item | Rationale |
|------|-----------|
| Native mobile app | Desktop-first MVP; responsive web is sufficient initially. |
| Real-time collaboration | Adds significant complexity; share view covers the social need for now. |
| Social feed / community | Focus on utility first; community features are a growth play for V3. |
| Permit booking / payment | Integration with recreation.gov is read-only in V2; transactions add legal and compliance burden. |
| AI recommendations | Requires training data from user trips; deferred to V2/V3. |
| Offline-first (full PWA) | Offline map tiles are P2; full offline CRUD is V3. |
| Custom waypoint icons / photos | MVP uses a fixed icon set per waypoint type. |
| Multi-user trip ownership | Single owner per trip; sharing is read-only. |
| Calorie / meal planning | Tangential to core; may become a plugin in V3. |
| External gear database | Manual gear entry is sufficient for MVP; gear DB integration evaluated for V2. |
| Multi-segment / disconnected routes | Single continuous route per trip. Multi-segment support deferred to V2+. |
| Structured water source ratings | Free-text notes cover this for MVP; structured reliability ratings in V2. |

---

## 9. Phased Roadmap

### Phase 1 — MVP (Months 1–3)

> **Goal:** Core loop works end-to-end. A user can plan a real backpacking trip and share it.

| Month | Milestone |
|-------|-----------|
| **M1** | Project scaffold (Vite + React + Tailwind + Supabase). Auth flow with unit preference. Dashboard UI. Trip CRUD. Database schema + RLS. Unit conversion utility module. |
| **M2** | Mapbox integration: basemap, waypoint placement, single continuous route drawing, distance/elevation display (imperial + metric). Sidebar with itinerary tab: day management, waypoint assignment, drag-and-drop. |
| **M3** | Gear list tab (manual CRUD, weights in oz/g, categories, checklist). Trip detail share view. GPX import/export. Elevation profile chart. Conditions tab (NWS weather in °F/°C). Gear templates. Supabase Analytics setup. QA, polish, deploy. |

**Exit criteria:** A user can sign up → set unit preference → create a trip → draw a route → place waypoints (with free-text notes for water sources) → organize days → build a gear list manually → check weather → share a link. All measurements display in the user's chosen unit system.

---

### Phase 2 — Integrations & Intelligence (Months 4–7)

> **Goal:** Enrich the planner with external data and introduce the AI layer.

| Feature | Details |
|---------|---------|
| **Recreation.gov Integration** | Search nearby campgrounds/permits. Display availability on map. Deep-link to booking. |
| **USGS Elevation API** | Auto-populate waypoint elevations. Generate high-fidelity elevation profiles from DEM data. |
| **OSM Trail Data Overlay** | Show official trail paths, junctions, and shelters from OpenStreetMap. Snap routes to trails. |
| **iNaturalist Overlay** | Show recent wildlife/plant observations near the route (educational + safety: bear sightings, etc.). |
| **AI Recommendations (v1)** | LLM-powered assistant in the sidebar. Contextual prompts: "Is this itinerary realistic?", "What should I pack given the forecast?", "Suggest campsites for Day 3." Uses trip data, weather, and elevation as context. |
| **Trip Templates** | Curated popular routes (e.g., "JMT Section 1: Happy Isles → Tuolumne") users can clone and customize. |
| **Structured Water Source Ratings** | Upgrade from free-text to a structured reliability enum (reliable, seasonal, intermittent, dry) with last-verified date. |
| **Gear Database (Optional)** | Searchable gear catalog to auto-fill name/weight when adding items. |
| **Multi-Segment Routes** | Support multiple disconnected route segments within a single trip. |
| **Dark Mode** | Full dark theme. |
| **Print View** | Printable trip summary for the trailhead. |

---

### Phase 3 — Community & Platform (Months 8–14)

> **Goal:** Transform from tool to platform. Network effects and retention.

| Feature | Details |
|---------|---------|
| **Trip Reports** | Post-trip journaling with photos, actual mileage, and conditions notes. Feeds back into recommendations. |
| **Community Trip Library** | Browse and clone public trips. Search by region, difficulty, duration. |
| **Real-Time Collaboration** | Multiple users edit a trip simultaneously (Supabase Realtime + CRDT for conflict resolution). |
| **Advanced AI** | Personalized suggestions based on trip history and skill progression. "You've done 3 moderate trips — here's a challenging one nearby." Automated packing lists based on forecast + duration + terrain. |
| **Offline-First PWA** | Full offline CRUD with background sync. Cached map tiles for downloaded regions. |
| **Native Mobile (React Native or Capacitor)** | Wrap core experience for App Store / Play Store. GPS tracking during active trips. |
| **Calorie & Meal Planner** | Plan meals per day, calculate calorie needs based on mileage/elevation/body weight. |
| **Integrations Marketplace** | Connect Garmin/Strava for post-trip sync. Export to CalTopo, Gaia GPS. |
| **Internationalization (i18n)** | Full language localization beyond unit support. |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Mapbox costs scale with users | Medium | High | Use Mapbox free tier (50K loads/mo). Monitor usage; evaluate MapLibre GL as OSS fallback. |
| NWS API rate limits / downtime | Medium | Medium | Cache aggressively (Conditions table + 6hr TTL). Graceful fallback UI. |
| Supabase free tier limits | Low (MVP) | Medium | Monitor row counts and storage. Upgrade to Pro ($25/mo) at ~500 active users. |
| GPX parsing edge cases | High | Low | Use well-tested library (`gpxparser`). Validate and sanitize on upload. Show clear error on malformed files. |
| AI hallucination in recommendations | Medium | High | Ground LLM responses in structured trip data. Always show source data alongside suggestions. Add disclaimer. Never auto-apply AI suggestions. |
| Scope creep delays MVP | High | High | Strict P0/P1/P2 prioritization. Cut P2 from MVP if behind schedule. Ship weekly to staging. |
| Unit conversion bugs | Medium | Medium | Centralized conversion utility with thorough unit tests. Store all values in a single canonical unit (imperial) and convert on display. |

---

## 11. Resolved Decisions

These items were originally open questions, now resolved for MVP:

| # | Question | Decision |
|---|----------|----------|
| 1 | **Gear data source** | Manual entry only for MVP. Gear templates reduce friction. External gear database evaluated for V2. |
| 2 | **Water source reliability** | Free-text notes on waypoints (e.g., "seasonal — check flow in August"). Structured reliability ratings deferred to V2. |
| 3 | **Multi-route trips** | Single continuous route per trip for MVP. Multi-segment support deferred to V2. |
| 4 | **Units** | Support both imperial (mi, ft, °F, oz) and metric (km, m, °C, g) from MVP launch. User-level preference stored in profile. |
| 5 | **Analytics** | Supabase built-in analytics for usage tracking and success metrics. No external analytics tool needed. |

---

## Appendix: Unit Conversion Reference

All values stored in the database in imperial units. Conversion applied client-side on render.

| Measurement | Imperial (stored) | Metric (display) | Conversion |
|-------------|-------------------|-------------------|------------|
| Distance | miles | kilometers | × 1.60934 |
| Elevation | feet | meters | × 0.3048 |
| Weight | ounces | grams | × 28.3495 |
| Temperature | °F | °C | (°F − 32) × 5/9 |

---

*Document version: 1.1 — February 21, 2026*
*Author: TrailForge Product Team*
