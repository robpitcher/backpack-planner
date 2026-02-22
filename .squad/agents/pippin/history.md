# Pippin — History

## Project Context

- **Project:** Backpack Planner — outdoor adventure webapp
- **Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui, MapLibre GL JS, Supabase, Zustand
- **User:** Rob

## Learnings

- Built all Phase 1 frontend: auth UI, profile page, dashboard, trip CRUD UI, unit conversion utility, shared types
- Dashboard uses card grid layout with status filter pills and TripCard components
- TripPlannerPage uses flex h-screen with collapsible sidebar (w-80), tabbed navigation, map takes flex-1
- MapLibre GL JS with OpenFreeMap tiles (liberty style), no API key needed
- Theme system: CSS custom properties (HSL) in src/index.css, ThemeProvider in src/lib/theme.tsx
- Dark mode: layered blue-gray palette, semantic Tailwind classes (bg-background, bg-card, text-foreground)
