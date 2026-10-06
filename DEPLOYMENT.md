# Hosting the chapter portal

The Vercel project is `akpsiot/akpsi-alumni-directory`, linked to `srimansista/akpsi-alumni-directory` on GitHub. The production address is `https://akpsi-alumni-directory-three.vercel.app`. Node.js is pinned to 22.x in the project settings.

Neon resources `akpsi-production` and `akpsi-preview` use separate databases, environment targets, and authentication secrets. The current roster was imported into each from the local PostgreSQL database using `node scripts/prepare-hosted.mjs .env.production.local` (or `.env.preview.local`). The import preserves verified employment and past-company information and never overwrites an existing row.

The initial administrator is `alumni.akpsiot@gmail.com`. Registration uses a name, email, and password of at least 8 characters. No email verification or email service is required. Password-reset requests are handled by the chapter administrator. A one-time password setup link is issued privately for the owner; no bootstrap password is committed or stored in Vercel.

The app runs on Vercel with managed PostgreSQL. Members register and await administrator approval. Only approved accounts can access the directory, contact profiles, and favorites. There is no public directory or CSV fallback.

## Configure the services

1. Connect the GitHub repository to your Vercel account. The checked-in `vercel.json` selects Next.js and runs migrations before the production build.
2. Create a managed PostgreSQL database in Neon or Supabase. Use the provider's Prisma-compatible connection URL with TLS. Give preview deployments a separate development database; preview migrations must not use production data.
3. Add `DATABASE_URL`, a random `AUTH_SECRET`, and `AUTH_URL` (the final HTTPS domain) to Vercel's environment settings. Generate the secret with `openssl rand -base64 32`.
4. Optional: configure Resend with a verified sender domain for notifications or future email-based recovery. Set `RESEND_API_KEY`, `EMAIL_FROM`, and `SUBMISSION_APPROVAL_EMAIL`. Registration and login work without these.
5. Deploy. The build applies the migrations and builds the application. Restart/redeploy after environment changes.

Use the **direct connection** URL for migrations and one-time imports if your provider's pooler does not support Prisma migrations. The application runtime can use its Prisma-compatible pooled URL. Run `npm run db:migrate` against the direct URL before deploying if using separate connection URLs, then ensure the build uses a migration-capable URL too.

## Set up the owner and roster

Run these locally with the hosted database URL in an uncommitted environment file. Do not commit credentials or put passwords in command arguments.

```sh
npm run db:admin
npm run db:seed
```

For `db:admin`, set `ADMIN_EMAIL` to your email and `ADMIN_PASSWORD` to a unique password of at least 8 characters. This explicit owner bootstrap verifies and approves that one administrator. Remove `ADMIN_PASSWORD` from the environment afterward; runtime sign-in uses the stored password hash. Running it again resets that owner's password and invalidates existing sessions.

`db:seed` imports `data/Alumni Master List - Alumni Info.csv`, skips existing/duplicate entries, and never grants member access. A custom CSV can be passed as `node prisma/seed.mjs /path/to/roster.csv`. Imports preserve newer database records.

## Existing database

The initial migration describes the pre-membership schema. If you already have that exact schema and no migration history, inspect it before baselining:

```sh
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel /path/to/old-schema.prisma --script
npx prisma migrate resolve --applied 20261006000100_initial
npm run db:migrate
```

Only mark the initial migration as applied when the existing tables match it. Do not baseline an empty database. Member access defaults to `PENDING`, including existing users; run the owner bootstrap afterward. Historical event/newsletter tables are preserved.

## Owner workflow

Sign in → Administration → Member access. Approve known brothers or reject requests. Approval enables sign-in without email verification. Revoking access invalidates old login cookies immediately. Existing profile changes remain in the separate Submissions queue; approving a profile update does not grant login access. The My profile editor is archived outside the active routes and is not deployed.

## Validation before inviting members

Confirm registration, owner approval, member sign-in, favorites across sessions, and revoked access. Run `npm test` and `npm run test:integration` against a development database. The integration test creates a separate temporary PostgreSQL schema and does not change the roster.

Official deployment references: [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Prisma migration deployment](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate).
