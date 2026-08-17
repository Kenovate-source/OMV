# Changelog

All notable changes to the OMV project are documented here, newest first.

## v0.4.2 — Actionable Notifications & Real Mannequin Composition (Phase 4)

**Status:** Awaiting your approval. Fixes two specific gaps found in
manual testing of v0.4.1: notifications didn't do anything when clicked,
and the mannequin was a generic silhouette with unrelated colour blocks
instead of a genuine garment composition.

### Added
- `AdminNotification.href` — every notification now has (or explicitly
  lacks) a real destination. `useAdminNotifications().addNotification()`
  lets any admin action push one.
- New notification triggers, each deep-linked: order placed → that order
  in Admin Orders (`/admin/orders#<id>`); a variant crossing into low
  stock → Admin Inventory; a product save → that product's detail page;
  an announcement published → Admin Announcements.
- `Mannequin` rebuilt with 8 distinct garment silhouettes (dress, top/
  shirt with sleeves, layered jacket with lapel, split-leg trousers,
  flared skirt, floor-length traditional wear, wrapped headwear, handled
  bag) instead of one generic shape recoloured per slot.
- `OutfitSlot` expanded from 7 to 11 categories
  (top/shirt/dress/jacket/trousers/skirt/traditionalWear/shoes/bag/
  headwear/accessory) to support the above.
- Outfit Builder: size selection is now part of the per-slot outfit
  state (auto-picked on selection, changeable via size chips, shown in
  the summary, and preferred when adding the look to the bag).
- `preview/mannequin-combo-test.png` — a direct visual verification of 7
  different outfit combinations, confirming genuinely different
  silhouettes per combination (not just recoloring).

### Changed
- `app/admin/notifications/page.tsx` — rows are now `Link`/`button`
  elements, not static text; existing unread badge/count behavior
  unchanged.
- `app/admin/orders/page.tsx` — each order now has a DOM anchor id for
  notification deep-linking.
- `lib/data/occasions.ts`'s `CuratedLook` fields renamed to match the
  expanded slot set (`headwear` instead of folding headwear into
  `accessory`, `trousers`/`shirt`/`jacket` instead of `bottom`/`top`/
  `outerwear`).

### Not changed
Phase 1–3 functionality, RBAC structure, branding, and every other Phase
4 refinement (product variants, inventory sync, Family Shopping, Style
Quiz, Announcements) — untouched by this round.

---

## v0.4.1 — Admin Portal Refinement & Phase 5 Preparation (Phase 4)

**Status:** Awaiting your approval. This is a refinement of the already-
approved-architecture v0.4 Admin Portal — not a new phase — implementing
the detailed Phase 4 refinement brief plus the order→inventory→storefront
synchronization requirement.

### Added
- **`lib/inventory/inventory-context.tsx`** — new root-level `InventoryProvider`,
  the single source of truth for product/variant/stock data across the
  entire app (storefront and admin). Replaces the admin-only
  `AdminProductsProvider` (deleted).
- **Product variant architecture** (`lib/data/products.ts`): `Product` now
  carries `variants: { color, size, stock }[]` instead of separate flat
  `colors[]`/`sizes[]` arrays, plus `status`, `subcategory`, `salePrice`.
  Helper functions (`getColors`, `getSizes`, `getVariant`, `getTotalStock`,
  `isProductInStock`) derive everything else from `variants`.
- **Order → Inventory → Storefront sync**: checkout validates every cart
  line against live variant stock before allowing an order (`checkStock`),
  then deducts it (`deductStock`); admin cancelling an order restores it
  (`restoreStock`) via a new `Cancelled` order status. Cart quantity
  steppers are clamped to live stock. PDP shows real per-variant
  availability — a fully-sold-out variant shows unavailable, but the
  product stays visible if any other variant has stock.
- **Admin Products** (`app/admin/products/page.tsx` + new
  `app/admin/products/[id]/page.tsx`): full metadata editing (description,
  subcategory, sale price, status) plus a dedicated variant management
  view — add/remove colours and sizes, per-variant stock editing grouped
  by colour.
- **Admin Inventory** rebuilt at variant granularity — every colour/size
  row for every product, not one number per product.
- **Role-aware Admin Dashboard** — Super/Business/Staff each see a
  genuinely different metric set (see IMPLEMENTATION_LOG.md for the exact
  breakdown), not one dashboard with items hidden.
- **Family Shopping redesign**: open-ended relationship field (datalist,
  not a closed enum), age group, per-category clothing sizes (tops,
  bottoms, dresses, outerwear, traditional wear), shoe size, style and
  colour preference tags.
- **Style Quiz redesign**: 8 plain-language multiple-choice questions
  producing structured preference data (`lib/style/style-context.tsx`'s
  new `StylePreferences`) instead of only a personality label — genuinely
  read by Outfit Builder for recommendations.
- **`components/shop/Mannequin.tsx`** — a stylized, abstract SVG dress-form
  mannequin (explicitly not photography, not a body/face representation)
  shared by Outfit Builder and Complete the Look, filling per-slot regions
  with the selected product's colour.
- **Outfit Builder rebuilt** around the mannequin: per-slot product
  selection, live visual composition, Style Quiz-driven "Recommended"
  badges, save outfit / add complete look to bag / per-item wishlist.
- **Complete the Look rebuilt** around occasion selection: full structured
  occasion catalogue (`lib/data/occasions.ts`, matching the requested
  category list), mannequin visualization of the curated look for
  occasions that have one, an honest empty state pointing to Outfit
  Builder for occasions that don't yet.
- **Site Announcements**: `lib/announcements/announcement-context.tsx` +
  admin CRUD page (`/admin/announcements`) + dismissible storefront banner
  (`components/layout/AnnouncementBanner.tsx`). Explicitly documented and
  UI-labeled as local-to-this-browser only — not yet visible to other
  visitors (see architecture note in IMPLEMENTATION_LOG.md).

### Changed
- `lib/cart/cart-context.tsx` — `CartLine` gained `color` (cart lines now
  key on productId+color+size, matching a real variant). Existing carts
  migrate automatically.
- `lib/orders/order-context.tsx` — `OrderItem` gained `color`; `OrderStatus`
  gained `"Cancelled"`.
- `lib/family/family-context.tsx` — full data model redesign; existing
  Phase 3 profiles migrate automatically on load.
- `lib/style/style-context.tsx` — `styleProfile: string` replaced by
  structured `preferences: StylePreferences` (a `styleLabel` is still
  derived for display).
- `.eslintrc.json` — added `varsIgnorePattern: "^_"` alongside the existing
  `argsIgnorePattern`, for an intentionally-unused destructured variable
  introduced in the Family Shopping edit form.

### Not changed
Branding, design tokens, `Navbar`/`Footer` structure, the customer
dashboard's other pages (Profile, Addresses, Loyalty, Notifications,
AI Stylist), and the RBAC nav matrix itself (Super/Business/Staff section
visibility) are all unchanged from the approved v0.4.

### Deferred to Phase 5 (see IMPLEMENTATION_LOG.md for full detail)
Real atomic server-side stock deduction; cross-visitor announcement
delivery; real customer accounts/auth; photographic or AI virtual
try-on; curated looks for the full occasion list (data architecture
supports it, only a subset are hand-curated against the current small
catalogue).

---

## v0.4 — Admin Portal (Phase 4)

**Status:** Awaiting your approval.

### Patch — Vercel type-check build fix
- Fixed `components/admin/AdminShell.tsx`: `NavItem.icon` was hand-typed
  narrower than Lucide's actual `LucideIcon` type (`size?: number` instead
  of `size?: string | number`), which failed `next build`'s type-check
  when assigning real Lucide icon components to it. Retyped as
  `icon: LucideIcon` (imported from `lucide-react`). No render logic, RBAC
  logic, routes, or roles changed.

### Added
- `/admin` Admin Portal with a shared `AdminShell` (RBAC-filtered sidebar
  desktop / tab bar mobile), gated by a mock sign-in picker listing 5
  seeded administrators across 3 roles (Super/Business/Staff Admin).
- Ten sections: Sign In, Dashboard, Inventory, Products (Super/Business
  only), Customers, Orders, Promotions (Super/Business only), Reviews
  (Super/Business only), Reports (Super/Business only), Audit Logs (Super
  only), Notifications.
- Seven new admin contexts: `AdminAuthProvider` (RBAC session + role seed),
  `AdminProductsProvider`, `AdminCustomersProvider`,
  `AdminPromotionsProvider`, `AdminReviewsProvider`, `AdminAuditProvider`,
  `AdminNotificationsProvider` — same localStorage pattern as every prior
  context.
- `RequireRole` component — page-level RBAC guard used on Products,
  Promotions, Reviews, Reports, and Audit Logs.
- Real cross-phase integration: Dashboard/Reports pull live numbers from
  the same `useOrders()` history customers generate at checkout; the
  Orders page reuses Phase 3's `OrderTracker` component and can advance a
  real order's status; Admin Notifications generates a live entry whenever
  a genuinely new order is placed; every admin action (stock change,
  product add/remove, promotion create/toggle, review moderation, order
  status change) writes a real Audit Log entry.
- `lib/orders/order-context.tsx` gained `updateStatus()` — additive, used
  by the Admin Orders page; existing `addOrder`/`orders` usage in Phase 3's
  customer dashboard is unaffected.
- Footer: added a discreet "Admin Portal" link (bottom-right, alongside
  Privacy/Terms) for discoverability — the main customer nav is untouched.
- 12 new preview PNGs (desktop + mobile, dark + light for the Dashboard)
  covering all ten admin sections, captured signed in as different roles
  to demonstrate RBAC filtering.

### Changed
- `lib/orders/order-context.tsx` — additive `updateStatus` function only;
  no change to existing `addOrder` behavior or the `Order`/`OrderStatus`
  types Phase 3 already uses.

### Not changed
Nothing from Phase 1–3's approved functionality was altered. The Products
page's admin-side catalogue is intentionally NOT wired into the live
storefront (see IMPLEMENTATION_LOG.md) — Phase 2's `/women`, `/men`,
`/kids` pages and their data source are untouched.

### Deferred to later phases
- Real multi-admin authentication and unlimited admin accounts (Phase 5)
- Admin product catalogue synced to the live storefront (Phase 5, once a
  real backend exists to serve both consistently)
- Real customer accounts backing the Customers page (Phase 5)
- Customer-facing review submission feeding the Reviews moderation queue
  (candidate for a future storefront update once Phase 5's backend exists)

---

## v0.3 — Customer Dashboard (Phase 3)

**Status:** ✅ Approved — reviewed on the live Vercel deployment.

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
