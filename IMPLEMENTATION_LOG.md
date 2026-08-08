# OMV Implementation Log

This log is updated at the end of every development phase. It records
technical decisions, assumptions, deviations from the source documents, and
completed milestones so the project stays easy to maintain and hand over.

---

## Phase 2 — Storefront

**Status:** Complete, pending review.

### Completed
- Product data layer: `lib/data/products.ts`, a typed mock catalogue (12
  products) standing in for the real Prisma-backed API until Phase 5. The
  `Product` shape was designed to map directly onto the eventual database
  model so swapping the data source later is a fetch-layer change, not a
  UI rewrite.
- Three new client contexts, all following the exact persistence pattern
  established by `ThemeProvider` in Phase 1 (localStorage + hydration
  guard): `CartProvider`, `WishlistProvider`, `FamilyProvider`.
- `CatalogueView` + `FilterSidebar` + `ProductTile` — one shared set of
  components powers `/women`, `/men`, `/kids` (and `/search`, `/wishlist`)
  rather than three near-duplicate pages.
- `ProductDetail` (client component) + `/product/[slug]` (server component
  handling `notFound()` and metadata) — split this way so the route stays
  statically analyzable (`generateStaticParams`) while the interactive
  parts (size selection, add-to-cart) stay client-side.
- `/cart`, `/checkout`, `/family-shopping`, `/complete-the-look` pages.
- Navbar extended with live `useCart()`/`useWishlist()` counts and a
  working search flyout/inline field — no structural changes to the
  Phase 1 nav beyond this.
- 12 new offline-rendered preview PNGs, same headless-Chromium approach as
  Phase 1, covering catalogue, PDP, cart, wishlist, checkout (both states),
  and family shopping, desktop + mobile.

### Assumptions made (flagging per your instruction to pause on ambiguity)
- **Family Shopping without real auth:** the PRD requires login for family
  profiles, but Phase 5 (real auth) hasn't been built yet. Rather than
  either (a) silently building it as if login existed, or (b) blocking the
  page entirely until Phase 5, I built the feature now with an explicit,
  visible notice that profiles are browser-local until sign-in is wired
  up. This lets you review the actual UX today. Flagging this explicitly —
  let me know if you'd rather I gate the page behind a "coming soon" state
  instead until Phase 5.
- **Checkout without a payment gateway:** same reasoning — the payment step
  is visibly marked as a placeholder (dashed border, explanatory copy)
  rather than either skipping checkout entirely or building something that
  *looks* like it processes real payment. Placing an order generates a
  local reference number so the full flow is testable.
- **Product photography:** still none supplied, so product tiles use
  brand-toned gradient placeholders (derived from each item's `swatch`
  field) rather than stock photos, consistent with the Phase 1 landing-page
  decision to avoid stock imagery entirely.
- **Mock catalogue content** (product names, prices, categories) is
  illustrative — built to exercise every UI state (badges, sizes, related
  products), not as final merchandising copy.
- **Reviews** were listed under Product Bible "Core Features" but are not
  in this brief's Phase 2 scope list (Catalogue, PDP, Search, Filters,
  Wishlist, Cart, Checkout, Complete the Look, Family Shopping) — deferred
  rather than added unrequested. Flag if you'd like them pulled into Phase 2
  instead of later.

### Deviations
- None from the source documents. The auth/payment placeholders above are
  scoping decisions about *when* a requirement is fully implemented, not
  deviations from what's ultimately required.

### Not yet built (later phases)
- Customer dashboard, order tracking, loyalty, AI assistant, outfit
  builder, style quiz (Phase 3)
- Admin portal + RBAC (Phase 4)
- Real backend/API, payments, notifications, real auth (Phase 5)
- PWA service worker, deployment hardening, testing (Phase 6)

### Deployment note
No changes were made to `next.config.js`, `package.json` dependencies (beyond
what Phase 1 already declared), or anything Vercel-specific — Phase 2 uses
only the same Next.js/React/Tailwind primitives already deployed
successfully at https://omv-iota.vercel.app/, so this should deploy the same
way (`git push` / re-import in Vercel) without any project-settings changes.

---

## Phase 1 — Foundation

**Status:** Complete, approved. Live at https://omv-iota.vercel.app/.

### Completed
- Next.js 14 (App Router) + TypeScript + Tailwind project scaffold, structured
  per the Master Development Guide (`app/`, `components/`, `lib/`, `public/`).
- Design tokens implemented as CSS custom properties in `app/globals.css`,
  wired into Tailwind (`tailwind.config.ts`) rather than hard-coded hex values,
  so both themes share one component codebase.
- Dark theme (default/primary) using the exact Brand Book hex values.
- Light theme derived from the same palette: warm parchment tones instead of
  white, deep emerald ink instead of black, deepened gold for AA contrast —
  no new hues introduced.
- Border radii and spacing scale matched exactly to the Design System
  (`buttons: 16px`, `inputs: 14px`, `cards: 20px`, `modals: 24px`).
- Theme system: `ThemeProvider` (localStorage-persisted, defaults to dark),
  `ThemeToggle`, and an inline pre-hydration script to avoid a flash of the
  wrong theme.
- Branding: `App_Icon.png` wired as both favicon and PWA/app icon; full logo
  lockup used only in navbar, footer, hero, and auth pages, per your
  decision. The typo'd tagline in `SVG.png` was not used anywhere — all
  instances of the tagline are set as text ("Every Outfit. Every Occasion.
  Every Family.") rather than reused from that asset.
- Responsive Navbar (desktop nav + mobile drawer) and Footer.
- Landing page: hero, brand-pillars section (Family Shopping, Complete the
  Look, AI Fashion Assistant teaser, Loyalty), trust strip, CTA — no stock
  photography used, since the Brand Book asks for real, authentic photography
  only and none has been supplied yet.
- Reusable components: `Button` (primary/outline/ghost/ai/premium variants —
  purple reserved for AI, gold reserved for premium emphasis, per Brand
  Book §15), `Input`, `Card`, `ProductCard` (built now as a foundation
  component for Phase 2's catalogue).
- Auth foundation: `AuthProvider`/`useAuth` context with typed
  `loginWithEmail` / `loginWithPhone` / `register` / `logout` functions,
  currently stubbed (no backend yet — that's Phase 5). Login and register
  pages are built against this interface so wiring the real API later is a
  drop-in change inside `lib/auth/auth-context.tsx`.
- Accessibility foundation: skip-to-content link, visible on-brand focus
  rings (`:focus-visible`), `aria-*` labeling on interactive icons and the
  mobile menu, `prefers-reduced-motion` support, form errors wired to
  `aria-describedby`/`role="alert"`.

### Assumptions made (flagging per your instruction to pause on ambiguity)
- **Fonts:** Brand Book specifies "Elegant Serif" / "Modern Sans Serif" by
  category, not by name. I used Playfair Display (heading) and Inter (body)
  via `next/font/google` as a placeholder pairing that matches the described
  character. If you have licensed/specific typefaces in mind, this is a
  one-line swap in `app/layout.tsx`.
- **Light theme exact values** are my derivation from the approved palette
  (not specified in the docs beyond "must exist"). Documented with the
  reasoning inline in `app/globals.css` — flag anything you'd like shifted.
- **Primary button color in dark mode** uses a brightened mid-emerald
  (rather than the literal background hex) so buttons are visibly
  interactive against the dark background; gold was intentionally *not*
  used as the default button color, per "use gold sparingly."
- No real product/photography assets exist yet, so the landing page has no
  imagery beyond the logo — intentional, not an oversight.

### Deviations
- None from the source documents themselves.

### Not yet built (later phases)
- Catalogue, PDP, search/filters, cart, checkout, wishlist logic (Phase 2)
- Customer dashboard, AI assistant, outfit builder (Phase 3)
- Admin portal + RBAC (Phase 4)
- Real backend/API, payments, notifications (Phase 5)
- PWA service worker, deployment, testing (Phase 6)

### How to run locally
```bash
npm install
npm run dev
```
Requires internet access on your machine for the initial `next/font/google`
fetch and `npm install` (this build environment has neither, so the code has
been written but not compiled/tested with a live dev server — please flag
immediately if `npm run dev` surfaces anything unexpected).
