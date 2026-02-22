# Galadriel — History

## Core Context

- **Project:** Backpack Planner — outdoor adventure webapp with interactive maps
- **Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui, MapLibre GL JS, Supabase
- **User:** Rob
- **Theme system:** CSS custom properties (HSL) in src/index.css, dark/light/system modes via ThemeProvider in src/lib/theme.tsx
- **Dark mode:** Layered blue-gray palette (not pure black), uses semantic Tailwind classes (bg-background, bg-card, text-foreground, etc.)
- **Map:** MapLibre GL JS with OpenFreeMap tiles (liberty style), no API key needed
- **Components:** shadcn/ui component library with Tailwind CSS

## Learnings

- **Dashboard redesign direction (2025):** Rob wants the dashboard to feel more like the trip planner — map as hero element, left sidebar for navigation/controls. This brings visual consistency and puts the map front-and-center for outdoor adventurers.
- **TripPlannerPage layout pattern:** Uses `flex h-screen` with collapsible left sidebar (w-80 on desktop), tabbed navigation, and map taking remaining flex-1 space. Elevation profile sits below map.
- **Current dashboard layout:** Card grid layout (max-w-7xl centered), status filter pills, TripCard components with map thumbnail placeholder. No actual map display.
- **Sidebar CSS tokens:** Design system has dedicated sidebar colors (--sidebar, --sidebar-foreground, etc.) ready for use.
