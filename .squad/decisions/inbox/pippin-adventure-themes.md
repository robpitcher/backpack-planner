## Issue #12: Adventure Theme Architecture

**Date:** 2025-07-25
**Author:** Pippin
**Issue:** #12
**PR:** #22

### Context
Rob requested 3 adventure-themed color schemes (Deep Forest, Dusk on the Ridge, Canopy) as additional theme dropdown options alongside Light/Dark/System.

### Decision
Adventure themes are implemented as dark-based themes. `applyTheme()` adds both the `dark` class and the theme-specific class (e.g., `deep-forest`) to `<html>`. This ensures all existing `dark:` Tailwind utilities continue to work, while theme-specific CSS variables override the default dark palette.

### Details
- Theme classes defined in `src/index.css` after `.dark` block, using same OKLCH CSS variable pattern
- `ADVENTURE_THEMES` const array in `src/lib/theme.tsx` for centralized management — add future themes here
- `applyTheme()` removes all theme classes before applying new one to prevent stale state
- Standard and adventure themes separated by `DropdownMenuSeparator` in ThemeToggle

### Impact
Future adventure themes should follow this pattern: add to `ADVENTURE_THEMES` array, add CSS class in `index.css`, add dropdown item in `ThemeToggle.tsx`.
