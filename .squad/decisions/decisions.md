# Backpack Planner — Decisions Log

**Last Updated:** 2026-02-22T20:24Z

---

## Deployment & Infrastructure

### Azure Deployment Architecture — Plan Review
**Date:** 2025-07-24  
**Author:** Elrond  
**Issues:** #7, #10  
**Status:** Plan approved, awaiting Rob's manual setup

TrailForge deploys to Azure as a pure React SPA (Vite → dist/) with cloud-hosted Supabase backend.

#### 1. Azure Static Web Apps (Free tier) for frontend hosting
**Decision:** Use SWA over App Service or Blob+CDN  
**Rationale:** SPA purpose-built platform, $0/month, includes SSL, CDN, SPA routing fallback, custom domains, native GitHub Actions integration, PR previews out of the box.

#### 2. GitHub Actions OIDC via User-Assigned Managed Identity
**Decision:** Use OIDC (no long-lived secrets) over service principal with client secret or PAT tokens  
**Rationale:** No secret rotation needed, user-assigned identity is reusable, federated credential scoped to `repo:<org>/<repo>:ref:refs/heads/dev` (least privilege), industry best practice.

#### 3. Bicep IaC at subscription scope
**Decision:** Subscription-scoped main.bicep creating resource group, with modules for resource-level deployments  
**Rationale:** Rob's directive, Bicep is Azure-native simpler than ARM JSON, no state file management like Terraform.

#### 4. No Key Vault for MVP
**Decision:** Skip Key Vault during MVP phase  
**Rationale:** All frontend env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are public client-side values. Google OAuth secrets live in Supabase's managed auth config, not Azure. No server-side code or Azure Functions. Key Vault adds cost/complexity with zero current value. Revisit when/if Azure-hosted backend services are added.

#### 5. Google OAuth flows through Supabase Auth (not direct)
**Decision:** Supabase Auth acts as OIDC/OAuth intermediary  
**Rationale:** Google redirect URI points to Supabase (`https://<ref>.supabase.co/auth/v1/callback`), not frontend. Frontend only needs `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Google Client ID + Secret configured exclusively in Supabase Dashboard.

#### 6. SPA routing via staticwebapp.config.json
**Decision:** Use `navigationFallback` to rewrite unknown paths to index.html  
**Rationale:** React Router uses client-side routing; direct URL access to `/dashboard` etc. would 404 without fallback. File placed in `public/` so Vite copies to `dist/` during build.

**Impact:** Pippin/Gimli need only add `public/staticwebapp.config.json`. Rob: Manual one-time Azure setup (login, Bicep deploy, GitHub vars, Supabase config, Google OAuth config). Strider: No architecture changes.

---

## Authentication & Backend

### Supabase Auth Audit — Current State & Google OAuth Integration
**Date:** 2025  
**Author:** Gimli  
**Purpose:** Document current authentication setup and requirements for Google OAuth integration

#### Current Auth State
✅ **Working:**
- Email + Password sign-up/sign-in
- Magic Link authentication
- Google OAuth placeholder frontend code exists (`signInWithGoogle()`)
- Auth state management via Zustand, session sync across app
- Callback routing configured at `/auth/callback`
- User profiles in `public.users` table (display_name, avatar_url, skill_level, preferred_units)

❌ **Missing:**
- Google OAuth not configured in Supabase project yet (frontend ready, Supabase doesn't know about Google app credentials)

#### Environment Variables & Configuration

**Development (Local Supabase):**
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Production (Cloud Supabase):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both use **anonymous key** (proper for client-side auth, not service role key). Supabase client initialized in `src/lib/supabase.ts`.

#### Supabase Configuration Files

**`supabase/config.toml` — Local Dev Config:**
```toml
[auth]
enabled = true
site_url = "http://localhost:5173"
additional_redirect_urls = ["http://localhost:5173/auth/callback"]

[auth.email]
enable_signup = true
double_confirm_changes = false
enable_confirmations = false

[auth.external.google]
enabled = false          # Currently disabled (local dev)
client_id = ""
secret = ""
redirect_uri = ""
```

Production config is managed directly in Supabase dashboard.

#### Authentication API & Implementation

**Core auth functions in `src/lib/auth.ts`:**
| Function | Method | Purpose |
|----------|--------|---------|
| `signUp(email, password)` | `supabase.auth.signUp()` | Create new account |
| `signIn(email, password)` | `supabase.auth.signInWithPassword()` | Email/password login |
| `signInWithMagicLink(email)` | `supabase.auth.signInWithOtp()` | Magic link login |
| `signInWithGoogle()` | `supabase.auth.signInWithOAuth({ provider: 'google' })` | Google OAuth |
| `signOut()` | `supabase.auth.signOut()` | Logout |
| `getSession()` | `supabase.auth.getSession()` | Retrieve current session |
| `getUserProfile()` | Queries `public.users` table | Fetch user metadata |
| `onAuthStateChange(callback)` | Subscribes to auth changes | Real-time auth state |

**Redirect URL (Dynamic):**
```javascript
redirectTo: `${window.location.origin}/auth/callback`
```
Works on any domain (localhost, Azure, etc.).

#### Database Schema & RLS

**User Table (`public.users`):**
```sql
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  skill_level TEXT,
  preferred_units unit_preference NOT NULL DEFAULT 'imperial',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

When Supabase Auth creates a user (email, magic link, or Google OAuth), a row is automatically created in `public.users` via trigger.

**Row Level Security (RLS):**
All tables use `auth.uid()` context. Example policy:
```sql
CREATE POLICY "Users can view their own trips" 
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);
```
Users can only access their own data.

#### What's Needed for Google OAuth Integration

**Redirect URI for Google Cloud Console:**
```
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```
Example: `https://abc123def456.supabase.co/auth/v1/callback`

**Dev/Test Redirect URI (optional):**
```
http://localhost:5173/auth/callback
```

**Steps to Enable in Supabase Dashboard:**
1. Go to **Authentication > Providers**
2. Enable **Google**
3. Enter Client ID and Client Secret (from Google Cloud Console)
4. Supabase auto-configures redirect URI
5. Save

**Frontend code is already ready** — no changes to `src/lib/auth.ts`.

#### Azure Deployment Notes
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Azure configuration
- Callback flow will use your Azure domain (dynamic via `window.location.origin`)
- CORS: Supabase generally lenient with OAuth callbacks

#### Summary
| Aspect | Status | Notes |
|--------|--------|-------|
| Email/Password Auth | ✅ Working | Fully implemented |
| Magic Link Auth | ✅ Working | Fully implemented |
| Google OAuth Frontend | ✅ Ready | Code exists, waiting for Supabase config |
| Google OAuth Backend | ❌ Not Configured | Needs Google credentials in Supabase dashboard |
| Session Management | ✅ Working | Zustand + Supabase auth state sync |
| RLS Policies | ✅ Implemented | All user data scoped to auth.uid() |
| Env Vars | ✅ Ready | Already defined for dev & prod |
| Callback Routing | ✅ Ready | Dynamic, works on any domain |
| User Profiles | ✅ Ready | Extended user data in public.users |

**Action Items for Rob:**
1. Get Google OAuth credentials (Client ID, Client Secret) from Google Cloud Console
2. Add redirect URI to Google Console: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
3. Enable Google in Supabase Dashboard (Authentication > Providers)
4. Enter Client ID and Client Secret
5. Test OAuth flow
6. Deploy to Azure with env vars set

---

## Frontend & UI

### Issue #12: Adventure Theme Architecture
**Date:** 2025-07-25  
**Author:** Pippin  
**Issue:** #12  
**PR:** #22  
**Status:** Implemented

Rob requested 3 adventure-themed color schemes (Deep Forest, Dusk on the Ridge, Canopy) as additional theme dropdown options alongside Light/Dark/System.

**Decision:** Adventure themes are dark-based. `applyTheme()` adds both `dark` class and theme-specific class (e.g., `deep-forest`) to `<html>`. Existing `dark:` Tailwind utilities continue to work; theme-specific CSS variables override default dark palette.

**Implementation:**
- Theme classes in `src/index.css` after `.dark` block, using same OKLCH CSS variable pattern
- `ADVENTURE_THEMES` const array in `src/lib/theme.tsx` for centralized management
- `applyTheme()` removes all theme classes before applying new one (prevents stale state)
- Standard and adventure themes separated by `DropdownMenuSeparator` in ThemeToggle

**Future Pattern:** Add to `ADVENTURE_THEMES` array → add CSS class in `index.css` → add dropdown item in `ThemeToggle.tsx`.

### Breadcrumb Revision: Simplified Depth & Reset Behavior
**Date:** 2025-07-25  
**Author:** Pippin  
**PR:** #17 (revision)  
**Spec:** specs/breadcrumb.md

Rob's spec requested simplifying breadcrumb to max depth of "Trip Planner" and adding map reset on breadcrumb click.

**Decisions:**
- Max breadcrumb depth: `TrailForge → Trip Planner`. No trip name or waypoint segments (trip name in sidebar).
- Extracted `resetMapView` in TripPlannerPage: deselects waypoint + fitBounds all waypoints/route. Used by breadcrumb "Trip Planner" click, waypoint toggle-off, sidebar blank-area click.
- Breadcrumb component supports clickable last items (onClick/href) while preserving `aria-current="page"`.
- Dashboard back arrow removed; TrailForge breadcrumb replaces its function.
- WaypointList gets `onDeselect` prop with blank-area spacer div for deselection.

**Rationale:** Keeps breadcrumb minimal (trip name in sidebar), avoids duplicating fitBounds logic.

### Profile Modal Instead of Profile Page
**Date:** 2025-07-18  
**Author:** Pippin

Rob requested profile editing open as modal overlay (blurred background) instead of separate /profile page. Keeps users in context — no page reload, no navigation away.

**Decisions:**
- Created `src/components/ProfileModal.tsx` using shadcn Dialog component
- All profile link touchpoints (DashboardPage, TripPlannerPage, AppHeader) open modal instead of navigating
- Added `backdrop-blur-sm` to `DialogOverlay` in `src/components/ui/dialog.tsx` for app-wide modal blur effect
- `/profile` route and `ProfilePage.tsx` remain for backwards compatibility (not primary UX)

**Rationale:** Modal keeps user in place — no context switch, no reload. Global blur on DialogOverlay is consistent UX improvement for all dialogs.

**Files Changed:**
- `src/components/ProfileModal.tsx` (new)
- `src/components/ui/dialog.tsx` (added backdrop-blur-sm)
- `src/pages/DashboardPage.tsx` (modal instead of Link)
- `src/pages/TripPlannerPage.tsx` (modal instead of Link)
- `src/components/AppHeader.tsx` (modal instead of Link)

### Theme Toggle Icon & Default Theme
**Date:** 2025-07-15  
**Author:** Pippin  
**Branch:** squad/12-adventure-themes

**Changes:**

#### 1. Theme toggle icon → Palette
Replaced animated Sun/Moon icon swap with static `Palette` icon from lucide-react. Sun/Moon rotation was tied to `dark:` CSS variant, which doesn't map cleanly to six-theme system (light, dark, system, deep-forest, dusk-ridge, canopy). Palette icon is theme-neutral and communicates "change appearance" without implying light/dark binary.

#### 2. Default theme → Deep Forest
Changed fallback theme from `'dark'` to `'deep-forest'` for new users (no localStorage value). Gives first-time visitors immediate feel for adventure-themed UI. Users with existing localStorage theme unaffected.

**Rationale:**
- Sun/Moon toggle was holdover from two-theme system. With six themes, generic icon more appropriate.
- Deep Forest default showcases new theme work and differentiates app's visual identity.

---

## User Directives

### 2026-02-22T20:23Z: User directives — Azure deployment preferences
**By:** Rob (via Copilot)

**What:**
- Bicep IaC files go in `infra/` folder
- Main Bicep targets subscription scope (creates resource group), then calls modules for resource-group-level deployments
- MVP/PoC deployment — no HA, redundancy, or premium performance tiers
- CI/CD pipeline deploys dev branch to Azure
- GitHub Actions auth uses OIDC with user-assigned managed identity

**Why:** User request — captured for team memory
