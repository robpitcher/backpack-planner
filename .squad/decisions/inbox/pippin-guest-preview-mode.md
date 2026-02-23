## Guest Preview Mode — Dashboard Without Login

**Date:** 2025-07-26
**Author:** Pippin
**Requested by:** Rob

### Context
Rob requested that first-time visitors see the main dashboard (with interactive map) instead of being redirected to the login page. Users should be able to preview the site, change themes, and interact with the map before signing in.

### Decision
- The `/dashboard` route no longer wraps `DashboardPage` in `AuthGuard` — it renders for all visitors.
- `DashboardPage` checks auth state via `isGuest = !session` and renders conditionally:
  - **Guest**: Profile button → navigates to `/login`. Sidebar CTA says "Sign in to Manage Trips" and navigates to `/login`.
  - **Authenticated**: Profile dropdown with Profile/Logout. Sidebar CTA says "Create Trip" and opens the create dialog.
- `/login` route and `LoginPage.tsx` remain intact for direct navigation.
- `AuthGuard` still protects `/profile` and `/trip/:id/plan` routes.
- Theme toggle and map are fully functional without auth.

### Rationale
- Reduces friction for new users — they can explore the UI before committing to an account.
- Minimal change footprint: only `App.tsx` (remove guard) and `DashboardPage.tsx` (add guest branching).
- No new components or patterns introduced — uses existing `useNavigate` for guest-to-login flow.

### Impact
- Any future dashboard features should check `isGuest` before rendering auth-dependent UI.
- The `isGuest = !session` pattern from auth store can be reused across other components.
