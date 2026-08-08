# Changelog

All notable changes to the OMV project are documented here, newest first.

## v0.2 — Storefront (Phase 2)

**Status:** Awaiting your approval.

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
