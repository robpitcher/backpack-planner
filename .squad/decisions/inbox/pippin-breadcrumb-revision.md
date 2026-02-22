# Breadcrumb Revision: Simplified Depth & Reset Behavior

**Date:** 2025-07-25
**Author:** Pippin
**PR:** #17 (revision)

## Context
Rob's spec (`specs/breadcrumb.md`) requested simplifying the breadcrumb to max depth of "Trip Planner" and adding a map reset on breadcrumb click.

## Decision
- Max breadcrumb depth is `TrailForge → Trip Planner`. No trip name or waypoint segments in breadcrumb (trip name is in sidebar).
- Extracted `resetMapView` in TripPlannerPage: deselects waypoint + fitBounds all waypoints/route. Used by breadcrumb "Trip Planner" click, waypoint toggle-off, and sidebar blank-area click.
- Breadcrumb component now supports clickable last items (onClick/href) while preserving `aria-current="page"`.
- Dashboard back arrow removed; TrailForge breadcrumb replaces its function.
- WaypointList gets `onDeselect` prop with blank-area spacer div for deselection.

## Rationale
- Keeps breadcrumb minimal since trip name is already visible in sidebar.
- Single `resetMapView` function avoids duplicating fitBounds logic across multiple interaction points.
