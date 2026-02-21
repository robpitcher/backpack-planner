# Scaffold Decisions — Pippin

## React 19 instead of React 18
- **Decision:** Kept React 19 (Vite's current default) instead of downgrading to React 18.
- **Rationale:** React 19 is the current stable release, backwards-compatible with React 18 patterns, and will avoid a future migration. All PRD features work identically on both versions.
- **Impact:** None — all React Router, Zustand, and shadcn/ui APIs are compatible.

## Tailwind CSS v4
- **Decision:** Using Tailwind CSS v4 with the Vite plugin (`@tailwindcss/vite`), not v3 with PostCSS.
- **Rationale:** v4 is the current stable release and simplifies config (no tailwind.config.js needed). shadcn/ui supports v4 natively.

## shadcn/ui new-york style
- **Decision:** Initialized shadcn/ui with the "new-york" style variant (its default).
- **Rationale:** Clean, modern aesthetic fits the TrailForge brand. Can be themed later via CSS variables.

## Path alias @/*
- **Decision:** Set up `@/*` → `./src/*` path alias across Vite, TypeScript, and shadcn configs.
- **Rationale:** Clean imports (`@/lib/supabase` vs `../../../lib/supabase`). Standard convention for Vite + shadcn projects.
