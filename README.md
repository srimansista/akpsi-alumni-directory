# AKPsi Omega Theta alumni portal

A private member directory built with Next.js, Auth.js, Prisma, and PostgreSQL. The root opens the directory; the shared navigation is at the top.

Members request an account, verify their email, and wait for administrator approval. Approved members can search alumni, privately save contacts as Want to talk or Talked to, view useful contact profiles. Administrators approve/revoke accounts and can review existing profile submissions. Revocation and password resets invalidate previous login sessions.

Directory fields reflect job functions first, with labeled education fallbacks. Company names and employer industries do not determine the field. Original education and employment records are preserved. Existing favorites become Want to talk contacts.

All member data, approval decisions, profile submissions, favorites, password hashes, and email verification tokens are stored in PostgreSQL. The runtime never falls back to local CSV files. CSV files are used only for a repeatable roster import.

## Run locally

Copy `.env.example` to `.env`, configure PostgreSQL and a random `AUTH_SECRET`, then:

```sh
npm install
npm run db:migrate
npm run db:seed
npm run db:admin
npm run dev
```

`db:admin` needs your own `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. It bootstraps the first approved administrator. The password is hashed before storage; no default password exists. Remove the bootstrap password from the environment after creating the account.

Registration, verification resends, and password recovery need `RESEND_API_KEY`, a verified `EMAIL_FROM`, and `AUTH_URL`. Pending profile submissions are always saved before attempting a notification to `SUBMISSION_APPROVAL_EMAIL`. Notification delivery failure does not lose the saved update.

## Checks

```sh
npm test
npm run build
npm run test:integration
```

The integration test uses your development PostgreSQL connection and a separate temporary schema. It mocks outbound email, starts a server on port 3011, and verifies registration, verification, account approval, private pages/APIs, favorites across server restart, profile reviews, revocation, and password recovery. It never modifies the real roster or sends email.

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel, managed PostgreSQL, email setup, migrations, and owner setup. `vercel.json` runs migrations before the build. Hosting and provider accounts must be connected before the site can be published.

The My profile editor is preserved in `src/features/member-profile`, outside the active routes. It is not included in the deployed site; `/update` returns 404.

Existing event/newsletter database tables are retained to preserve historical data. Their pages and APIs remain removed.
