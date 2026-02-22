# Decision: Waypoint Click Navigation from Dashboard

**Author:** Pippin
**Date:** 2026-07-19
**Status:** Implemented

## Context
Rob requested that clicking a waypoint marker on the dashboard map should navigate to the trip planner with that waypoint selected/focused.

## Decision
Used a query parameter (`?waypoint=ID`) on the existing `/trip/:tripId/plan` route to pass the target waypoint ID. The TripPlannerPage reads this param on load, waits for waypoints to load from the API, then pans the map to the waypoint and clears the param.

## Alternatives Considered
- **React Router state (`location.state`):** Would work but is not bookmarkable/shareable and can be lost on refresh.
- **Zustand store field:** Would require cleanup logic and risks stale state across navigations.

## Rationale
Query params are the simplest, most RESTful approach — they survive page refresh, are easy to debug, and integrate naturally with React Router's `useSearchParams`. The param is cleared after use to keep the URL clean.

## Impact
- `DashboardMap` has a new optional `onWaypointClick` callback prop
- `TripPlannerPage` now imports `useSearchParams` from react-router-dom
- Waypoint markers on dashboard map are now interactive (pointer cursor, hover scale)
