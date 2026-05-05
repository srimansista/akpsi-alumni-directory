# AKPsi Omega Theta Alumni Portal

A full-stack alumni portal for Alpha Kappa Psi Omega Theta at UMD, built with Next.js App Router, Prisma, PostgreSQL, NextAuth/Auth.js, Tailwind, and shadcn/ui.

## Features

- Landing page with mission, stats cards, CTAs, and "Why this matters" section
- Alumni directory with search, filters, sort, favorites, responsive card layout
- Alumni profile pages with contact/career details and mentorship flags
- Public alumni update form with pending review workflow
- Admin dashboard with:
  - Alumni CRUD
  - CSV import with preview/duplicate detection
  - CSV export
  - Data quality summary (missing/duplicate indicators)
  - Submission approve/reject/apply actions
  - Event CRUD + RSVP tracking
  - Newsletter CRUD + send workflow + send status
- Newsletter archive + detail pages
- Unsubscribe flow for newsletter recipients
- Role-based access (`ADMIN`, `VIEWER`) and configurable directory visibility

## Tech Stack

- `next@14` + `typescript`
- `tailwindcss` + `shadcn/ui`
- `prisma` + PostgreSQL (Neon/Supabase/local Postgres)
- `next-auth@5` (Auth.js) with Prisma adapter
- `resend` for email sending
- `zod` for validation

## Database Models

Defined in `prisma/schema.prisma`:

- `User`
- `Alumni`
- `AlumniUpdateSubmission`
- `Event`
- `EventRSVP`
- `Newsletter`
- `NewsletterRecipient`
- `Favorite`
- `AuditLog`
- NextAuth support models: `Account`, `Session`, `VerificationToken`

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill required values:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD` (recommended)
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `DIRECTORY_ACCESS` (`public` or `protected`)

## Local Development

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## CSV Import Format

Admin CSV import expects headers like:

`name, gradYear, company, role, email, linkedInUrl, major, location, industry, willingToMentor, willingToSpeak, notes`

## Seed Data

- Sample seed file: `prisma/seed-alumni.csv`
- Seed command: `npm run db:seed`
- Optional custom file path:

```bash
node prisma/seed.mjs ./path/to/your-alumni.csv
```

## Security Notes

- `/admin` is protected and restricted to `ADMIN` users
- Public routes never expose private `adminNotes`
- All write APIs validate payloads with Zod schemas
- Newsletter send respects `Alumni.unsubscribed = true`
- No private LinkedIn scraping is performed; only submitted/imported data is used

## Deployment (Vercel + Neon/Supabase)

1. Create a managed Postgres DB (Neon or Supabase)
2. Add all env vars in Vercel project settings
3. Deploy the repo to Vercel
4. Run database migrations:

```bash
npx prisma migrate deploy
```

5. (Optional) run seed job once:

```bash
npm run db:seed
```

## Production Checklist

- Set `AUTH_URL` to your production domain
- Set secure `AUTH_SECRET`
- Configure real `ADMIN_PASSWORD`
- Configure a verified sender for Resend/SendGrid
- Validate `DIRECTORY_ACCESS` policy for your chapter
