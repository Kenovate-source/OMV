# Running the Phase 5 auth tests

These are **real integration tests**: they call the actual Route Handlers
against a **real PostgreSQL database** through Prisma. There are no
mocks of the database, so a pass genuinely exercises the schema, the
argon2 hashing, the JWT handling, the session table, and the RBAC logic.

**Status when written: WRITTEN, NOT YET EXECUTED.** The sandbox they were
authored in has no network or database access.

## Before running

1. Use a **throwaway test database** — e.g. a dedicated Neon branch.
   **Never point this at Production.** (Tests only insert and delete
   their own uniquely-named rows; they never truncate tables — but a
   throwaway database is still the correct discipline.)
2. Put `DATABASE_URL` and `DIRECT_URL` for that test database in `.env.local`.
3. Apply the schema to it: `npx prisma migrate deploy` (or `migrate dev`).
4. `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` fall back to test-only
   values if unset (see `vitest.config.ts`).

## Run

```bash
npm install
npm test
```

## What is and isn't covered (be honest about the boundary)

Covered: registration, login, invalid-login rejection (with no-enumeration
assertions), rate limiting, logout/session revocation, refresh-token
rotation, password-reset expiry / single-use / session-revocation,
admin database-backed authentication, per-role server-side authorization,
immediate effect of DB role changes and deactivation, forged-token
rejection, unauthenticated rejection, and customer/admin session isolation.

NOT covered yet (the endpoints do not exist until later milestones):
cross-user isolation of orders, addresses, wishlists and family profiles.
The only cross-user isolation provable today is session/identity
isolation, which is what is tested.
