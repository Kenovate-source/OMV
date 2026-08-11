# Changelog

All notable changes to the OMV project are documented here, newest first.

## v0.3 — Customer Dashboard (Phase 3)

**Status:** Awaiting your approval.

### Patch #2 — Vercel build-blocking error fix
- Fixed `app/checkout/page.tsx`: raw apostrophe in JSX text
  ("this order's status") escaped to `&apos;`, resolving the actual
  build-blocking `react/no-unescaped-entities` error. Searched the rest of
  the codebase for the same pattern — no other instances found in real JSX
  text (a few similar-looking matches were inside comments or string
  literals, which this rule doesn't apply to).
- Re-verified `.eslintrc.json` and confirmed no duplicate/conflicting
  ESLint config exists anywhere in the project. Config already contains
  the Patch #1 fix; if a build still shows unprefixed `no-unused-vars`,
  see IMPLEMENTATION_LOG.md — likely means the deployed repo hasn't picked
  up the Patch #1 file changes yet.

### Patch #1 — Vercel ESLint build fix
- Fixed `.eslintrc.json`: the project's own `"no-unused-vars": "warn"`
  override was shadowing the TypeScript-aware unused-vars rule, causing
  every parameter name in every context interface's function-type
  signatures (across all phases, not just Phase 3) to be misreported as
  unused. Turned the base rule off and enabled
  `@typescript-eslint/no-unused-vars` explicitly instead. No context file
  logic changed — see IMPLEMENTATION_LOG.md for full root-cause detail.
- Added explicit `@typescript-eslint/eslint-plugin` and
  `@typescript-eslint/parser` devDependencies to `package.json`.

### Added
- `/account` dashboard with a shared `DashboardShell` (sidebar nav desktop,
  scrollable tab bar mobile) wrapping 8 new pages:
  - `/account` — Profile overview (editable details + quick stats)
  - `/account/addresses` — saved address book
  - `/account/orders` — real order history + `OrderTracker` stepper
  - `/account/loyalty` — tier/points derived from real order history
  - `/account/notifications` — Email/SMS/WhatsApp/Push preference toggles
  - `/account/ai-stylist` — AI Fashion Assistant (keyword-matched preview)
  - `/account/outfit-builder` — build and save outfits from the catalogue
  - `/account/style-quiz` — short quiz producing a persisted style profile
- Five new persisted contexts: `ProfileProvider`, `AddressProvider`,
  `OrderProvider`, `NotificationProvider`, `StyleProvider` — same
  localStorage pattern as every Phase 1/2 context.
- Checkout now calls `addOrder()` on successful order placement, so orders
  placed in the storefront show up in Order History / Tracking / Loyalty
  automatically — the dashboard is wired to real Phase 2 activity, not
  separately-seeded demo data.
- Checkout confirmation now links directly to `/account/orders`.
- Footer's "Order Tracking" and "Loyalty & Rewards" links (previously
  pointing at non-existent routes) now point at the real dashboard pages;
  added a "My Account" entry.
- Navbar: added a "My Account" link next to the existing "Sign in" link
  (desktop and mobile) — additive, Sign In was not removed or replaced.
- 12 new preview PNGs (desktop + mobile, dark + light where applicable)
  covering every new dashboard page.

### Changed
- `app/layout.tsx` gained five additional providers, nested alongside the
  existing ones — no provider removed or reordered relative to Phase 2.
- `app/checkout/page.tsx` — order placement now persists to `useOrders()`;
  confirmation screen copy updated accordingly. Shipping form, payment
  placeholder, and order-summary UI are otherwise unchanged from Phase 2.

### Not changed
Nothing from Phase 1 or Phase 2's approved functionality was altered beyond
the additive Navbar/Footer link fixes and Checkout's order-persistence hook
described above.

### Deferred to later phases
- Real authentication gating the dashboard (Phase 5)
- Real order fulfillment events driving Order Tracking status (Phase 5)
- Full AI personalization service (Phase 5)
- Address book wired into Checkout's shipping form (candidate for Phase 4/5)
- Admin portal (Phase 4)

---

## v0.2 — Storefront (Phase 2)

**Status:** ✅ Approved — QA-tested on the live Vercel deployment.

### Patch — Vercel build fix
- Fixed a TypeScript strict-mode error in `components/shop/ProductDetail.tsx`
  that failed `next build` on Vercel: `product.sizes[0]` is typed
  `string | undefined` under this project's `noUncheckedIndexedAccess`
  tsconfig setting, so `size` state carried that `undefined` into
  `addItem()`, which requires a `string`. Fixed by typing the state as a
  guaranteed `string` (with a `""` fallback for the edge case of a product
  with no sizes) and guarding `handleAddToCart`/the "Add to Bag" button so
  it's disabled rather than silently no-op-ing if no size is available. No
  type-safety was weakened — no `any`, no non-null assertions.
- Confirmed no other array-index accesses exist elsewhere in the codebase
  that could hit the same strict-mode rule.

### Added
- Mock product catalogue (`lib/data/products.ts`) — 12 products across
  women/men/kids, shaped to map directly onto the real Prisma schema in
  Phase 5.
- `CartProvider`/`useCart`, `WishlistProvider`/`useWishlist`,
  `FamilyProvider`/`useFamily` — all persisted to `localStorage`.
- Category pages `/women`, `/men`, `/kids` via a shared `CatalogueView`
  (badge/size filters, sort).
- `/product/[slug]` product detail page with size selection, add-to-cart,
  wishlist toggle, and a "Complete the Look" related-products section.
- `/search` — live search against name/category/description.
- `/wishlist` and `/cart` pages, wired to the new contexts.
- `/checkout` — shipping form, order summary, and a working confirmation
  step (payment gateway explicitly deferred to Phase 5, and labelled as
  such in the UI).
- `/family-shopping` — add/remove family members, set an active shopping
  profile.
- `/complete-the-look` — curated outfit pairings page.
- Navbar: live cart/wishlist item-count badges, working search flyout
  (desktop) and inline search field (mobile).
- 12 new preview PNGs (desktop + mobile, dark + light where applicable)
  covering every new screen.

### Changed
- `app/layout.tsx` now nests `FamilyProvider` → `WishlistProvider` →
  `CartProvider` around the existing `AuthProvider`/`ThemeProvider`.
- `Navbar` gained live counts and search; no visual changes to nav links,
  logo usage, or mobile menu structure from Phase 1.

### Not changed
Nothing from Phase 1's foundation (theme tokens, branding, auth pages,
landing page, layout) was altered beyond the Navbar additions above, per
your instruction not to redesign anything Phase 2 didn't require.

### Not yet built
Customer dashboard, AI assistant, outfit builder (Phase 3); admin portal
(Phase 4); real backend/payments/notifications (Phase 5); PWA/deployment
hardening (Phase 6).

---

## v0.1 — Foundation (Phase 1)

### Added
- Next.js 14 (App Router) + TypeScript + Tailwind project scaffold.
- Design token system (`app/globals.css` + `tailwind.config.ts`): dark theme
  (primary, exact Brand Book hex values) and a newly derived light theme
  (warm parchment tones, no bright white, no bright green).
- Theme system: `ThemeProvider`, `ThemeToggle`, pre-hydration flash
  prevention, persisted to `localStorage`.
- Branding: `App_Icon.png` wired as favicon + app icon; full logo lockup
  used only in navbar, footer, hero, and auth pages.
- Reusable components: `Button` (primary/outline/ghost/ai/premium),
  `Input`, `Card`, `ProductCard` (foundation for Phase 2).
- Responsive `Navbar` (desktop nav + mobile drawer) and `Footer`.
- Landing page: hero, brand-pillar cards, trust strip, CTA.
- Auth foundation: `AuthProvider`/`useAuth` context (stubbed, ready for
  Phase 5 API wiring), Sign In and Create Account pages.
- Accessibility foundation: skip link, visible focus rings, `aria-*`
  labeling, `prefers-reduced-motion` support, labelled form fields with
  error wiring.
- `/preview` — 9 offline-rendered PNG previews (desktop + mobile, dark +
  light) of every Phase 1 screen.
- `REVIEW.md` / `REVIEW.pdf` — page-by-page design review for approval.
- `IMPLEMENTATION_LOG.md` — technical decisions, assumptions, milestones.

### Assumptions (see IMPLEMENTATION_LOG.md for full detail)
- Placeholder typefaces (Playfair Display / Inter) standing in for
  "elegant serif / modern sans" until specific fonts are confirmed.
- Light theme exact hex values are a first derivation from the approved
  palette, open to adjustment.

### Not yet built
Catalogue, PDP, cart, checkout, customer dashboard, AI assistant, admin
portal, backend/API, and everything else scheduled for Phases 2–6.
