# Profile Modal Instead of Profile Page

**Date:** 2025-07-18
**Author:** Pippin

## Context
Rob requested that profile editing open as a modal overlay (with blurred background) instead of navigating to a separate /profile page. This keeps users in context — no page reload, no navigation away from dashboard or trip planner.

## Decision
- Created `src/components/ProfileModal.tsx` using shadcn Dialog component.
- All profile link touchpoints (DashboardPage, TripPlannerPage, AppHeader) now open the modal instead of navigating.
- Added `backdrop-blur-sm` to the shared `DialogOverlay` in `src/components/ui/dialog.tsx` so all modals app-wide get a subtle blur effect.
- The `/profile` route and `ProfilePage.tsx` remain for backwards compatibility but are no longer the primary UX.

## Rationale
- Modal keeps user in place — no context switch, no page reload.
- Backdrop blur provides visual focus on the modal content.
- Global blur on DialogOverlay is a consistent UX improvement for all dialogs.

## Files Changed
- `src/components/ProfileModal.tsx` (new)
- `src/components/ui/dialog.tsx` (added backdrop-blur-sm)
- `src/pages/DashboardPage.tsx` (modal instead of Link)
- `src/pages/TripPlannerPage.tsx` (modal instead of Link)
- `src/components/AppHeader.tsx` (modal instead of Link)
