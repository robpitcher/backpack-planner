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
