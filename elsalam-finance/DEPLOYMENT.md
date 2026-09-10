# 🚀 Deployment Guide — Elsalam Finance

**Elsalam Finance is a full-stack app**: a Cloudflare **Worker** (Hono + D1) that serves both the API **and** the built React frontend as static assets (Workers + Static Assets). One project, one domain, same-origin API.

## Architecture

```
https://elsalam-finance-worker.<your-subdomain>.workers.dev/
├── /api/*            → Hono API (auth, payments, expenses, reports, settings…)
├── /                 → built React SPA (assets served from ../frontend/dist)
└── /payments, …      → SPA fallback → index.html (client-side routing)
```

---

## Prerequisites

1. **Cloudflare Account** (free tier is enough)
2. **Node.js 18+** and **npm**
3. **Git** and a GitHub repo containing this project (already configured)

---

## Option A: Deploy via GitHub (auto-deploys on push) — RECOMMENDED

### A1. Create the D1 database

```bash
cd worker
npx wrangler login
npx wrangler d1 create elsalam-db
```

Copy the returned `database_id` into `worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "elsalam-db"
database_id = "REAL_DATABASE_ID"   # ← replace the placeholder
```

### A2. Add migrations remotely (one-time)

```bash
cd worker
npm run db:setup:remote
```

This runs `0001_init.sql`, `0003_security.sql`, and `0002_seed.sql` (categories) on the remote D1.

### A3. Connect GitHub in the Cloudflare dashboard

1. **Workers & Pages → Create → Worker → Deploy with GitHub**, select your repo `immeuble_salam_webapp`.
2. Build settings:
   - **Root directory**: `elsalam-finance/worker`
   - **Build command**: `npm run build`
3. Choose the **production** environment. Keep the worker name `elsalam-finance-worker`.

Each push to `main` will build the frontend and deploy the Worker + assets.

### A4. Set the JWT secret

1. Open the deployed Worker → **Settings → Variables and Secrets**.
2. Add a **Secret** `JWT_SECRET` with a long random string (e.g. `openssl rand -hex 32`).
   This overrides the placeholder in `wrangler.toml`.

### A5. Create the admin account (one-time)

```bash
curl -X POST https://elsalam-finance-worker.<your-subdomain>.workers.dev/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elsalam.com","password":"YOUR_SECURE_PASSWORD","name":"Admin"}'
```

The setup endpoint is idempotent: if the admin already exists it returns `200 "Comptes déjà configurés"` instead of overwriting data.

Shared read-only habitant account (automatically created at setup): `habitant@elsalam.com` / `habitant`.

---

## Option B: Deploy from CLI (no auto-deploy)

```bash
cd worker
npx wrangler login
npm run deploy        # builds the frontend, then deploys Worker + assets
```

For secrets: `npx wrangler secret put JWT_SECRET`.

---

## Local development

Two servers (as before):

```bash
cd elsalam-finance
npm run worker:dev     # API on http://localhost:8787
npm run dev            # Vite dev server on http://localhost:5173 (proxies /api)
```

To test the production single-port setup locally:

```bash
cd worker && npm run build && npx wrangler dev
# now http://localhost:8787 serves BOTH the frontend and the API
```

---

## Database migrations after changes

Add the new `.sql` file to `worker/migrations/`, then:

```bash
cd worker
npx wrangler d1 execute elsalam-db --remote --file=./migrations/XXXX_new_migration.sql
```

---

## Update flow

- Change code → `git push origin main` → Cloudflare re-deploys automatically.

---

## Troubleshooting

- **`400` main_module errors / blank page**: the frontend build wasn’t included — make sure the git build command is `npm run build` with root `elsalam-finance/worker` (its `build` script already builds `../frontend`).
- **Login fails / tokens rejected**: `JWT_SECRET` must be the same everywhere you deploy; set it as a secret in the Worker settings.
- **`D1_ERROR` / unknown database id**: verify `wrangler.toml` has the real `database_id` and the migrations ran remotely.
- **JSON `Not found` on `/`**: the ASSETS binding isn’t serving — confirm `[assets] directory = "../frontend/dist"` exists before `wrangler deploy` / build command.

---

## Costs

Within Cloudflare’s free tier for a small building: Workers 100k req/day, D1 5 GB storage / 10M reads/day, unlimited bandwidth.