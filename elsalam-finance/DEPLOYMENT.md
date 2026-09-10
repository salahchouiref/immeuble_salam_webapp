# 🚀 Deployment Guide — Elsalam Finance

## Prerequisites

1. **Cloudflare Account** (free tier is sufficient)
2. **Node.js 18+** installed
3. **npm** installed

---

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

## Step 3: Create D1 Database

```bash
cd worker

# Create the database
wrangler d1 create elsalam-db
```

This will output something like:
```
✅ Successfully created DB 'elsalam-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "elsalam-db"
database_id = "YOUR_ACTUAL_DATABASE_ID"
```

## Step 4: Apply Migrations

```bash
# Local database (for testing)
npm run db:init
npm run db:seed

# Remote/production database
npm run db:init:remote

# Seed production (after running setup)
# Do NOT seed production with demo data
```

## Step 5: Deploy Worker (Backend)

```bash
cd worker

# Set JWT secret
wrangler secret put JWT_SECRET
# Enter a strong random string when prompted

# Deploy
npm run deploy
```

The worker will be available at:
```
https://elsalam-finance-worker.YOUR_SUBDOMAIN.workers.dev
```

## Step 6: Build & Deploy Frontend

### Option A: Cloudflare Pages

```bash
cd frontend

# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=elsalam-finance
```

Frontend will be available at:
```
https://elsalam-finance.pages.dev
```

### Option B: Custom Domain

After deploying to Cloudflare Pages:
1. Go to Cloudflare Dashboard → Pages
2. Select your project
3. Go to Custom Domains
4. Add your domain

## Step 7: Configure API URL

Update the frontend to point to your worker URL.

In `frontend/src/services/api.ts`, the API_BASE is set to `/api`.

For production with separate domains, update to your worker URL:

```typescript
const API_BASE = 'https://elsalam-finance-worker.YOUR_SUBDOMAIN.workers.dev/api';
```

Or configure Cloudflare Pages to proxy `/api` to your worker.

## Step 8: Create Initial Admin

After deployment, create the admin user:

```bash
curl -X POST https://YOUR_WORKER_URL/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elsalam.com","password":"YOUR_SECURE_PASSWORD","name":"Admin"}'
```

**IMPORTANT**: The setup endpoint only works once. After creating the admin, it will return an error if called again.

## Step 9: Test

1. Open your frontend URL
2. Login with admin credentials
3. Verify dashboard loads
4. Test adding a payment
5. Test adding an expense
6. Test resident access (read-only)
7. Test language switching (French ↔ Arabic)
8. Test on mobile

---

## Production Checklist

- [ ] D1 database created and migrated
- [ ] JWT_SECRET set via `wrangler secret`
- [ ] Worker deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Admin user created via /api/auth/setup
- [ ] HTTPS working on both frontend and worker
- [ ] Language switching works (FR ↔ AR)
- [ ] RTL layout works correctly
- [ ] Mobile responsive design works
- [ ] Admin can add/edit/delete payments
- [ ] Admin can add/edit/delete expenses
- [ ] Residents are read-only
- [ ] Dashboard calculations are correct
- [ ] Monthly reports generate correctly

---

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure the worker has the correct CORS configuration. Check `worker/src/index.ts` for the CORS middleware.

### D1 Binding Errors

Make sure `wrangler.toml` has the correct database_id and the binding name matches `DB`.

### Authentication Issues

If login fails after deployment:
1. Check that users were created via /api/auth/setup
2. Verify JWT_SECRET is set
3. Check worker logs: `wrangler tail`

### RTL Issues

If RTL layout is not working:
1. Ensure `document.documentElement.dir` is being set
2. Check that Tailwind classes are using logical properties where needed
3. Test with the language switcher

---

## Updating

### Frontend

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=elsalam-finance
```

### Worker

```bash
cd worker
npm run deploy
```

### Database Migrations

```bash
cd worker
# Create new migration file in migrations/
wrangler d1 execute elsalam-db --remote --file=./migrations/XXXX_new_migration.sql
```

---

## Costs

This application is designed to run on **Cloudflare's free tier**:

| Service | Free Tier Limit |
|---------|----------------|
| Cloudflare Pages | Unlimited bandwidth |
| Cloudflare Workers | 100,000 requests/day |
| Cloudflare D1 | 5 GB storage, 10M reads/day |

For a building with 9 residents, this will always stay within free limits.
