# ADR-001: Backend Architecture — Next.js Route Handlers, not a Separate NestJS Service

**Status:** Accepted
**Date:** Phase 5, Stage 1

## Context

`05_OMV_Master_Development_Guide.md` specifies a monorepo topology
(apps/web, apps/admin, services/api running NestJS) with PostgreSQL and
Prisma. OMV has, in practice, been built and deployed as one single
Next.js 14 application since Phase 1 — a pragmatic deviation re-flagged
explicitly in every phase's documentation since.

Phase 5 requires a real backend: a database, real authentication, real
server-side RBAC enforcement, and atomic payment/inventory transactions.

## Decision

Next.js Route Handlers (app/api/**) are the authoritative server/API
layer, calling Prisma directly against PostgreSQL, all within the same
Next.js application already deployed to Vercel. No separate NestJS
service is introduced. Approved across three Phase 5 planning rounds.

## What is superseded

Only the deployment topology (separate services/api running NestJS) is
superseded. The Guide's actual technology mandates — Next.js,
PostgreSQL, Prisma, JWT + refresh tokens + RBAC — are not superseded;
they are exactly what Stage 1 implements.

## Why

1. OMV has one Vercel project, one deployment history, since Phase 1.
   NestJS means a second hosting account/pipeline that doesn't exist.
2. Vercel does not run long-lived NestJS processes natively.
3. Every Phase 5 requirement is achievable with Route Handlers + Prisma
   + Postgres — nothing depends on NestJS-specific features.

## Consequences

Server code lives under app/api/**, shared domain logic under lib/server/**.
A genuine technical blocker requires stopping and raising it explicitly,
not a silent reversal of this ADR.
