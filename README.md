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
- Certificates list + share links + dynamic certificate PDF download from the course PPTX template
- Jobs board and profile settings

### Admin dashboard (`/admin`)
- Overview with catalogue, student, enrolment and job stats
- Course editor: TipTap rich text, lessons, YouTube/R2 video, attachments, thumbnail uploads, exam questions, certificate PPTX template, draft/publish
- Job approvals (approve/reject/delete) and student role management
- PPT to PDF: upload `.pptx` templates, auto-detect `[Placeholders]`, fill them in a popup and download a browser-generated PDF (PPT metadata is stored in Postgres, files in R2)

## Setup

1. Environment variables in `.env`:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-long-random-secret
# Optional
BETTER_AUTH_URL=http://localhost:5173
# Cloudflare R2 (S3 API)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=sqrock-academy
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
# Razorpay (test or live)
RAZORPAY_MODE=test
RAZORPAY_TEST_KEY_ID=rzp_test_...
RAZORPAY_TEST_KEY_SECRET=...
RAZORPAY_LIVE_KEY_ID=rzp_live_...
RAZORPAY_LIVE_KEY_SECRET=...
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

Course thumbnails, lesson videos, attachments and PPT templates all use the same `/api/upload` route and are served through `/api/files/[...key]` when no public domain is set. Storage is configured entirely through environment variables (Cloudflare R2 S3 API), so the same setup works in local dev and on Workers.

1. **Create a bucket**: Cloudflare Dashboard → R2 → Create bucket → name `sqrock-academy` (or your own name).
2. **Create an API token**: R2 → Manage R2 API Tokens → Create API token → permission **Object Read & Write** → scope it to your bucket. Copy the **Access Key ID**, **Secret Access Key** and your **Account ID**.
3. Add them to `.env`:

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=sqrock-academy
```

4. **Optional public URL**: open the bucket → Settings → Public access → enable the `r2.dev` URL or connect a custom domain. Copy that URL into `R2_PUBLIC_URL`. Without it, files are streamed through `/api/files/...` (works, but uses Worker bandwidth).
5. For deployment add these as Worker secrets/vars (`.env` values are used by `cloudflare.config.ts` at deploy time, or set them with `npx wrangler secret put R2_SECRET_ACCESS_KEY` etc.):

```env
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
```

If R2 is not configured, local dev falls back to `public/uploads/` (gitignored). In production, uploads return a clear configuration error instead of failing silently.

### R2 troubleshooting

- **`TLS handshake failed` / `fetch failed`**: usually a wrong `R2_ACCOUNT_ID`. Use the 32-character **Account ID** from the Cloudflare dashboard — not the Access Key ID, an API token or a full URL. Also make sure R2 is enabled on the account.
- **EU/jurisdiction bucket**: set `R2_ENDPOINT=https://<account-id>.eu.r2.cloudflarestorage.com` (or the matching jurisdiction endpoint).
- **`403` on upload**: the R2 API token is missing **Object Read & Write** permission for that bucket.
- **`404`**: `R2_BUCKET_NAME` does not match the bucket name exactly.

> The PPT template list needs the new `ppt_template` table. Run `npm run db:push` after pulling this change.

## Razorpay payments

Paid course enrolment uses Razorpay Checkout. No extra package or server is needed: the server creates the order through the Razorpay REST API, the browser opens Checkout, and the payment signature is verified server-side before enrolment.

1. Create a Razorpay account and copy the **Test** key id/secret from Dashboard → Settings → API Keys.
2. Add them to `.env`:

```env
RAZORPAY_MODE=test
RAZORPAY_TEST_KEY_ID=rzp_test_...
RAZORPAY_TEST_KEY_SECRET=...
```

3. Restart `npm run dev`, open a paid course and click **Enrol for ₹…**.
4. Use Razorpay test checkout details (test card: `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1234` if prompted).
5. After successful verification the student is enrolled automatically.

Before going live, replace the test keys with **Live** keys and set `RAZORPAY_MODE=live`. The same env vars must be available to the deployed Worker.

## Certificate templates

Each course can have its own certificate `.pptx` template, uploaded from the course editor.

Mandatory placeholders (certificate issuing enabled):

| Placeholder | Value |
| --- | --- |
| `[Name]` | Student name |
| `[Course]` | Course title |
| `[Certificate ID]` | Unique certificate number |
| `[Date]` | Issue date |
| `[Score]` | Exam score (optional) |
| `[Instructor]` | Instructor name (optional) |
| `[Email]` | Student email (optional) |

Placeholders are matched ignoring case, spaces and punctuation, so `[CertificateID]` also works, but using the exact names above is recommended. After a student passes the exam, the certificate page generates the filled PDF entirely in the browser using the stored R2 template.

## Notes

- Without a reachable database the public site gracefully falls back to demo content; dashboards require a working database and login.
- Paid course enrolment uses Razorpay Checkout; configure `RAZORPAY_MODE` plus the matching test/live keys in `.env`.
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
