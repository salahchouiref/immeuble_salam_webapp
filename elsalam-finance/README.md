# 🏢 Elsalam Finance

**Gestion financière de l'immeuble Elsalam**
**التسيير المالي لعمارة السلام**

Bilingual (Français 🇫🇷 / العربية 🇲🇦) financial management web application for residential buildings.

---

## Features

- **Dashboard** — Real-time balance, payments, expenses, resident status
- **Payments** — Track monthly contributions from residents
- **Expenses** — Record building expenses by category
- **Residents** — Manage apartment residents
- **Categories** — Bilingual expense categories
- **Reports** — Monthly financial reports (print-ready)
- **History** — Complete financial transaction log
- **Settings** — Building info, monthly contribution amount
- **Guide** — Step-by-step usage guide
- **Audit Log** — Track all admin actions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Cloudflare Workers (Hono) |
| Database | Cloudflare D1 (SQLite) |
| Auth | JWT (Web Crypto API) |
| PWA | vite-plugin-pwa |

## Bilingual Support

- 🇫🇷 **French** — Full LTR layout
- 🇲🇦 **Arabic** — Full RTL layout
- Language switcher in header
- Language preference saved locally
- All labels, messages, navigation, and guides translated

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

### Local Development

```bash
# Install dependencies
cd frontend && npm install
cd ../worker && npm install

# Initialize local database
cd worker
npm run db:init
npm run db:seed

# Create admin user
curl -X POST http://localhost:8787/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elsalam.com","password":"admin123","name":"Admin"}'

# Start worker (terminal 1)
cd worker && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

### Default Accounts (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elsalam.com | admin123 |
| Habitant (shared, read-only) | habitant@elsalam.com | habitant |

Every habitant shares the same read-only account; all writes (payments, expenses) are reserved for the admin.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Cloudflare deployment guide.

## Project Structure

```
elsalam-finance/
├── frontend/          # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/     # All page components
│   │   ├── layouts/   # Sidebar, Header, Layout
│   │   ├── hooks/     # Custom React hooks
│   │   ├── services/  # API client, auth context
│   │   ├── types/     # TypeScript interfaces
│   │   ├── utils/     # Format, validators
│   │   └── i18n/      # Arabic + French translations
│   └── ...
├── worker/            # Cloudflare Worker (Hono API)
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/ # Auth middleware
│   │   ├── utils/     # JWT, crypto
│   │   └── types.ts
│   ├── migrations/    # D1 SQL migrations
│   └── wrangler.toml
└── tests/
```

## API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /api/auth/setup | - | - |
| POST | /api/auth/login | - | - |
| GET | /api/auth/me | ✅ | any |
| POST | /api/auth/change-password | ✅ | any |
| GET | /api/dashboard | ✅ | any |
| GET/POST | /api/residents | ✅ | admin for write |
| PUT/PATCH | /api/residents/:id | ✅ | admin |
| GET/POST | /api/payments | ✅ | admin for write |
| PUT/DELETE | /api/payments/:id | ✅ | admin |
| GET/POST | /api/expenses | ✅ | admin for write |
| PUT/DELETE | /api/expenses/:id | ✅ | admin |
| GET/POST | /api/categories | ✅ | admin for write |
| PUT/PATCH | /api/categories/:id | ✅ | admin |
| GET | /api/reports/monthly | ✅ | any |
| GET/PUT | /api/settings | ✅ | admin for write |
| GET | /api/history | ✅ | any |
| GET | /api/audit-logs | ✅ | admin |

## Security

- Password hashing (PBKDF2)
- JWT authentication
- Role-based authorization (admin / resident)
- Residents are read-only (enforced server-side)
- Audit logging for all admin actions
- No secrets in frontend code
- SQL parameterized queries

## License

Private - Immeuble Elsalam
