# ADR-002: Variant Identity — variantKey

**Status:** Accepted
**Date:** Phase 5, Stage 1

## Context

ProductVariant.stock must be uniquely addressable per product. Phase
4.2's in-memory model keyed variants by (productId, color, size), which
breaks for future non-clothing categories (two book editions could both
have color=null, size=null, yet be distinct variants).

## Decision

Every ProductVariant carries a required variantKey: String, unique
together with productId, computed deterministically:

- If color and/or size is set: variantKey = [color, size].filter(Boolean).join("/")
  e.g. "Emerald/M" — identical to how Phase 4.2 already keys variants.
- If neither is set: variantKey is built from `attributes` (Json), sorted
  alphabetically by key, joined as "key:value|key:value" — e.g.
  "edition:Hardcover|isbn:9780000000001", which can never collide with a
  different edition's attributes.

variantKey is computed server-side, never client-supplied, and enforced
by @@unique([productId, variantKey]) at the database level.

Milestone 1 audit note: this computation currently exists only in
prisma/seed.ts (computeVariantKey()). Once Route Handlers for product
creation/editing exist, this must be extracted into a shared lib/server/
module so seed.ts and the admin API call the identical implementation —
flagged as forward-looking, not a defect, since no other caller exists
yet at this stage.

## Consequences

No two legitimately distinct variants can share a key, for any current
or future product category. Clothing/shoe products are unaffected.

## Known edge case (found by executing the derivation, not by inspection)

A variant with no color, no size AND no attributes derives the empty key
`""`. The `@@unique([productId, variantKey])` constraint does **not**
reject the first such variant for a product — it only prevents a second.
An empty key is a data-entry error, so it MUST be rejected by
application-layer validation when product/variant create-and-edit
endpoints are built (planned with product CRUD, a later milestone). Do
not rely on the database constraint alone to catch it.
