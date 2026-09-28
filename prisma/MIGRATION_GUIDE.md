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
