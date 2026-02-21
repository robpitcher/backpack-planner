# 🏕️ TrailForge – Map-First Backpacking Trip Planner

**The smart way to plan multi-day wilderness adventures.** TrailForge is a web app for backpackers to create trips, draw routes on interactive topographic maps, place typed waypoints (campsites, water sources, passes, resupply points), build day-by-day itineraries, manage gear with weight tracking, check weather forecasts, and share trips with the community.

---

## ✨ Key Features

- **🗺️ Interactive Topographic Maps** – Mapbox GL with satellite/topo basemaps, responsive zoom and pan
- **🛤️ Route Drawing & Analytics** – Draw routes with real-time distance and elevation tracking
- **📍 Typed Waypoints** – Campsite, water source, mountain pass, resupply point, trailhead, POI
- **📅 Day-by-Day Itineraries** – Organize your trip with waypoint assignments and daily summaries
- **🎒 Gear Management** – Add gear, track weight by category, view total pack weight
- **📋 Gear Templates** – Pre-built templates for ultralight, traditional, winter, and thru-hike styles
- **⛅ Weather Forecasts** – NWS integration to check conditions along your route
- **📤/📥 GPX Import/Export** – Share routes with other tools, import existing GPX files
- **🌍 Public Trip Sharing** – Share read-only trip links for planning with friends
- **🔐 Trip Duplication** – Deep clone trips to create variations or plan similar adventures
- **💾 Responsive Design** – Collapsible sidebar, mobile-friendly UI, works on all devices
- **🔑 Secure Authentication** – Email/password auth via Supabase with RLS policies

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite |
| **State** | Zustand |
| **UI** | Tailwind CSS v4, shadcn/ui, Recharts |
| **Maps** | Mapbox GL JS, Turf.js (geospatial) |
| **Backend** | Supabase (Auth, PostgreSQL, RLS) |
| **Build** | Vite, ESLint, Prettier |

---

## 🚀 Getting Started

### Easiest: GitHub Codespaces or DevContainer (Recommended)

**Codespaces:** Click the green **"Code"** button on GitHub → **"Open with Codespaces"** → new codespace. Everything installs automatically.

**VS Code Dev Container:** Open this repo in VS Code → click **"Reopen in Container"** when prompted (or run `Dev Containers: Reopen in Container`).

Once the container is ready, start Supabase and the dev server:

```bash
npx supabase start
npm run dev
```

5. Visit [http://localhost:5173](http://localhost:5173)

**Test account:** `hiker@example.com` / `testpassword123`

### Manual Setup

1. Install Node.js 20+ and Docker Desktop
2. Clone and set up:

```bash
git clone <repo-url>
cd backpack-planner
npm install
cp .env.local.example .env.local
```

3. Start Supabase and dev server:

```bash
npx supabase start
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env.local` file (or use `.env.local.example` as a template):

```env
# Local defaults work for devcontainer; override for production
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local-key-from-supabase-start>

# Required: Get your token from https://www.mapbox.com/account/tokens
VITE_MAPBOX_TOKEN=<your-mapbox-token-here>
```

---

## 📝 Available Scripts

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## 📚 Full Developer Docs

For detailed setup instructions, database schema, seed data, project structure, and troubleshooting, see **[DEVELOPING.md](DEVELOPING.md)**.

---

## 📄 License

MIT License © 2026 Rob Pitcher. See [LICENSE](LICENSE) for details.

---

**Built with ❤️ for backpackers, by backpackers.**
