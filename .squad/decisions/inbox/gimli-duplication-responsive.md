# Decision: Trip Duplication Deep Clone Strategy

**Author:** Gimli  
**Date:** 2026-02-21  
**Items:** 16 (Trip Duplication), 18 (Responsive Layout)

## Trip Duplication — Sequential Inserts (Not Transaction)

Deep-clone uses sequential Supabase client-side inserts rather than a server-side transaction or stored procedure. If any step fails mid-clone, you get a partial draft trip — which is harmless and can be deleted. This keeps the implementation simple and avoids needing a Supabase Edge Function just for transactional writes.

## Day→Waypoint FK Remapping

When cloning days and waypoints, we build a `Map<oldDayId, newDayId>` by matching on `day_number` order after bulk insert. Waypoints' `day_id` references are then remapped to the new day IDs. Start/end waypoint refs on days are set to null (avoiding the complexity of a second remapping pass for minimal value).

## Gear Packing Status Reset

Cloned gear items have `is_packed` reset to `false`. Packing status is ephemeral and shouldn't carry from one trip to another.

## Responsive Sidebar Strategy

TripPlannerPage sidebar uses a state-controlled toggle instead of a CSS-only approach. On `lg:` (1024px+) the sidebar is always visible via `lg:flex`. On narrower viewports, the toggle button shows/hides it. The sidebar takes full width on mobile (`w-full`) and fixed width on tablet+ (`sm:w-72 md:w-80`).
