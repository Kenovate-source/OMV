# OMV Implementation Log

This log is updated at the end of every development phase. It records
technical decisions, assumptions, deviations from the source documents, and
completed milestones so the project stays easy to maintain and hand over.

---

## Phase 4 — Refinement & Phase 5 Preparation

**Status:** Complete, pending review. Implements the detailed Phase 4
refinement brief (RBAC dashboards, product variants, Family Shopping
redesign, mannequin-based Outfit Builder/Complete the Look, Style Quiz
redesign, site announcements) plus the separately-specified order →
inventory → storefront synchronization requirement.

### Audit performed before coding (as explicitly required)
Read every relevant existing file before changing anything:
`AdminShell.tsx`'s NAV array (RBAC matrix), `app/admin/page.tsx` (single
shared dashboard), `lib/admin/admin-products-context.tsx` and
`lib/data/products.ts` (flat `colors[]`/`sizes[]`, one stock number per
product, no variants), `lib/family/family-context.tsx` (closed relation
enum, single free-text size field), `app/complete-the-look/page.tsx` and
`app/account/outfit-builder/page.tsx` (flat product-card grids, no
occasion concept, no mannequin, no quiz connection), `app/admin/page.tsx`
and `AdminShell.tsx`'s nav (confirmed the RBAC nav matrix already matched
the brief exactly — Super: everything, Business: everything except Audit
Logs, Staff: Dashboard/Inventory/Customers/Orders/Notifications — so it
was preserved unchanged), and a full-project search for any existing
announcement code (found none). This audit is what produced the build
order used below and is why the RBAC nav array itself was not touched.

### 1. RBAC-aware Dashboard
`app/admin/page.tsx` now branches by `currentAdmin.role`. Staff sees Total
Orders, Orders Needing Attention (Placed/Processing count), Low Stock
Variants, and Customers — no revenue, no product count, no pending
reviews, matching "do not show management metrics Staff can't act on."
Super/Business share the fuller metric set (Orders, Revenue, Products,
Low Stock, Pending Reviews); only Super additionally sees a "Recent Admin
Activity" card sourced from the audit log.

### 2–6. Product Management, Variants, Detail View, Add Product, Permissions
This was the largest and most architecturally significant change.
`Product` (`lib/data/products.ts`) now carries `variants: ProductVariant[]`
(`{ color, size, stock }`) as the *only* place stock lives, plus `status`,
`subcategory`, `salePrice`. The previous flat `colors[]`/`sizes[]`/
admin-only `stock: number` fields are gone entirely — there is no second,
possibly-conflicting stock value anywhere in the app now.

A new root-level `InventoryProvider` (`lib/inventory/inventory-context.tsx`)
owns this data and exposes `getProduct`, `getVariant`, `addProduct`,
`updateProduct`, `updateVariants`, `updateVariantStock`, `removeProduct`,
`checkStock`, `deductStock`, `restoreStock`. It replaces the old
admin-only `AdminProductsProvider` (deleted) and is mounted in the root
`app/layout.tsx`, not `app/admin/layout.tsx` — because the storefront
(PDP, cart, checkout) needs to read and write the exact same state the
admin portal does, per the explicit "do not create separate conflicting
stock values" requirement.

`app/admin/products/page.tsx` (Super/Business only, unchanged from the
existing RBAC) now collects description, category, subcategory, price,
sale price, status, and generates a full colour × size variant matrix from
comma-separated colour/size input with a starting stock value. A new
`app/admin/products/[id]/page.tsx` gives the full detail/edit view: all
metadata editable, colours and sizes addable/removable (regenerating the
variant matrix), and per-variant stock steppers grouped by colour —
matching the brief's exact example format.

`app/admin/inventory/page.tsx` was rebuilt from one row per product to one
row per *variant* (product × colour × size), which is also how Staff's
"view + stock-only" permission (requirement 6) is satisfied: Staff already
had no nav access to `/admin/products` (unchanged), and now Inventory
itself is the variant-level, stock-only surface the brief describes for
Staff — no separate permission flag was needed because the existing page
split already matches the requirement once Inventory became variant-aware.

### Order → Inventory → Storefront synchronization
- **Checkout** (`app/checkout/page.tsx`) calls `useInventory().checkStock()`
  against the live variant stock immediately before creating an order —
  not whatever the cart last knew — and blocks submission with a specific
  message if any line exceeds availability. Only on success does it call
  `deductStock()` and then `addOrder()`.
- **Cart** (`app/cart/page.tsx`) clamps the quantity stepper's "+" button
  to the live variant's current stock.
- **PDP** (`components/shop/ProductDetail.tsx`) now has real colour
  selection (previously static text) alongside size selection, reads live
  stock via `useInventory()` for the exact selected variant, disables "Add
  to Bag" and shows "Out of Stock" when that variant has none, and shows a
  strikethrough on individual out-of-stock size options — while sizes/
  colours with stock remain selectable, satisfying "the product remains
  visible, but [that variant] cannot be selected."
- **Admin Orders** (`app/admin/orders/page.tsx`) gained a `Cancelled`
  status option. Transitioning an order into `Cancelled` (and only on that
  transition, not on every re-save) calls `restoreStock()` with that
  order's exact line items, and logs the action.
- **Cart lines and order items now carry `color`, not just `size`**
  (`lib/cart/cart-context.tsx`, `lib/orders/order-context.tsx`) — a variant
  is colour *and* size together, and the previous size-only shape couldn't
  identify one. Both contexts migrate existing localStorage data from the
  old shape automatically (missing `color` defaults to `""`) rather than
  discarding a reviewer's existing cart/order history.

**Explicitly not claimed as safe for concurrent buyers.** The
`InventoryProvider`'s doc comments and this log state plainly: `checkStock`
then `deductStock` are two separate local React state writes, not one
database transaction. In this Phase 4 demo, each browser has its own
local inventory copy, so it can't actually oversell across users — but
that's a property of the demo's isolation, not of the code being
concurrency-safe. **Phase 5 must perform check-and-deduct as a single
atomic server-side database transaction** to prevent overselling when
real concurrent customers target the same final units. The
`checkStock`/`deductStock`/`restoreStock` function signatures are designed
to stay stable across that change — only their implementation moves
server-side.

### 7. Family Shopping redesign
`lib/family/family-context.tsx`: `relation` (closed enum: Self/Partner/
Child/Other) and `sizeNote` (single free-text field) replaced with
`relationship: string` (open-ended, powered by a `<datalist>` of the
requested suggestions — Husband, Wife, Father, Mother, Sibling terms,
Grandparent terms, Uncle/Aunt/Cousin/Nephew/Niece, Friend, Fiancé(e),
Colleague, Other — so a relationship not on the list is never blocked),
`ageGroup`, `genderPresentation`, `clothingSizes: { tops, bottoms, dresses,
outerwear, traditionalWear, other }`, `shoeSize`, `stylePreferences[]`,
`colorPreferences[]`. Existing Phase 3 profiles migrate automatically
(`migrateMember()` maps `relation`→`relationship`, `sizeNote`→
`clothingSizes.other`) so a reviewer's saved profiles don't silently
vanish.

### 8–13. Complete the Look / Outfit Builder (mannequin-based)
**Constraint flagged up front and honored throughout:** this project has
no garment photography (a deliberate Phase 1 decision — gradient swatches
stand in for photos). A photographically-accurate mannequin wearing real
garments is not possible without real photography assets, and the brief
explicitly says not to fake this. `components/shop/Mannequin.tsx` is
therefore a stylized, abstract SVG dress-form silhouette — no head, face,
skin tone, or body representation — with per-slot regions (dress, top,
bottom, outerwear, shoes, bag, accessory) filled with the *selected
product's actual swatch colour*. This is genuinely reflective of the
selection (not decorative), explicitly labeled in its own `aria-label` and
an on-screen caption as "a stylized preview... not garment-accurate
photography," and its `outfit` prop shape is designed to stay stable if a
real photographic/AI try-on is added in a future phase — only the internal
rendering would change, not the interface other components use.

`lib/data/products.ts` gained `getOutfitSlot(product)` — derives a slot
(top/bottom/dress/outerwear/shoes/bag/accessory) from `subcategory` plus a
couple of name-based overrides (e.g. "Clutch" → bag), since the catalogue
has no dedicated slot field. Flagged as a Phase 5 candidate for a real
first-class field instead of derivation.

**Outfit Builder** (`app/account/outfit-builder/page.tsx`): per-slot
product selection feeding the shared mannequin live, "Recommended" badges
on items matching the customer's Style Quiz colour/style preferences, save
outfit, add the complete look to bag (auto-selecting each item's first
in-stock variant), and per-item wishlist toggling.

**Complete the Look** (`app/complete-the-look/page.tsx` +
`lib/data/occasions.ts`): a full structured occasion catalogue matching the
brief's category list (Everyday, Work & Professional, Weddings &
Celebrations, Religious, Travel & Vacation, School, Sports & Active,
Special Nights, Formal, Cultural & Traditional — every occasion name from
the brief is present) drives real category/occasion filtering. A separate,
smaller `CURATED_LOOKS` map provides hand-curated mannequin looks for the
subset of occasions the current ~12-product mock catalogue can actually
support (Wedding Guest, Church/Sunday Service, Office/Business Casual,
Everyday Wear/Weekend). Occasions without a curated look show an honest
empty state pointing to Outfit Builder rather than a fabricated look —
the occasion catalogue is intentionally broader than what's curated today,
by design, and adding a curated look later is a pure data change.

### 14–15. Style Quiz redesign
`app/account/style-quiz/page.tsx` replaced 3 questions with 8, all in the
brief's plain-language style ("What colours do you like wearing?", "Do
you prefer loose or fitted clothes?", "What do you usually wear?", "Which
style do you like?", "Which shoes do you like?", "Which accessories do
you like?", "What are you dressing for most often?", "How formal do you
like to dress, generally?"). `lib/style/style-context.tsx` now stores
structured `StylePreferences` (colours, fit, clothing types, styles,
shoes, accessories, occasions, formality) as the source of truth — a
`styleLabel` is still derived for a friendly summary, but it's
display-only now, not read back as data by anything (this is the "quiz
must have a real purpose" requirement: Outfit Builder's recommendation
logic reads `preferences` directly).

### 16. Site Announcements
New `lib/announcements/announcement-context.tsx` (title, message, type,
start/end date, active flag, optional CTA), `app/admin/announcements/page.tsx`
(Super/Business only) for CRUD, and `components/layout/AnnouncementBanner.tsx`
— a dismissible banner mounted above the Navbar in `app/layout.tsx`, shown
only when an announcement is active and within its date window.

**Architecture note, stated in the admin UI itself and here:** this is
local-to-this-browser only. An admin "publishing" an announcement makes it
visible in *that admin's own browser's* storefront view, not to other
visitors — there is no shared backend/database in Phase 4. The admin page
carries an explicit on-screen notice saying so. `getActiveAnnouncement()`'s
signature is designed to stay identical when Phase 5 replaces its
implementation with a fetch to a real shared announcements API — the
banner component never needs to change.

### Assumptions made (flagging per instruction to pause on ambiguity)
- **Announcement management restricted to Super/Business Admin** — not
  explicitly specified in the RBAC section of the brief; treated as a
  marketing-adjacent capability similar to Promotions, which already
  excludes Staff.
- **Family relationship list is a suggestion, not a constraint** — the
  brief asked for a "flexible structure," so `relationship` is a plain
  string with a `<datalist>` of the requested options rather than a closed
  type; any value is accepted.
- **Outfit Builder's "add complete look to bag" auto-selects each item's
  first in-stock variant** rather than prompting for colour/size per item
  — chosen for flow simplicity; flagged in case explicit per-item variant
  selection is wanted instead.
- **Curated Complete the Look coverage is partial** (4 of ~90 occasions) —
  a direct, honest consequence of the ~12-product mock catalogue, not a
  shortcut; the architecture supports unlimited curated looks as a
  data-only addition once more products exist.

### TypeScript strict-mode audit (continued practice)
Proactively caught and fixed a real bug before it could surface as a build
failure: `Object.fromEntries(array.map(item => [a, b]))` without an
explicit tuple return type on the map callback infers `(A|B)[]` (a plain
array), not a `[A, B]` tuple, which `Object.fromEntries` requires — found
in both `app/complete-the-look/page.tsx` and
`app/account/outfit-builder/page.tsx`'s mannequin-outfit construction and
fixed by explicitly typing the callback's return as `[string, string]` in
both places. Also re-swept the full diff for the `noUncheckedIndexedAccess`
pattern from the two earlier real build failures (array indexing,
`.find()` without a fallback) — no new instances found; existing guarded
patterns (`?? fallback`, `if (!x) return`) were reused throughout.

### Not yet built / deferred to Phase 5
- Real atomic server-side stock deduction (see synchronization section above)
- Cross-visitor announcement delivery
- Real customer accounts, real multi-admin authentication
- Photographic or AI virtual try-on
- Curated looks for the full occasion catalogue
- Admin's product catalogue still not synced to server-rendered storefront
  pages (a Phase 4-original limitation, now more consequential given
  richer variant data — same root cause as before: some storefront pages
  render server-side and can't read browser-local admin state)

### What Phase 5 must preserve
- The `Product.variants` shape (`{ color, size, stock }`) as the single
  source of truth — every surface now depends on it.
- `InventoryProvider`'s `checkStock`/`deductStock`/`restoreStock` function
  signatures — only their implementation should move server-side/atomic.
- `Mannequin`'s `outfit: Partial<Record<OutfitSlot, string>>` prop shape —
  a future real try-on feature should extend this, not replace it.
- `Announcement`'s data shape and `getActiveAnnouncement()`'s signature.

### Build verification
Could not execute `npm run build` in this sandbox (no network access,
confirmed by a blocked npm registry call). In lieu of that, performed: a
full grep sweep for stale references to every removed field/context
(clean), a manual review of every new/changed file's type signatures
against the rest of the codebase, and the `Object.fromEntries` fix
documented above, found via the same manual process. Please run the build
locally and report back — the last three rounds of real build failures
were all found and fixed this way, so this is a proven (if imperfect)
substitute for this sandbox's lack of network access.

---

## Phase 4 — Build fix (post-delivery, pre-approval)

**Issue:** Vercel's `next build` failed at type-checking with a real error
in `components/admin/AdminShell.tsx:32`:

```
Type 'LucideIcon' is not assignable to type '... size?: number ...'
```

**Root cause:** `NavItem.icon` was hand-typed as
`ComponentType<{ size?: number; "aria-hidden"?: ... }>` — a narrower type
than Lucide's actual `LucideIcon` type, which accepts `size?: string |
number`. Assigning `LayoutDashboard`, `Boxes`, etc. (all `LucideIcon`) to
that narrower prop type failed structurally.

**Fix:** `components/admin/AdminShell.tsx` — imported `LucideIcon` from
`lucide-react` and retyped `NavItem.icon: LucideIcon` in place of the
hand-rolled `ComponentType<...>`. No other line in the file changed: both
render usages (`<Icon size={14} aria-hidden="true" />` and `<Icon
size={16} aria-hidden="true" />`) were already fully compatible with
`LucideIcon` and needed no adjustment. RBAC logic, the `NAV` array's
routes/roles/labels, and all other Phase 4 functionality are untouched.

**Consistency check:** searched the rest of the codebase for the same
hand-typed-icon pattern. `components/account/DashboardShell.tsx` (Phase 3)
has no explicit `NavItem` type at all — it lets TypeScript infer the shape
directly from the Lucide imports, which already resolves to `LucideIcon`
correctly. `AdminShell.tsx` was the only file with an overly-narrow
explicit type; it now matches the same correct, already-proven pattern.

**Verification:** could not run `npm run build` directly in this sandbox
(no network access, confirmed again by a blocked npm registry call), so
this is a manual structural-typing fix, cross-checked against Lucide's
actual exported `LucideIcon` type shape and against the one other file in
the project with the same navigation-icon pattern. Please run the build
and confirm.

---

## Phase 4 — Admin Portal

**Status:** Complete, pending review.

### Completed
- `AdminShell` (`components/admin/AdminShell.tsx`) — RBAC-filtered sidebar
  (desktop) / tab bar (mobile), following the exact structural pattern of
  Phase 3's `DashboardShell`. Renders a mock sign-in picker
  (`LoginPicker`) instead of admin content when nobody is "signed in."
- `RequireRole` (`components/admin/RequireRole.tsx`) — page-level guard
  used on Products, Promotions, Reviews, Reports, and Audit Logs, so
  navigating directly to a restricted URL shows a real "no access" state
  rather than just hiding the nav link.
- Seven new admin contexts (`lib/admin/*`), all following the established
  localStorage + hydration-guard pattern: `AdminAuthProvider` (RBAC
  session, 5 seeded admins across 3 roles), `AdminProductsProvider`,
  `AdminCustomersProvider`, `AdminPromotionsProvider`,
  `AdminReviewsProvider`, `AdminAuditProvider`, `AdminNotificationsProvider`.
- Ten pages under `app/admin/*`: Dashboard, Inventory, Products, Customers,
  Orders, Promotions, Reviews, Reports, Audit Logs, Notifications — the
  full list from the original brief's Phase 4 scope.
- `lib/orders/order-context.tsx` extended with `updateStatus(id, status)`
  — additive only, so the Admin Orders page can advance a real order's
  status without touching `addOrder` or the types Phase 3 already depends
  on.
- Real cross-context integration rather than isolated mock screens:
  - Dashboard and Reports compute all numbers live from `useOrders()`.
  - Admin Orders reuses Phase 3's `OrderTracker` component directly.
  - `AdminNotificationsProvider` watches `useOrders()` and generates a
    genuine notification the moment a new order is placed through the
    real storefront checkout (verified by placing a test order and
    confirming it appeared with an unread badge).
  - Every mutating admin action (stock adjustment, product add/remove,
    promotion create/toggle/remove, review approve/reject, order status
    change) calls `useAdminAudit().logAction()`, satisfying the Product
    Bible's "every action is logged" rule at the admin-portal level.
- Footer: added a discreet "Admin Portal" link for discoverability,
  without touching the primary customer navigation.
- 12 new offline-rendered preview PNGs, same headless-Chromium approach as
  every prior phase, captured across different signed-in roles to
  demonstrate RBAC filtering visually (e.g. the Orders mobile preview is
  captured as Staff Admin, showing a shorter tab bar than the Dashboard
  preview captured as Super Admin).

### Architecture decision: single app, not a separate `apps/admin`
The Master Development Guide's project structure sketches a monorepo with
`apps/web` and `apps/admin`. Phase 1 pragmatically built everything as one
Next.js app instead, and every phase since has continued that pattern.
Phase 4 does the same — `/admin` is a route tree in the existing app, not a
separate deployable — so the whole project keeps deploying to the single
existing Vercel project without a restructuring step. This is a carried-
forward deviation from Phase 1, not a new one, but flagged again here
explicitly since Phase 4 is the phase where the monorepo's admin/web split
would have mattered most.

### Assumptions made (flagging per your instruction to pause on ambiguity)
- **Admin product catalogue is not synced to the live storefront.**
  `AdminProductsProvider` seeds from the same `PRODUCTS` data but manages
  its own local, admin-scoped copy. Wiring admin edits back into the
  customer-facing storefront isn't just a missing feature — it's
  architecturally premature: some storefront pages (`/women`, `/men`,
  `/kids`) render server-side and read `PRODUCTS` at build/request time,
  so they structurally cannot read browser-local admin edits without a
  real backend to serve both consistently. Faking a partial client-side
  sync now would misrepresent the architecture rather than honestly defer
  it. Flagged clearly in both the Products page copy and here.
- **Customers page uses a mock directory** — real customer accounts don't
  exist until Phase 5's auth backend; explicitly labeled as illustrative
  in the page itself.
- **Reviews page moderates a mock dataset** — the Product Bible lists
  reviews as a core feature, but customer-facing review submission was not
  in this brief's Phase 2 scope and still isn't built. Building the
  moderation UI now (against illustrative data) lets that UX be reviewed
  ahead of wiring up real submission later, rather than waiting until both
  halves exist simultaneously.
- **RBAC role matrix** is my first-pass assignment, not specified in the
  source docs beyond "implement RBAC" and the three role names: Super Admin
  gets everything; Business Admin gets everything except Audit Logs; Staff
  Admin gets Dashboard/Inventory/Customers/Orders/Notifications only (no
  Products/Promotions/Reviews/Reports edit access). Flagged explicitly for
  your review — easy to adjust since it's centralized in one `NAV` array
  in `AdminShell.tsx` plus each page's `RequireRole` roles list.
- **No password/credential step in the mock admin login** — picking a
  seeded admin is one click, consistent with how every "local until Phase
  5" auth surface has worked since Family Shopping in Phase 2.

### Deviations
- None from the source documents beyond the single-app architecture
  decision carried forward from Phase 1 (see above).

### TypeScript strict-mode audit (continued practice from Phase 2/3 fixes)
Grepped every new Phase 4 file for array-indexing and `.find()` patterns
that could trip `noUncheckedIndexedAccess`:
- `ADMIN_SEED.find(...)` (used twice in `admin-auth-context.tsx`) — both
  already guarded with `?? null`.
- `app/admin/reports/page.tsx`'s `topProducts.sort((a, b) => b[1] - a[1])`
  — `a`/`b` are `[string, number]` tuples from `Map.entries()`, and fixed-
  length tuple indexing is exempt from `noUncheckedIndexedAccess` (same
  reasoning as the `swatch: [string, string]` tuple already in
  `lib/data/products.ts` since Phase 2) — confirmed safe, not just assumed.
- No other instances found.

### Not yet built (later phases)
- Real backend/API, real multi-admin authentication, unlimited admin
  accounts, real payments, real notifications, admin-storefront product
  sync (Phase 5)
- PWA service worker, deployment hardening, testing (Phase 6)

### Deployment note
No changes to `next.config.js` or dependencies. All new code uses the same
Next.js/React/Tailwind primitives already deployed successfully — should
deploy to the existing Vercel project the same way.

---

## Phase 3 — Build fix #2 (post-delivery, pre-approval)

**Issue reported:** Vercel's `next build` now reached the lint/type-check
step and failed on a real, build-blocking error:

```
./app/checkout/page.tsx
57:35  Error: `'` can be escaped with `&apos;`, ... react/no-unescaped-entities
```

**Fix:** `app/checkout/page.tsx` line 57 — `this order's status` inside a
JSX text node had a raw apostrophe. Changed to `this order&apos;s status`.
Nothing else on the page changed.

**Proactive check performed:** rather than fixing this one instance and
waiting for the next error to surface one at a time, searched every `.tsx`
file in `app/` and `components/` for the same pattern (contraction
apostrophes, straight double-quotes) sitting in actual JSX text content.
Found four other apostrophes containing similar substrings, but confirmed
each one sits inside either a `//` comment or a JS string literal (e.g. the
AI stylist's canned reply text, assigned to a `text:` property) — neither
of which `react/no-unescaped-entities` applies to, since the rule only
fires on literal JSX children, not code comments or string values. No
further changes needed for this rule.

**On the ESLint config still reportedly showing bare `no-unused-vars`:**
Re-inspected the actual committed `.eslintrc.json` and searched the whole
project tree for any other ESLint config source (`.eslintrc.*` variants,
`eslint.config.*` flat config, an `eslintConfig` key in `package.json`, an
`.eslintignore`, or ESLint settings in `next.config.js`). Found exactly one
config file, and its content already matches the Build fix #1 change from
the previous round (`no-unused-vars: off`,
`@typescript-eslint/no-unused-vars: warn`) — no duplicate or overriding
config exists anywhere in this project. If a real ESLint run still reports
the bare (unprefixed) `no-unused-vars` rule ID, that specific rule must
still be active, which — given the config here is correct — points to the
deployed repository not yet reflecting the `.eslintrc.json` and
`package.json` changes from the previous delivered zip, rather than a bug
in the config itself. Flagging this plainly rather than guessing further:
please diff the `.eslintrc.json` and `package.json` in this zip against
what's actually committed on the branch Vercel builds from.

---

## Phase 3 — Build fix #1 (post-delivery, pre-approval)

**Issue:** Vercel's `next build` failed with a wall of `no-unused-vars`
ESLint warnings against parameter names inside `interface` function-type
signatures (e.g. `updateProfile: (patch: Partial<Profile>) => void;` in
`ProfileContextValue`) across every context file in the project —
including Phase 1/2 files (`cart-context.tsx`, `family-context.tsx`,
`auth-context.tsx`, `address-context.tsx`), not just Phase 3's new ones.

**Root cause:** `.eslintrc.json` explicitly set `"no-unused-vars": "warn"`,
which re-enables the plain JavaScript ESLint rule. That rule has no concept
of TypeScript type positions, so it misreads a parameter name inside an
interface's function-type signature (a type-level declaration, not a real
variable binding) as an unused variable. The TypeScript-aware
`@typescript-eslint/no-unused-vars` rule — already bundled via
`eslint-config-next` — correctly excludes these type-only positions and
was being shadowed by the project's own config override.

**Fix:**
- `.eslintrc.json` — turned the base `no-unused-vars` off and enabled
  `@typescript-eslint/no-unused-vars` (`warn`, `argsIgnorePattern: "^_"`)
  in its place. No context file body was touched — this is a config-only
  fix, not a functional change, so notifications, orders, profile,
  style/outfit, and wishlist behavior is unchanged.
- `package.json` — added explicit `@typescript-eslint/eslint-plugin` and
  `@typescript-eslint/parser` devDependencies (`^6.21.0`, matching
  `eslint-config-next@14`'s expected range) rather than relying solely on
  their transitive resolution through `eslint-config-next`, removing any
  ambiguity about whether the rule can resolve during Vercel's install.

**Verification performed:** grepped every `*ContextValue` interface across
`lib/*/*.tsx` and confirmed the exact same type-signature-parameter pattern
in all nine context files, matching every line/column in the pasted Vercel
log. Could not execute `npm run build`/`eslint .` directly in this sandbox
(no network access — confirmed by a blocked npm registry call), so this is
a careful manual diagnosis rather than a locally-verified pass; please run
the build and flag immediately if anything else surfaces.

---

## Phase 3 — Customer Dashboard

**Status:** Complete, approved (reviewed on live Vercel deployment).

### Completed
- `DashboardShell` (`components/account/DashboardShell.tsx`) — one shared
  layout (sidebar nav desktop / scrollable tab bar mobile) wrapping all
  `/account/*` routes via `app/account/layout.tsx`, so every dashboard page
  automatically gets consistent navigation without repeating it per page.
- Five new persisted contexts, all following the exact localStorage +
  hydration-guard pattern established in Phase 1 (`ThemeProvider`) and
  reused throughout Phase 2: `ProfileProvider`, `AddressProvider`,
  `OrderProvider`, `NotificationProvider`, `StyleProvider`.
- `/account` (Overview/Profile), `/account/addresses`, `/account/orders`,
  `/account/loyalty`, `/account/notifications`, `/account/ai-stylist`,
  `/account/outfit-builder`, `/account/style-quiz` — all 8 pages listed
  for Phase 3 in the original brief (Profile, Addresses, Orders, Order
  Tracking, Loyalty, Notifications, AI Fashion Assistant, Outfit Builder,
  Style Quiz).
- `OrderTracker` (`components/account/OrderTracker.tsx`) — standalone
  4-step stepper (Placed → Processing → Shipped → Delivered), reused by
  the Orders page for every order.
- **Real integration with Phase 2, not parallel mock data:**
  `app/checkout/page.tsx` now calls `useOrders().addOrder()` on successful
  order placement instead of only generating a reference number. This
  means orders placed through the actual storefront checkout flow appear
  in Order History, feed the Order Tracking stepper, and drive the Loyalty
  points/tier calculation — the dashboard reflects real Phase 2 activity.
- Footer's "Order Tracking" and "Loyalty & Rewards" links, which pointed at
  non-existent routes since Phase 2, now point at the real dashboard pages;
  added a "My Account" entry to the same column.
- Navbar: added a "My Account" text link next to the existing "Sign in"
  button, in both desktop and mobile nav. This was deliberately additive —
  I initially replaced the Sign In button outright, then reconsidered
  since removing an approved, working nav element wasn't necessary to
  achieve discoverability; added alongside it instead.
- 12 new offline-rendered preview PNGs (same headless-Chromium approach as
  Phases 1–2), covering all 8 new pages, desktop + mobile, dark + light
  where applicable.

### Assumptions made (flagging per your instruction to pause on ambiguity)
- **Dashboard accessible without real login:** same reasoning as Family
  Shopping in Phase 2 — Phase 5 auth doesn't exist yet, so I built the
  full dashboard now with local persistence and a visible, shell-level
  notice ("saved locally... until Phase 5"), rather than blocking review
  of 8 pages of work behind a login wall that doesn't functionally exist
  yet. Flagging this the same way as before — let me know if you'd rather
  gate specific pages behind a "coming soon" state.
- **Order status defaults to "Processing":** there's no fulfillment
  backend yet to report real status, so every new order is mocked into
  "Processing" (rather than "Placed") so the tracker has something
  meaningful to visualize on first view. Phase 5 replaces this with real
  fulfillment events.
- **AI Fashion Assistant is a working keyword-match preview, not a stub:**
  rather than either building nothing or faking a "real AI" experience, I
  built an honest lightweight version — it matches user input against the
  actual `PRODUCTS` catalogue by category/name keywords, framed clearly in
  its own copy as a preview. Purple is used as the primary color here
  (not just an accent), which is a deliberate, brand-book-correct
  exception: §15 designates purple specifically for AI features.
- **Addresses are not yet wired into Checkout:** the address book
  (`/account/addresses`) and Checkout's shipping form are separate today.
  Connecting them (e.g. "use a saved address") is a reasonable Phase 4/5
  follow-up once a real backend exists to justify the added complexity now.
- **Outfit Builder uses tap-to-select, not drag-and-drop:** chosen for
  mobile usability and because a small catalogue doesn't need spatial
  arrangement — flagging in case a visual "canvas" style builder was
  expected instead.

### Deviations
- None from the source documents.

### Build-process note (caught during preview generation, not shipped)
While regenerating offline preview screenshots, an intermediate
`base.css` got recreated from scratch instead of appended to (the
`preview-src/` scratch folder had been deleted after Phase 2 packaging),
which briefly produced unstyled preview renders. Caught by visually
inspecting the first render before proceeding, rebuilt the complete
stylesheet, and re-rendered all 12 files — mentioning this because it's
exactly the kind of silent-looking failure this review workflow exists to
catch, and it worked as intended. This affected only local preview
generation, never the actual Next.js application source.

### TypeScript strict-mode audit (proactive, given the Phase 2 build fix)
Given the `noUncheckedIndexedAccess` error found and fixed in Phase 2
(`components/shop/ProductDetail.tsx`), every new Phase 3 file was checked
for the same pattern before delivery:
- `app/account/style-quiz/page.tsx` indexes `QUESTIONS[step]` and
  `RESULTS[...]` — both guarded (an early-return `if (!current) return
  null` for the former, a literal string fallback for the latter) rather
  than asserted away.
- `app/account/loyalty/page.tsx`'s tier lookup uses `.find(...) ?? {...
  fallback object}` rather than re-indexing a possibly-undefined array
  element.
- No other array-index or object-key access patterns that could trigger
  this rule were found in the new code.

### Not yet built (later phases)
- Admin portal + RBAC (Phase 4)
- Real backend/API, payments, notifications, real authentication,
  fulfillment-driven order status, real AI service (Phase 5)
- PWA service worker, deployment hardening, testing (Phase 6)

### Deployment note
No changes to `next.config.js` or dependencies beyond what Phases 1–2
already declared. All new code uses the same Next.js/React/Tailwind
primitives already deployed successfully — should deploy to the existing
Vercel project the same way.

---

## Phase 2 — Storefront

**Status:** Complete, approved (QA-tested on live Vercel deployment). One
post-delivery build fix applied (see below) — no functional or design
changes.

### Build fix (post-delivery)
Vercel's `next build` failed with a TypeScript error in
`components/shop/ProductDetail.tsx`: `product.sizes[0]` is `string |
undefined` under this project's own strict `noUncheckedIndexedAccess`
tsconfig setting (set in Phase 1, per the Master Development Guide's
"strict typing" standard), and that `undefined` was flowing unguarded into
`addItem()`. Fixed by declaring the `size` state explicitly as `string`
with a `""` fallback, and disabling "Add to Bag" (plus a no-op guard in the
handler) whenever no size is actually selected — covers the real edge case
of a product defined with an empty `sizes` array, not just the type error.
No types were weakened (`any` or non-null assertions) to make this pass;
audited the rest of the codebase for the same pattern and found no other
instances.

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
