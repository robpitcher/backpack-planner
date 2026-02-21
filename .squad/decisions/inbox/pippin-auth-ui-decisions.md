# Auth UI Decisions — Pippin

## 1. Auth state lives in Zustand, not React context
- **Decision:** Auth state (user, session, isLoading) managed in a Zustand store (`authStore.ts`), not a React Context provider.
- **Rationale:** Consistent with project stack (Zustand for state). Simpler than Context + Provider pattern. Any component can access auth state without prop drilling or provider nesting.

## 2. Auth listener initialized in App.tsx useEffect
- **Decision:** `useAuthStore.initialize()` called once in `App.tsx` on mount, with cleanup on unmount.
- **Rationale:** Ensures the auth subscription is active globally before any route renders. Single point of initialization avoids duplicate listeners.

## 3. AuthGuard is a wrapper component, not a route layout
- **Decision:** `<AuthGuard>` wraps individual route elements rather than being a layout route.
- **Rationale:** More explicit — you can see which routes are protected directly in the route config. Simpler to implement without React Router layout patterns.

## 4. ESLint override for shadcn/ui components
- **Decision:** Disabled `react-refresh/only-export-components` for `src/components/ui/**`.
- **Rationale:** shadcn components export helper utilities (e.g., `buttonVariants`) alongside components. This is intentional and standard shadcn practice.
