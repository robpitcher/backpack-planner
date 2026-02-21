# Trip CRUD API Decisions — Gimli (2026-02-21)

Work Item #8: Trip CRUD API Layer

### 1. Separate ApiResult<T> wrapper (not reusing AuthResult<T>)
Data access functions return `PostgrestError`, not `AuthError`. Created `ApiResult<T>` in `src/lib/api/trips.ts` with the same `{ data, error }` shape but the correct error type. This keeps TypeScript honest — consumers get proper error typing without casting.

### 2. RLS-only auth — no user_id in createTrip input
`createTrip` does not accept a `user_id` parameter. The Supabase RLS default value (`auth.uid()`) handles user assignment at the database level. This means the API layer cannot accidentally create trips for other users.

### 3. duplicateTrip is a shallow stub
`duplicateTrip` copies trip-level fields only (title, description, dates, region). It does NOT copy days, waypoints, gear items, or conditions — that's Item #31's scope. The copy resets to `draft` status and `is_public: false` to prevent accidental public exposure.

### 4. archiveTrip uses 'completed' status
The `trip_status` enum has four values: `draft`, `planned`, `active`, `completed`. "Archive" maps to `completed` since the schema doesn't have a separate `archived` status. If we need distinct archive vs. completed semantics later, we'd add it to the enum.

### 5. API directory established at src/lib/api/
Created `src/lib/api/` as the home for all Supabase data access functions. Future CRUD modules (days, waypoints, gear) should follow the same pattern established here.
