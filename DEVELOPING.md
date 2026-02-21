# Developing TrailForge

## Prerequisites

- [Node.js 20+](https://nodejs.org/) (LTS recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for Supabase local)
## Quick Start (Devcontainer)

The fastest way to get running — everything is pre-configured.

1. Open this repo in VS Code
2. When prompted, click **"Reopen in Container"** (or run `Dev Containers: Reopen in Container` from the command palette)
3. Wait for the container to build and `npm install` to complete
4. Start the backend and frontend:

```bash
npx supabase start
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) — the app is running
6. Open [http://localhost:54323](http://localhost:54323) — Supabase Studio for database management

**Test account:** `hiker@example.com` / `testpassword123`

## Quick Start (Without Devcontainer)

1. Install prerequisites above
2. Clone and install:

```bash
git clone <repo-url>
cd backpack-planner
npm install
```

3. Set up local environment:

```bash
cp .env.local.example .env.local
```

4. Start Supabase and the dev server:

```bash
npx supabase start
npm run dev
```

The `npx supabase start` command will:
- Pull and start the Supabase Docker containers
- Apply all migrations from `supabase/migrations/`
- Seed the database with test data from `supabase/seed.sql`

## Available Services

| Service          | URL                          | Description                  |
| ---------------- | ---------------------------- | ---------------------------- |
| Vite Dev Server  | http://localhost:5173        | Frontend app with HMR        |
| Supabase Studio  | http://localhost:54323       | Database GUI & API explorer   |
| Supabase API     | http://localhost:54321       | PostgREST API & Auth         |
| Supabase DB      | localhost:54322              | Direct Postgres connection    |

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Type-check + production build
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode

# Supabase
npx supabase start           # Start local Supabase stack
npx supabase stop            # Stop local Supabase stack
npx supabase status          # Show local service URLs and keys
npx supabase db reset        # Reset DB: drop, re-migrate, re-seed
npx supabase migration new <name>  # Create a new migration file
```

## Resetting the Local Database

If your local database gets into a bad state or you want to start fresh:

```bash
npx supabase db reset
```

This will:
1. Drop the existing database
2. Re-apply all migrations in order
3. Re-run `supabase/seed.sql`

## Environment Variables

| Variable                 | Description                          | Local Default                        |
| ------------------------ | ------------------------------------ | ------------------------------------ |
| `VITE_SUPABASE_URL`      | Supabase API URL                     | `http://127.0.0.1:54321`            |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key               | Standard local dev key (see .env.local.example) |
| `VITE_MAPBOX_TOKEN`      | Mapbox GL JS access token            | Get from [Mapbox](https://account.mapbox.com/) |

## Seed Data

The seed file (`supabase/seed.sql`) creates:

- **Test user:** `hiker@example.com` / `testpassword123`
- **3 trips:**
  - John Muir Trail Thru-Hike (planned)
  - Olympic Coast Weekend (draft)
  - Appalachian Trail — Smokies Section (completed)
- **6 waypoints** across the JMT and Olympic trips
- **4 gear items** on the JMT trip (shelter, sleep system, filter, shoes)

## Project Structure

```
backpack-planner/
├── .devcontainer/       # Dev container configuration
├── src/
│   ├── components/      # React components (shadcn/ui)
│   ├── lib/             # Supabase client, auth, API modules
│   ├── pages/           # Route-level page components
│   ├── stores/          # Zustand state stores
│   └── types/           # TypeScript type definitions
├── supabase/
│   ├── config.toml      # Supabase local dev config
│   ├── migrations/      # SQL migration files (applied in order)
│   └── seed.sql         # Test data for local development
└── specs/               # Product specs and requirements
```
