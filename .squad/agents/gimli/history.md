# Gimli — History

## Project Context

- **Project:** Backpack Planner — outdoor adventure webapp
- **Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui, MapLibre GL JS, Supabase, Zustand
- **User:** Rob

## Learnings

- Built Phase 1 backend: database schema + RLS, Supabase Auth setup (email + Google OAuth), Trip CRUD API
- API pattern: ApiResult<T> wrapper with {data, error} shape in src/lib/api/
- Supabase migrations in supabase/migrations/
- RLS policies enforce user-owned data access
- **Auth State (updated)**: Email/password + magic link fully working. Google OAuth frontend ready but Supabase provider not yet configured. Redirect URL is dynamic via `window.location.origin`, so it works on any domain (localhost, Azure, etc.)
- **Supabase Config**: Uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY env vars. Local dev config in supabase/config.toml has Google OAuth section disabled (expected). Cloud Supabase config managed via dashboard.
- **Important for Google OAuth**: Rob needs to add this redirect URI to Google Cloud Console authorized redirect URIs: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
