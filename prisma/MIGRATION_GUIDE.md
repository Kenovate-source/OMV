# Running the Phase 5 Foundation Locally / Against Real Infrastructure

This sandbox has no network access, so none of the following could be
executed here — schema.prisma and seed.ts were written and manually
cross-checked but not validated by the Prisma CLI or a live database.

## 1. Install dependencies
```bash
npm install
```
postinstall runs `prisma generate` automatically — this only needs the
schema file, not DATABASE_URL, so this alone reveals a schema syntax error.

## 2. Set up a database
Create a Neon or Vercel Postgres project. Copy the pooled connection
string into DATABASE_URL and the direct one into DIRECT_URL in
.env.local. Use separate branches/databases per environment.

## 3. Validate the schema explicitly
```bash
npx prisma validate
```
Pure syntax/type check, no database connection required.

## 4. Run the first migration
```bash
npx prisma migrate dev --name init
```
The real end-to-end validation step.

## 5. Seed
```bash
npm run db:seed
```
Reproduces the real Phase 4.2 catalogue, 5 admins, 1 announcement, 1
promotion, 1 business location. Add SEED_DEV_DATA=true first for one
local demo customer — never set in Preview/Production.

## 6. Verify
```bash
npx prisma studio
```
Visually confirm the seed landed: 12 products with correct variants, 5
admins with correct roles, 1 announcement, 1 promotion, 1 location.

## What "done" looks like
Steps 1-5 complete without error. Until run, this schema's real-world
validity is manually reviewed, not machine-verified.


## 7. Run the auth tests (new)

Use a THROWAWAY test database (e.g. a dedicated Neon branch), never
Production. Apply the schema to it first (`npx prisma migrate deploy`),
then:

```bash
npm test
```

See `tests/README.md`. These tests were written but have never been run.

## 8. First real admin sign-in (new)

`npm run db:seed` creates the five admins. If `SEED_ADMIN_PASSWORD` is
unset, each gets a random password **printed once** in the seed output —
copy them immediately; they are not stored anywhere. Then visit
`/admin` and sign in with email + password.

There is currently NO in-app way to change an admin password (see
IMPLEMENTATION_LOG known gap #1). Treat the printed passwords as
long-lived until that is built, and store them in a password manager.

## 9. Manual smoke test checklist (new)

1. Register a customer at `/register` → lands on `/account`, banner shows
   "Signed in as <email>".
2. Reload the page → still signed in (session restored from cookie).
3. Click "Sign out" → banner returns to guest state. Re-login works.
4. Log in with a wrong password → generic "Invalid email or password."
5. `/forgot-password` → with no `RESEND_API_KEY` in dev, the reset link is
   printed to the server console; open it, set a new password, confirm the
   old password no longer works and an old session is signed out.
6. Sign in to `/admin` as a STAFF admin; then in the browser console run
   `fetch("/api/admin/audit-logs").then(r => r.status)` → expect `403`.
   As SUPER → expect `200`. (This proves enforcement is server-side, not
   just hidden navigation.)
