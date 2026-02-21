# Decision: Devcontainer & Local Dev Setup — Gimli (2026-02-21)

## 1. No docker-compose — Supabase CLI manages its own stack
- **Decision:** Single `devcontainer.json` with no `docker-compose.yml`. Supabase CLI's `supabase start` handles all Supabase services (Postgres, Auth, Studio, etc.) via its own Docker orchestration.
- **Rationale:** Adding a docker-compose would duplicate what the CLI already does and create version-sync headaches. The CLI is the officially supported local dev path.
- **Impact:** Developers run `supabase start` manually after container creation. Simple and predictable.

## 2. Docker-in-Docker for Supabase CLI
- **Decision:** Added `ghcr.io/devcontainers/features/docker-in-docker:2` feature to the devcontainer.
- **Rationale:** `supabase start` spawns Docker containers, so the devcontainer itself needs Docker access. Docker-in-Docker is the standard devcontainer approach for this.

## 3. Auth email confirmations disabled locally
- **Decision:** `enable_confirmations = false` in `supabase/config.toml` for local dev.
- **Rationale:** Eliminates email verification friction during development. Signup → immediate login. Production Supabase project settings are separate and unaffected.

## 4. Deterministic seed UUIDs
- **Decision:** Seed data uses readable, deterministic UUIDs (e.g., `11111111-1111-...` for trips).
- **Rationale:** Makes it easy to reference specific records in tests, API calls, and debugging. No random IDs to look up.

## 5. `.env.local.example` uses standard Supabase local keys
- **Decision:** Pre-filled the anon key with Supabase's well-known local development JWT.
- **Rationale:** This key is public and identical for all local Supabase instances. Developers can `cp .env.local.example .env.local` and immediately connect without running `supabase status` first.
