# Faramir — History

## Project Context

- **Project:** TrailForge — a webapp for outdoor adventurers with interactive maps, trip planning, gear management, and route tracking
- **Stack:** React + TypeScript + Vite frontend, Supabase backend, MapLibre GL JS for maps, Zustand for state, shadcn/ui components, Tailwind CSS
- **User:** Rob
- **Repo:** robpitcher/trailforge (GitHub), local at /workspaces/backpack-planner

## Learnings

- **GPX import is a trust boundary**: `src/lib/gpx/import.ts` parses user-uploaded GPX files via DOMParser. All user-controllable text extracted from DOM nodes (names, descriptions) must be sanitized before entering the app data model. A `sanitizeText()` helper was added for this purpose (strips HTML tags, escapes `& < > " '`).
- **innerHTML usage in map markers**: `src/components/map/waypointUtils.ts` uses `innerHTML` to build SVG marker elements. Currently only hardcoded constants flow there, but this is a sensitive pattern — any future use of user data in that path would be a real XSS vector.
- **React JSX auto-escapes** text content in `WaypointList.tsx` and `WaypointEditDialog.tsx`, but defense-in-depth sanitization at the parse layer is the correct approach.
- **CodeQL rule `js/xss-through-dom`** (CWE-79) flags DOM text reinterpreted as HTML. Sanitizing extracted text at the parse boundary resolves this alert.
- **Key security files**: `src/lib/gpx/import.ts` (parse boundary), `src/components/map/waypointUtils.ts` (innerHTML usage), `src/lib/gpx/export.ts` (uses `a.href` for download URLs — currently safe, constructed from blob URLs).
