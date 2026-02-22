# TrailForge Infrastructure

Azure Static Web Apps (Free tier) with OIDC-based GitHub Actions deployment.

## Architecture

| Resource | Purpose | Cost |
|----------|---------|------|
| Resource Group (`rg-trailforge-dev`) | Container for all resources | $0 |
| Static Web App (`swa-trailforge-dev`) | Hosts the SPA | $0 (Free tier) |

Supabase is hosted externally (cloud free tier) — not managed by this IaC.

The CI/CD pipeline authenticates via a **user-assigned managed identity** with a federated credential for GitHub Actions OIDC. The identity is pre-provisioned and managed outside of this IaC — it already has Contributor at the subscription scope.

## Prerequisites

- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- An active Azure subscription
- Owner or Contributor role on the subscription
- A user-assigned managed identity with Contributor role and a federated identity credential configured for the GitHub repo/environment (created separately, not part of this Bicep)

## One-Time Setup

### 1. Login and set subscription

```bash
az login
az account set --subscription "<your-subscription-id>"
```

### 2. Deploy infrastructure

```bash
cd infra
az deployment sub create \
  --location eastus2 \
  --template-file main.bicep \
  --parameters main.bicepparam
```

The deployment outputs will show:
- `staticWebAppName` — use this as `SWA_NAME` in GitHub

### 3. Configure GitHub environment

In your repo → Settings → Environments → `dev`, set these variables/secrets:

| Name | Type | Source |
|------|------|--------|
| `AZURE_CLIENT_ID` | Secret | Client ID of your pre-existing managed identity |
| `AZURE_TENANT_ID` | Secret | Your Azure AD tenant ID (`az account show --query tenantId`) |
| `AZURE_SUBSCRIPTION_ID` | Secret | Your Azure subscription ID |
| `SWA_NAME` | Variable | `staticWebAppName` output from step 2 |
| `VITE_SUPABASE_URL` | Secret | Supabase project → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Secret | Supabase project → Settings → API → anon/public key |

### 4. Run Supabase migrations

In the Supabase dashboard SQL editor, run the migration files from `supabase/migrations/` in order.

### 5. Push to `dev` branch

The GitHub Actions workflow will automatically build and deploy.

## Custom Domain

After deployment, you can add a custom domain in the Azure Portal:
1. Go to your Static Web App → Custom domains
2. Add your domain and follow the DNS validation steps
