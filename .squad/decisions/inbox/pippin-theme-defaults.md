# Decision: Theme Toggle Icon & Default Theme

**Author:** Pippin (Frontend Dev)
**Date:** 2025-07-15
**Branch:** squad/12-adventure-themes

## Changes

### 1. Theme toggle icon → Palette
Replaced the animated Sun/Moon icon swap with a single static `Palette` icon from lucide-react. The Sun/Moon rotation animation was tied to the `dark:` CSS variant, which doesn't map cleanly to the six-theme system (light, dark, system, deep-forest, dusk-ridge, canopy). A Palette icon is theme-neutral and communicates "change appearance" without implying a light/dark binary.

### 2. Default theme → Deep Forest
Changed the fallback theme from `'dark'` to `'deep-forest'` for new users (no localStorage value). This gives first-time visitors an immediate feel for the adventure-themed UI. Users who already have a theme saved in localStorage are unaffected.

## Rationale
- The Sun/Moon toggle was a holdover from a two-theme system. With six themes, a generic icon is more appropriate.
- Deep Forest as the default showcases the new theme work and differentiates the app's visual identity.
