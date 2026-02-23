# Elrond — History

## Core Context

- **Project:** Backpack Planner (TrailForge) — a webapp for outdoor adventurers with interactive maps, trip planning, gear management, and route tracking
- **Stack:** React + TypeScript + Vite frontend, Supabase backend, MapLibre GL JS for maps, Zustand for state, shadcn/ui components, Tailwind CSS
- **User:** Rob
- **Deployment target:** Azure (issue #7)
- **Current state:** App runs locally with Vite dev server. Supabase is cloud-hosted. No Azure infrastructure exists yet.

## Learnings

- **Azure Static Web Apps (Free tier)** is the right hosting choice for this pure SPA. No server-side code, so App Service would be overprovisioned. SWA gives free SSL, CDN, SPA routing, and native GitHub Actions deploy.
- **OIDC with User-Assigned Managed Identity** is the preferred GitHub Actions → Azure auth method. Federated credential scoped to `repo:*:ref:refs/heads/dev`. No secrets to rotate.
- **Google OAuth flows through Supabase Auth**, not directly to the frontend. Redirect URI in Google Console points to Supabase (`/auth/v1/callback`). Google secrets live only in Supabase Dashboard.
- **No Key Vault needed for MVP** — all frontend env vars are public client-side values, and Google OAuth secrets are stored in Supabase's managed config, not Azure.
- **SPA routing** requires `public/staticwebapp.config.json` with `navigationFallback` rewrite to `index.html`.
- **Env vars used in build:** Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both are public (anon key is safe by Supabase's RLS design).
- **Bicep structure:** `infra/main.bicep` at subscription scope → modules for RG, SWA, UAMI. Parameter file `main.bicepparam` for dev values.
- **Auth callback route:** App uses `/auth/callback` (handled by `AuthCallbackPage.tsx`). This path must be in Supabase redirect URLs config.
- **Supabase local config** is in `supabase/config.toml`. Google OAuth is disabled locally (`enabled = false`). Site URL is `http://localhost:5173`.
- **Entire MVP deployment can run at $0/month** using free tiers across Azure SWA, Supabase, GitHub Actions, and Google OAuth.
- **CORRECTION: Rob does NOT have Supabase cloud-hosted.** Previous assumption was wrong. Backend deployment strategy is an open question.
- **Supabase dependency is deep:** 35+ `supabase.from()` API calls, 8 GoTrue auth functions, 15+ RLS policies using `auth.uid()`, FK from `public.users` to `auth.users(id)`. Realtime and Storage are NOT used by app code.
- **Self-hosting Supabase on Azure** requires PostgreSQL Flexible Server + 3–4 Container Apps (Kong, GoTrue, PostgREST, optionally Studio). ~$20–32/mo. Zero code changes but high config complexity (20+ env vars).
- **Replacing Supabase with Azure-native services** would require rewriting 500–800 lines across 15–20 files — not viable for MVP. Azure AD B2C magic link support is particularly painful.
- **Recommended MVP path:** Supabase Cloud free tier (if Rob accepts) or self-hosted Supabase on Azure Container Apps (if Azure-only is required). Do NOT rewrite to Azure-native for a PoC.
- **Decision pending from Rob:** whether Supabase Cloud is acceptable, or if data must live on Azure.

