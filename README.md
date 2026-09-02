# OSINET — OSINT Investigation & Intelligence Network

> **Version:** 0.1.0 (Foundation — Sprint 1–2)  
> **Status:** Active Development · Foundation Stage  
> **Access:** Restricted — Authorized Investigators Only

---

## Overview

OSINET is a secure, case-centric OSINT investigation platform for authorized digital investigations. It enables investigators to create and manage investigation cases, intake and normalize investigation targets, maintain audit trails, and prepare for future OSINT intelligence enrichment through compliant provider integrations.

### Core Investigation Workflow

```
Collect → Normalize → Correlate → Verify → Evidence → Report
```

---

## Architecture

```
Browser
   ↓
React.js (Vite) — Port 5173
   ↓
Node.js / Express API — Port 5000
   ↓
Authentication Middleware (Supabase JWT verification)
   ↓
RBAC Middleware (Server-side role enforcement)
   ↓
Case / Target Services (Business logic + normalization)
   ↓
Supabase Client
   ↓
PostgreSQL (Supabase) + Row Level Security
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Styling | Vanilla CSS with design tokens |
| Backend | Node.js 22, TypeScript, Express 4 |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Authentication (JWT) |
| Validation | Zod (backend), custom forms (frontend) |
| Phone normalization | libphonenumber-js |
| Logging | Winston with credential masking |
| Testing | Vitest |

---

## Project Structure

```
osinet/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/        # Login, AuthContext
│   │   │   ├── cases/       # Case list, detail, create
│   │   │   ├── dashboard/   # Dashboard with real stats
│   │   │   └── targets/     # Add target modal
│   │   ├── layouts/         # AppLayout (sidebar + header)
│   │   ├── pages/           # NotFound, ComingSoon
│   │   ├── routes/          # ProtectedRoute guard
│   │   ├── services/        # api.ts (Axios client)
│   │   ├── lib/             # Supabase client
│   │   └── types/           # Shared TypeScript types
│   ├── .env                 # ← Never commit
│   └── .env.example
│
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/          # env.ts, supabase.ts
│   │   ├── controllers/     # health, case, target
│   │   ├── middleware/       # auth, rbac, errorHandler
│   │   ├── repositories/    # caseRepo, targetRepo, auditRepo
│   │   ├── routes/v1/       # health, cases (+ targets)
│   │   ├── services/        # caseService, targetService, normalization
│   │   │   └── providers/   # ProviderInterface, MockDevProvider
│   │   ├── types/           # Shared TS types
│   │   ├── utils/           # logger, response helpers
│   │   └── validators/      # Zod schemas
│   ├── .env                 # ← Never commit
│   └── .env.example
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Tables + triggers
│   │   └── 002_rls_policies.sql     # Row Level Security
│   └── seed/
│       └── dev_seed.sql             # Dev instructions only
│
└── README.md
```

---

## Environment Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Access to the OSINET Supabase project

### 1. Clone and install

```bash
git clone <repo-url>
cd osinet

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Fill in your Supabase URL and anon key
# Add SUPABASE_SERVICE_ROLE_KEY when available
```

**Frontend** (`frontend/.env`):
```bash
cp frontend/.env.example frontend/.env
# Fill in your Supabase URL and publishable key
```

> **Security:** Never commit `.env` files. See `.gitignore`.

---

## Supabase Configuration

**Project URL:** `https://pbbsbbjfuokgvovsbzra.supabase.co`

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | backend | Supabase project URL |
| `SUPABASE_ANON_KEY` | backend | Anon key (respects RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Privileged ops (add when available) |
| `VITE_SUPABASE_URL` | frontend | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend | Public client key |

---

## Database Migration Instructions

Migrations are in `supabase/migrations/`. Apply them via the Supabase SQL Editor or Supabase CLI.

### Via Supabase Dashboard SQL Editor

1. Open your Supabase project → **SQL Editor**
2. Open and run `supabase/migrations/001_initial_schema.sql`
3. Verify tables were created (check Table Editor)
4. Open and run `supabase/migrations/002_rls_policies.sql`
5. Verify RLS is enabled (check Auth → Policies)

### Via Supabase CLI (if installed)

```bash
npx supabase db push --db-url "postgresql://postgres:<password>@db.pbbsbbjfuokgvovsbzra.supabase.co:5432/postgres"
```

### Post-Migration: Create Admin User

1. Create a user via Supabase Auth → Users → Add user
2. Promote to admin:
```sql
UPDATE public.profiles 
SET role = 'SYSTEM_ADMIN' 
WHERE email = 'your-admin@example.com';
```

---

## Development Commands

```bash
# Backend
cd backend
npm run dev          # Start with hot-reload (tsx watch)
npm run build        # Compile TypeScript
npm run typecheck    # Type-check without emitting
npm run lint         # ESLint
npm test             # Run Vitest tests

# Frontend
cd frontend
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build
npm run typecheck    # Type-check
npm run lint         # ESLint
npm test             # Run Vitest tests
```

---

## Running the Application

### 1. Start the backend

```bash
cd backend
npm run dev
# → OSINET API on http://localhost:5000
# → Health: http://localhost:5000/api/v1/health
```

### 2. Start the frontend

```bash
cd frontend
npm run dev
# → Application on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:5000`.

---

## API Endpoints (v1)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/health` | None | Health + Supabase status |
| GET | `/api/v1/cases` | ✓ | List cases (with filters) |
| POST | `/api/v1/cases` | ✓ INVESTIGATOR+ | Create case |
| GET | `/api/v1/cases/stats/dashboard` | ✓ | Dashboard statistics |
| GET | `/api/v1/cases/:id` | ✓ | Get case details |
| PATCH | `/api/v1/cases/:id` | ✓ INVESTIGATOR+ | Update case |
| GET | `/api/v1/cases/:id/targets` | ✓ | List case targets |
| POST | `/api/v1/cases/:id/targets` | ✓ INVESTIGATOR+ | Add target |

### API Response Format

```json
// Success
{ "success": true, "data": { ... }, "meta": { "total": 5, "page": 1 } }

// Error
{ "success": false, "error": { "code": "CASE_NOT_FOUND", "message": "..." } }
```

---

## Authentication Setup

OSINET uses Supabase Authentication.

1. Enable **Email/Password** auth in Supabase → Authentication → Providers
2. Create user accounts via Supabase Auth → Users
3. Assign OSINET roles via SQL:
   ```sql
   UPDATE profiles SET role = 'INVESTIGATOR' WHERE email = 'user@example.com';
   ```
4. The backend verifies Supabase JWTs on every request — authorization is server-side authoritative.

### OSINET Roles

| Role | Level | Capabilities |
|------|-------|-------------|
| `SYSTEM_ADMIN` | 100 | Full platform access |
| `CASE_ADMIN` | 80 | Manage all cases, assign members |
| `SUPERVISOR` | 60 | Read/write all cases in scope |
| `INVESTIGATOR` | 40 | Create/manage own cases and targets |
| `AUDITOR` | 20 | Read-only across authorized cases |

---

## Implemented Features (Foundation)

- [x] Supabase Authentication (login, logout, session persistence)
- [x] RBAC with 5 roles (server-side enforcement)
- [x] Protected routes (frontend + backend)
- [x] PostgreSQL schema with 5 tables and RLS policies
- [x] Auto-updated `updated_at` triggers
- [x] Auto-created user profile on signup
- [x] Case CRUD (create, list, view, update, close, archive)
- [x] Target intake with normalization (EMAIL, DOMAIN, IP, URL, USERNAME, PHONE, PERSON, COMPANY)
- [x] In-case duplicate target detection
- [x] Audit logging (CASE_CREATED, CASE_UPDATED, TARGET_CREATED, etc.)
- [x] Provider abstraction layer (BaseProvider, ProviderRegistry)
- [x] Mock development provider (clearly labelled, dev-only)
- [x] Dashboard with real statistics from Supabase
- [x] Professional dark-theme UI (sidebar, header, cards, tables, badges)
- [x] REST API with versioning, validation, centralized error handling
- [x] Credential masking in logs
- [x] Rate limiting, Helmet security headers, CORS
- [x] Backend tests (normalization, validators, providers, RBAC)
- [x] Frontend tests (form validation, type definitions, RBAC logic)

---

## Not Yet Implemented (Planned Phases)

| Feature | Phase |
|---------|-------|
| Shodan integration | Phase 3 |
| Censys integration | Phase 3 |
| IPinfo integration | Phase 3 |
| Hunter.io integration | Phase 3 |
| SerpApi integration | Phase 3 |
| HIBP breach lookup | Phase 3 |
| WhoisXML API | Phase 3 |
| Entity resolution / correlation | Phase 2 |
| Investigation graph (visual) | Phase 2 |
| Evidence management | Phase 2 |
| Timeline view | Phase 2 |
| Findings module | Phase 3 |
| Report generation / PDF | Phase 3 |
| Case member management UI | Phase 2 |
| Provider quota tracking | Phase 3 |
| Scheduled monitoring | Phase 4 |

---

## Security Notes

- All credentials live in `.env` files — never in source code
- `.env` files are in `.gitignore` — never committed
- Supabase service-role key is optional at startup — documented in `.env.example`
- Backend enforces authentication and RBAC on every request
- Frontend route guards are UX conveniences only — not security boundaries
- Supabase RLS enforces case isolation at the database level
- Logs mask JWT tokens, API keys, and credential patterns
- No secrets are ever sent to the frontend
- Provider API keys are placeholder env vars — no fake values

---

## Next Development Phase

### Phase 2 (Sprint 3–4)
1. Case member management (invite, remove, role assignment)
2. Full audit log UI with filtering
3. Entity model (Person, Email, Domain, IP as first-class entities)
4. Entity correlation engine foundation
5. Investigation job queue (basic orchestration)
6. Timeline UI
7. Evidence attachment (files, hashes, provenance)

### Phase 3 (Sprint 5–8)
1. First real provider: IPinfo (low cost, good for foundation)
2. Provider quota and cost tracking
3. Shodan and Censys adapters
4. HIBP breach lookup
5. Findings module
6. Report generation (Markdown → PDF)
