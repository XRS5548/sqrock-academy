# Sqrock Academy

Course platform for **Sqrock Academy** — industry-focused courses, exam-verified certificates and a daily jobs board.

Built with [vinext](https://github.com/cloudflare/vinext) (Next.js-style App Router on Vite + Cloudflare Workers), React 19, Tailwind CSS v4, shadcn `base-mira` components, Drizzle ORM (PostgreSQL) and Better Auth.

## What's included

### Public site
- `/` — landing page with courses, certificate showcase, jobs, mobile app launch and FAQ
- `/courses` — searchable/filterable catalogue (category, level, free)
- `/courses/[slug]` — course detail with curriculum, preview lessons, instructor, exam info and enrolment
- `/jobs` — verified jobs & internships with filters and search
- `/jobs/[id]` — job detail with direct apply
- `/jobs/post` — free job submission (goes to admin approval)
- `/certificates` and `/certificates/[id]` — public certificate verification with print / save-as-PDF
- `/login`, `/signup`, `/contact`

### Student dashboard (`/dashboard`)
- Overview with progress, stats and recommended courses
- My courses with progress bars
- Course player (YouTube unlisted embeds or R2 video), attachments and lesson completion
- Final exam with timer, pass mark, 48-hour retry lock and certificate unlock
- Certificates list + share links
- Jobs board and profile settings

### Admin dashboard (`/admin`)
- Overview with catalogue, student, enrolment and job stats
- Course editor: TipTap rich text, lessons, YouTube/R2 video, attachments, thumbnail uploads, exam questions, draft/publish
- Job approvals (approve/reject/delete) and student role management

## Setup

1. Environment variables in `.env`:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-long-random-secret
# Optional
BETTER_AUTH_URL=http://localhost:5173
R2_PUBLIC_URL=https://files.your-domain.com
SEED_ADMIN_EMAIL=admin@sqrock.cloud
SEED_ADMIN_PASSWORD=Admin@12345
```

2. Install and create tables:

```bash
npm install
npm run db:push      # apply the Drizzle schema
npm run db:seed      # demo courses, jobs + admin account
```

The seed is idempotent. It creates the admin account using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@sqrock.cloud` / `Admin@12345`). **Change the password after first login.**

Prefer to use your own account? Sign up first, then run:

```bash
npm run db:make-admin -- you@example.com
```

3. Run locally:

```bash
npm run dev          # http://localhost:5173
```

> **Runtime note:** local dev (`vite dev`) runs on Node so it can reach a local PostgreSQL server. Production builds (`npm run build`) still target Cloudflare Workers and use the R2/Hyperdrive-style bindings from `cloudflare.config.ts`. A database on `localhost` is only reachable in local dev — for deployment, use a hosted Postgres URL (Neon, Supabase, etc.).

Production:

```bash
npm run build
npm run deploy
```

## Cloudflare R2 uploads

Admin uploads are handled by `/api/upload` and streamed through `/api/files/[...key]` when no public domain is set.

1. Create an R2 bucket in the Cloudflare dashboard.
2. Add a binding named `BUCKET` to the Worker in `cloudflare.config.ts`.
3. Optionally set `R2_PUBLIC_URL` to the bucket's public/custom domain for direct URLs.

If R2 is not configured, uploads return a clear error and attachments can still be added as external links.

## Notes

- Without a reachable database the public site gracefully falls back to demo content; dashboards require a working database and login.
- Online payments are not wired yet. Paid course enrolments show a payment-link contact flow (`academy@sqrock.cloud`). Add Razorpay/Stripe in `enrollInCourse` when ready.
- SQL migration files live in `drizzle/`; regenerate with `npm run db:generate`.
- The mobile app is targeted for **10 December** per the marketing content.

## Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run deploy` | Deploy to Cloudflare |
| `npm run db:push` | Push schema to the database |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:seed` | Seed admin, courses and jobs |
| `npm run db:make-admin -- you@email.com` | Promote an existing account to admin |
| `npm run db:studio` | Open Drizzle Studio |
