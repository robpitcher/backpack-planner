# Decision: Use theme-aware CSS classes everywhere — never hardcode bg-white/text-gray-*

**Author:** Pippin  
**Date:** 2026-02-22  
**Context:** Theme persistence bug — dark mode didn't visually persist when navigating from Dashboard to TripPlannerPage because components used hardcoded light-mode colors.

## Decision

All components MUST use theme-aware CSS variable classes instead of hardcoded color classes:

| ❌ Don't use | ✅ Use instead |
|---|---|
| `bg-white` | `bg-background` or `bg-card` |
| `bg-gray-50` | `bg-muted` |
| `bg-gray-100` | `bg-muted` |
| `text-gray-900` | `text-foreground` |
| `text-gray-700` / `text-gray-800` | `text-foreground` |
| `text-gray-500` / `text-gray-600` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground` |
| `bg-gray-200` (dividers) | `bg-border` |
| `hover:bg-gray-50` | `hover:bg-accent` |
| `hover:bg-gray-100` | `hover:bg-accent` |

**Exception:** Map overlay controls (DrawControls, MapStyleToggle, RouteStats) may keep `bg-white` since they float over the Mapbox map which doesn't change with theme.

## Rationale

The `.dark` block in `index.css` overrides CSS custom properties (`--background`, `--foreground`, etc.) but hardcoded Tailwind colors like `bg-white` bypass this system entirely, making components always appear light regardless of theme.

## Also fixed

`src/components/ui/sonner.tsx` was importing `useTheme` from `next-themes` (unused package) instead of our custom `@/lib/theme`. Fixed to use our provider so toasts match the active theme.
