# Decisions

<!-- Append-only. Scribe merges from decisions/inbox/. -->

## Issue #9: cursor-pointer in Button base classes

**Date:** 2026-02-22
**Author:** Pippin
**Issue:** #9
**PR:** #15

### Context
The shadcn/ui Button component did not include `cursor-pointer` in its base Tailwind classes, so buttons didn't show a pointer cursor on hover (browsers default `<button>` to `cursor: default`).

### Decision
Added `cursor-pointer` to the `buttonVariants` CVA base string in `src/components/ui/button.tsx`. This is a single-point change that applies to every Button variant and size across the app.

### Rationale
- One-line fix with app-wide coverage; no per-component overrides needed.
- Follows user expectation that clickable elements show pointer cursor.

---

## Issue #6: Shared Breadcrumb Component Pattern

**Date:** 2026-02-22
**Author:** Pippin
**Issue:** #6
**PR:** #17

### Decision
Created a shared `src/components/Breadcrumb.tsx` component for page-level breadcrumb navigation in headers. Custom implementation (not shadcn) since no shadcn breadcrumb was available in the project.

### Details
- Uses `BreadcrumbItem[]` prop: each item has `label`, optional `href` (renders Link), optional `onClick` (renders button)
- Last item is always the current page (aria-current="page", no link)
- ChevronRight icon as separator, theme-aware classes, responsive truncation
- Replaces static title text in DashboardPage and TripPlannerPage headers

### Impact
Any future pages should use this Breadcrumb component in their headers for consistent navigation.

---

## Issue #7: Azure Database Deployment for TrailForge

**Date:** 2026-02-22
**Author:** Elrond
**Issue:** #7
**Status:** Awaiting decision (pending Rob clarification)

### Context
TrailForge is tightly coupled to Supabase (35+ PostgREST API calls, 8 GoTrue auth functions, 15+ RLS policies). Rob clarified he does NOT have Supabase Cloud and wants data on Azure. Elrond evaluated three deployment architectures.

### Options Evaluated

**Option 1: Self-Hosted Supabase on Azure Container Apps**
- Complexity: 4/5 | Cost: ~$25/mo | Code changes: None | Time: 2–4 days
- Maintains 100% code compatibility; only environment variable changes needed
- Requires PostgreSQL Flexible Server + 3–4 Container Apps (Kong, GoTrue, PostgREST, optionally Studio) + SMTP for magic links

**Option 2: Azure-Native (Complete Rewrite)**
- Complexity: 5/5 | Cost: ~$15/mo | Code changes: 500–800 lines | Time: 2–4 weeks
- Replaces Supabase entirely with Azure AD B2C + Functions + custom API layer; rewrites all auth, RLS becomes middleware
- Not viable for MVP—re-architecture project, not deployment task

**Option 3: Supabase Cloud Free Tier**
- Complexity: 1/5 | Cost: $0/mo | Code changes: None | Time: 30 min
- Simplest path; data not on Azure but meets MVP timeline
- Rob said he doesn't have this, but included for completeness if he's open to it

### Recommendation
**For MVP:** Option 3 (Supabase Cloud) if acceptable. **Otherwise:** Option 1 (self-hosted Supabase on Azure, ~$25/mo, zero code changes).

**Do not pursue Option 2** for MVP. The app was architected for Supabase; fighting that for Azure-native is misaligned investment.

### Decision Needed from Rob
1. Is Supabase Cloud acceptable? (→ Option 3, deploy in 30 min)
2. If not, is ~$25/mo acceptable for self-hosted Supabase on Azure? (→ Option 1)
3. Is data-on-Azure a hard requirement or preference?

### Impact on Infra
- **Option 3:** Existing Bicep (SWA + UAMI + GitHub Actions) works as-is; add Supabase env vars only.
- **Option 1:** New Bicep modules needed for Container Apps Environment, PostgreSQL Flexible, container services. Significant `infra/` expansion.

---

## Issue #5: Waypoint context menu pattern

**Date:** 2026-02-22
**Author:** Pippin
**Issue:** #5
**PR:** #16

### Decision
Waypoint context menus follow the same DropdownMenu + dialog pattern as TripCard. Each action (Edit, Delete) opens its own dialog component to keep WaypointList.tsx clean. The ⋮ button uses hover-reveal (`group` + `opacity-0 group-hover:opacity-100`).

### Files
- `src/components/sidebar/WaypointList.tsx` — menu trigger + state
- `src/components/sidebar/WaypointEditDialog.tsx` — edit modal
- `src/components/sidebar/DeleteWaypointDialog.tsx` — delete confirmation

### Notes
- Uses optimistic updates with API rollback on failure, matching the gear/day patterns in tripStore.
- Calls API directly from dialog components rather than adding new store actions, since the store already has local `updateWaypoint`/`removeWaypoint`.

---

## Guest Preview Mode — Dashboard Without Login

**Date:** 2026-02-23
**Author:** Pippin
**Requested by:** Rob
**Commit:** e03523b

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

---

## Login Modal Pattern

**Date:** 2025-07-25
**Author:** Pippin
**Requested by:** Rob

### Context
Rob requested converting the login page from a standalone page to a modal dialog overlaid on the dashboard, matching the ProfileModal pattern. The dashboard should be visible but blurred behind the login form.

### Decision
- Created `src/components/LoginModal.tsx` — a non-dismissable modal containing the full login/signup form.
- `AuthGuard` no longer redirects to `/login`. It renders its children (the protected page) with a `LoginModal` overlay when unauthenticated.
- `/login` route now redirects to `/dashboard` for backward compatibility.
- The existing `backdrop-blur-sm` on `DialogOverlay` provides the blur effect.

### Key Details
- Non-dismissable: `showCloseButton={false}`, `onInteractOutside`/`onEscapeKeyDown` call `preventDefault()`, `onOpenChange` is a no-op.
- Modal closes automatically when auth succeeds (auth store session updates → `open={!session}` becomes false).
- LoginPage.tsx kept for backward compatibility as a redirect.

### Impact
- All auth-guarded routes now show their page content (blurred) behind the login modal instead of a blank redirect.
- Future non-dismissable modal patterns should follow this same approach.

---

## User Directive: Login Modal Pattern — Future Iteration

**Date:** 2026-02-23T01:23:55Z
**By:** Rob (via Copilot)

### Directive
Consider re-implementing the login modal pattern (blurred dashboard behind login form) in a future iteration. Check git commit history for the previous implementation.

### Context
User request — captured for team memory.
