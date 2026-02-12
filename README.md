# Ayojon E-Commerce

A full-stack multi-vendor e-commerce platform for event products, targeting the South Asian market (primarily Bangladesh). Built with the [Better-T-Stack].

> *"The Daraz for events — buy everything you need for any occasion, from hundreds of vendors in one place."*

---

## Tech Stack

### Frontend
- **React 19** with **TanStack Router** (file-based routing, type-safe loaders)
- **TanStack Query** for server state management & caching
- **Vite** as build tool & dev server
- **Tailwind CSS v4** + **shadcn/ui** component library
- **Zustand** for client-side state (cart, filters, theme, currency)
- **Sentry** for error tracking
- **Recharts** for dashboard analytics charts

### Backend
- **Hono** HTTP framework on **Bun** runtime
- **oRPC** for type-safe RPC with auto-generated OpenAPI docs
- **better-auth** for authentication (email/password, Google OAuth, Facebook OAuth, Email OTP)
- **Drizzle ORM** with **PostgreSQL** (Supabase)
- **Nodemailer** for transactional emails
- **Scalar** for interactive API documentation
- **Amazon S3** for file/image storage (presigned uploads)

---

## Features

- **Multi-vendor marketplace** — Vendors register, get admin-approved, and manage their own storefronts
- **Product management** — Full CRUD with images (S3), variants, specifications, and categories
- **Shopping cart** — Hybrid client/server persistence with database sync on login
- **Checkout** — Multi-step flow with bKash (manual verification) and Cash on Delivery
- **Order state machine** — Dual-track order lifecycle (prepaid vs COD) with status transitions
- **Admin dashboard** — User/vendor/product/order management, payment verification, vendor payouts, homepage content management, platform settings
- **Vendor dashboard** — KPI analytics, revenue charts, order fulfillment, product management, store branding
- **Reviews & ratings** — Verified-purchase reviews with images, helpful votes, vendor scoring
- **Authentication** — Email/password + Google + Facebook OAuth, Email OTP verification, role-based access (customer/vendor/admin)
- **Dark/light theme** — System detection with user preference persistence
- **Multi-currency** — BDT, INR, PKR, USD support
- **Notifications** — 15 notification types with real-time bell indicator
- **Responsive** — Mobile-first design with dedicated mobile navigation

---

## Project Structure

```
ayojon/
├── apps/
│   ├── web/              # Customer, vendor & admin frontend (React + TanStack Router)
│   └── server/           # API server (Hono + oRPC on Bun)
├── packages/
│   ├── api/              # Routers, services, and business logic
│   ├── auth/             # Authentication configuration (better-auth)
│   ├── db/               # Database schema & migrations (Drizzle ORM)
│   ├── config/           # Shared ESLint & TypeScript config
│   ├── env/              # Environment variable validation (Zod)
│   └── storage/          # S3 storage utilities (presigned uploads)
├── scripts/              # Utility & maintenance scripts
├── supabase/             # Supabase config
└── docs/                 # PRD & guides
```

---

## Getting Started

### Prerequisites

- [Bun]( https://bun.sh/) v1.3+
- PostgreSQL database (or [Supabase](https://supabase.com/) project)
- S3-compatible storage bucket (AWS S3, Supabase Storage, etc.)
- Google & Facebook OAuth app credentials
- SMTP email service

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret key (min 32 chars) |
| `BETTER_AUTH_URL` | Auth base URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Facebook OAuth |
| `CORS_ORIGIN` | Allowed frontend origin |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | SMTP config |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_REGION` / `S3_ENDPOINT` / `S3_BUCKET` | S3 storage |
| `VITE_API_URL` | Backend URL for frontend |

### 3. Set up the database

```bash
bun run db:push
```

### 4. Run the development server

```bash
bun run dev
```

- **Web app:** [http://localhost:3001](http://localhost:3001)
- **API server:** [http://localhost:3000](http://localhost:3000)
- **API docs:** [http://localhost:3000/scalar](http://localhost:3000/scalar)

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all applications |
| `bun run dev:web` | Start only the web frontend |
| `bun run dev:server` | Start only the API server |
| `bun run check-types` | TypeScript type checking across all packages |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |
| `bun run db:push` | Push schema changes to database |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio (database GUI) |
| `bun run prepare` | Initialize Husky git hooks |

---

## Documentation

- [Product Requirements Document (PRD)](docs/Ayojon_PRD_FINAL.md)
- [Homepage Management Guide](HOMEPAGE_MANAGEMENT_GUIDE.md)
- [S3 Storage Guide](S3_STORAGE_GUIDE.md)
- [Integration Test Guide](INTEGRATION_TEST_GUIDE.md)
