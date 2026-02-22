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
