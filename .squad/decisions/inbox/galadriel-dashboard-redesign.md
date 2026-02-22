# Decision: Dashboard Layout Redesign — Map-First Experience

**Author:** Galadriel (Designer/UX)  
**Date:** 2025-01-21  
**Status:** Proposed  
**Requested by:** Rob

## Context

Rob wants the dashboard to feel more like the trip planner page — with the map as the primary/hero element and a left sidebar for navigation and controls. Currently the dashboard uses a centered card grid layout without any map presence.

## Decision

Redesign the dashboard to use a **map-first layout** with:
1. Full-bleed map as the main canvas
2. Left sidebar for trip list, filters, and quick actions
3. Trip markers displayed directly on the map
4. Visual consistency with the existing TripPlannerPage

## Detailed Design Specification

See Galadriel's full design proposal in the conversation history for:
- Layout structure and sizing
- Sidebar content organization
- Map interactions and overlays
- Responsive behavior
- Empty states
- UX rationale

## Impact

- **DashboardPage.tsx** — Major restructure required
- **New component needed** — DashboardSidebar or similar
- **MapView** — May need variant for "multi-trip" mode
- **TripCard** — May become TripListItem for sidebar context
- **AppHeader** — May be replaced with trip planner-style inline header

## Team Notes

- Pippin: This will require significant frontend work. Review the full proposal.
- Gandalf: Product implications for trip visibility and map interactions.
