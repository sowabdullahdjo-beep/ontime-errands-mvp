# OnTime Errands MVP

This repo contains a simple full-stack MVP for OnTime Errands, a Canada-wide pickup and delivery platform focused on moving items customers already own or have paid for.

## Stack overview
- **Backend:** Node.js + TypeScript, Express, Prisma ORM with SQLite, JWT auth
- **Frontend:** React + TypeScript (Vite) with lightweight custom styling
- **Payments:** Stubbed Stripe-style checkout endpoint that marks jobs as paid

## Backend structure (`/server`)
- `src/index.ts` – Express app wiring routes and middleware
- `src/routes/` – feature routes: `auth`, `jobs`, `runner`, `payments`, `admin`
- `src/middleware/auth.ts` – JWT auth + role guards
- `src/prisma.ts` – Prisma client
- `prisma/schema.prisma` – relational schema for `User`, `Job`, and `Payment`
- Scripts in `package.json` for dev server and Prisma workflows

### API highlights
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Customer:** `POST /api/jobs`, `GET /api/jobs/mine`, `GET /api/jobs/:id`, `POST /api/jobs/:id/cancel`
- **Runner:** `GET /api/runner/jobs/open`, `POST /api/runner/jobs/:id/accept`, `POST /api/runner/jobs/:id/status`, `GET /api/runner/jobs/mine`, `GET /api/runner/earnings`
- **Payments:** `POST /api/jobs/:id/pay` (marks job as paid and creates a Payment record)
- **Admin (basic):** `GET /api/admin/jobs`, `GET /api/admin/users`, `POST /api/admin/users/:id/runner-approve`

Validation rules enforce required fields, paid-only acceptance, and linear status transitions (OPEN → ASSIGNED → IN_PICKUP → IN_TRANSIT → DELIVERED/FAILED).

## Frontend structure (`/client`)
- `src/App.tsx` – lightweight view switcher for auth, customer dashboard, and runner dashboard
- `src/pages/` – `Landing`, `AuthPage`, `Dashboard`, `RunnerDashboard`
- `src/components/` – `JobForm` (multi-step style form) and `JobList`
- `src/helpers/api.ts` – minimal fetch wrapper honoring `VITE_API_URL`
- `src/index.css` – simple responsive styles (mobile-friendly layout)

Flows implemented:
- Landing CTA to log in or sign up
- Auth pages (register/login)
- Customer dashboard: create errand (scheduled or urgent), auto-pay stub call, list of customer jobs
- Runner dashboard: view open paid jobs, accept, update status (IN_PICKUP → IN_TRANSIT → DELIVERED/FAILED), earnings summary

## Environment
Copy `.env.example` to `.env` and adjust as needed.

```bash
# Backend
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key"
PORT=4000

# Frontend
VITE_API_URL="http://localhost:4000"
```

## Setup and scripts
### Backend
```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate   # creates SQLite schema
npm run dev              # start API on http://localhost:4000
```

### Frontend
```bash
cd client
npm install
npm run dev   # start Vite dev server on http://localhost:5173
```

## Testing the flows
1. Register a user via the frontend or `POST /api/auth/register`.
2. Create a job from the dashboard. The client calls `POST /api/jobs` then `POST /api/jobs/:id/pay` to mark it paid.
3. Toggle runner access (set `isRunner` true via admin endpoint) or seed directly in the database, then log in and open the Runner tab to accept the paid job and move it through statuses.
4. Earnings tab sums delivered job payouts.

## Notes
- Jobs cannot be accepted until `customerPaid=true`.
- Urgent jobs are always ASAP (no scheduled time field).
- The payment route stubs Stripe and can be swapped with a real checkout in one place.
