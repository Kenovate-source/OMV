# OMV — Design Review

**Phase 1 (Foundation):** ✅ Approved — live at https://omv-iota.vercel.app/
**Phase 2 (Storefront):** ✅ Approved
**Phase 3 (Customer Dashboard):** Awaiting your approval

This document walks through every screen built so far: what it's for, the
UX decisions behind it, which reusable components it's built from, and how it
behaves across devices and themes. Full-resolution PNGs are in `/preview`.

---

# Phase 2 — Storefront

## 4. Catalogue (Women / Men / Kids)

**Purpose:** Browse and narrow down products within a category. Same
component (`CatalogueView`) powers all three category routes so filter
behavior and layout stay identical across `/women`, `/men`, `/kids`.

### Desktop — Dark theme
![Catalogue dark desktop](preview/catalogue-women-dark.png)

### Desktop — Light theme
![Catalogue light desktop](preview/catalogue-women-light.png)

### Mobile
![Catalogue mobile](preview/mobile-catalogue.png)

**UX decisions**
- No real photography yet (same decision as Phase 1's landing page), so each
  product tile uses a brand-toned gradient placeholder instead of a stock
  photo or broken image icon — it reads as an intentional, elegant "coming
  soon" treatment rather than a bug.
- Filters are collection badge (New / Family Set / Premium), size, and sort
  — deliberately not sprawling; the Brand Book calls for "less clutter."
  Sidebar collapses to sit above the grid on mobile.
- Wishlist heart sits directly on each tile so saving an item never requires
  opening the product page first.

**Components used:** `CatalogueView`, `FilterSidebar`, `ProductTile`, `Card`.

**Accessibility:** filter chips are real `<button>`s with visible active
state (color, not just an icon); size filter uses the primary color to stay
visually distinct from the badge filter's gold so the two facets aren't
confusable at a glance.

**Responsive behavior:** 3-column grid (desktop) → 2-column (mobile).
Sidebar becomes a stacked block above the grid below `lg`.

---

## 5. Product Detail Page

**Purpose:** Convert interest into an add-to-cart decision, and surface
"Complete the Look" pairings to increase basket size — a named USP in the
Brand Book.

### Desktop — Dark theme
![PDP dark desktop](preview/product-detail-dark.png)

### Desktop — Light theme
![PDP light desktop](preview/product-detail-light.png)

### Mobile
![PDP mobile](preview/mobile-product-detail.png)

**UX decisions**
- Size selection uses a real `role="radiogroup"` of buttons, not a
  `<select>` — sizes are a primary decision, not a secondary setting, so
  they deserve full visual weight.
- "Add to Bag" gives inline confirmation ("Added to bag ✓") for two seconds
  rather than a toast, keeping the action feedback anchored to where the
  user's attention already is.
- "Complete the Look" pulls real related products from the catalogue data
  (`completeTheLook` product-id references) rather than a generic "you may
  also like" — it's the specific styling pairing the Brand Book describes.

**Components used:** `ProductDetail` (client) + `ProductTile` for the
related-items row, `Button`.

**Accessibility:** size buttons expose `role="radio"`/`aria-checked`; the
wishlist toggle button has a state-aware `aria-label` and `aria-pressed`.

**Responsive behavior:** two-column (image + info) collapses to a single
stacked column below `lg`; size and colour rows wrap naturally at any width.

---

## 6. Wishlist

**Purpose:** A holding space for items a customer isn't ready to buy yet —
persists across visits (stored locally for now; will move to the account
API in Phase 5).

### Desktop
![Wishlist dark desktop](preview/wishlist-dark.png)

**UX decisions:** Empty state routes straight back into `/women` rather
than a dead end — never leaves the customer with nowhere to go.

**Components used:** `ProductTile` (same tile as the catalogue, so hearts,
badges and pricing behave identically everywhere).

**Accessibility:** heart buttons are `aria-pressed`, with a label that
states current state ("Remove X from wishlist" vs "Add X to wishlist").

**Responsive behavior:** 4-column grid → 2-column on mobile, same grid
system as the catalogue.

---

## 7. Cart

**Purpose:** Review and adjust everything before checkout — quantities,
sizes, removal — with a persistent running total.

### Desktop
![Cart dark desktop](preview/cart-dark.png)

### Mobile
![Cart mobile](preview/mobile-cart.png)

**UX decisions**
- Quantity stepper instead of a free-text field — fewer invalid states,
  faster to use on mobile.
- Order summary is sticky-positioned in its own column on desktop so the
  total and checkout button are always visible while reviewing line items.
- Empty-state again routes back into shopping rather than showing a bare
  "no items" message.

**Components used:** custom cart list (built directly in `app/cart/page.tsx`
against `useCart()`), `Button`.

**Accessibility:** quantity value is `aria-live="polite"` so screen-reader
users hear the updated count after +/-; every icon-only control has an
`aria-label` naming the specific product it acts on.

**Responsive behavior:** summary column moves below the line-item list on
mobile instead of sitting beside it.

---

## 8. Checkout

**Purpose:** Capture shipping details and confirm the order. Payment
gateway integration is explicitly out of scope for Phase 2 (that's Phase 5's
NestJS + payment gateway work) — this proves the *flow* end to end.

### Desktop — Form
![Checkout form dark desktop](preview/checkout-dark.png)

### Desktop — Confirmation
![Checkout confirmation dark desktop](preview/checkout-confirmation-dark.png)

**UX decisions**
- The payment section is visibly marked as a placeholder (dashed border,
  explanatory copy) rather than a fake-looking card form — I did not want
  to build something that *looks* like it processes real payment when it
  doesn't.
- Placing an order generates a local reference number and clears the cart,
  so you can test the complete "browse → cart → checkout → confirmation"
  loop today, before Phase 5 wires it to a real orders API.

**Components used:** `Input`, `Button`, order-summary pattern shared
visually with the Cart page.

**Accessibility:** every shipping field has a real label and appropriate
`autoComplete` hint (`name`, `tel`, `street-address`, etc.) for autofill and
screen readers alike.

**Responsive behavior:** form fields go from a 2-column grid to a single
column below `lg`; order summary moves below the form on mobile.

---

## 9. Family Shopping

**Purpose:** Let a customer build lightweight profiles for family members
(name, relation, size notes) and mark one as "active" while shopping — the
Brand Book's signature family-first differentiator.

### Desktop
![Family shopping dark desktop](preview/family-shopping-dark.png)

**UX decisions**
- I added an explicit, visible note that profiles are browser-local until
  Phase 5's real authentication ships — the PRD requires login for family
  profiles, but building the full auth-gated version now would block you
  from reviewing the feature at all. Flagging this as a deliberate,
  temporary decision rather than silently building around the requirement.
- "Active" profile is a single click on the card itself (not a separate
  button), since switching who you're shopping for should feel as light as
  it is conceptually.

**Components used:** `Card`, `Input`, `Button`, `useFamily()` context.

**Accessibility:** each member card's primary click target is a real
`<button>` covering the name/relation text; delete action is a separately
labelled icon button so the two actions can't be mis-tapped for each other.

**Responsive behavior:** two-column (list + add-form) collapses to a single
stacked column below `lg`.

---

# Phase 3 — Customer Dashboard

All eight pages below live under `/account`, sharing one `DashboardShell`
(sidebar nav on desktop, scrollable tab bar on mobile) so the section reads
as one cohesive product rather than eight separate features bolted
together. Every page carries the same "saved locally until Phase 5 auth"
notice at the top — stated once by the shell, not repeated per page.

## 10. Account Overview (Profile)

**Purpose:** Home base for the dashboard — quick stats (orders, wishlist,
loyalty points) and editable personal details.

### Desktop — Dark theme
![Account overview dark](preview/account-overview-dark.png)

### Desktop — Light theme
![Account overview light](preview/account-overview-light.png)

### Mobile
![Account overview mobile](preview/mobile-account-overview.png)

**UX decisions:** the three stat cards are clickable shortcuts into Orders,
Wishlist and Loyalty rather than static numbers — the overview page's job
is to route you deeper, not just report at you.

**Components used:** `Card`, `Input`, `Button`, `useProfile()`,
`useOrders()`, `useWishlist()`.

**Accessibility:** stat card links carry a descriptive `aria-label`
("2 orders") in addition to the visible number+label pairing.

**Responsive behavior:** stat cards go 3-column → 1-column; sidebar becomes
the mobile tab bar (see the dashboard shell note above).

---

## 11. Addresses

**Purpose:** A reusable address book so checkout doesn't require retyping
shipping details every time (checkout itself still collects the address
inline for now — this is the saved book, wiring the two together is a
natural Phase 4/5 follow-up once real order flows exist).

### Desktop
![Addresses dark](preview/account-addresses-dark.png)

**UX decisions:** the first address saved is automatically marked default;
a star icon lets you promote any other one — no separate "edit" flow needed
for the common case of just changing which address is primary.

**Components used:** `Card`, `Input`, `Button`, `useAddresses()`.

**Accessibility:** default/remove/star actions all have descriptive
per-address `aria-label`s (e.g. "Remove Office address") rather than a
generic label repeated across cards.

**Responsive behavior:** list + add-form (2 columns) collapses to a single
column below `lg`.

---

## 12. Orders (with Order Tracking)

**Purpose:** Real order history — and this is genuinely real, not a mock
page: every order placed through the actual Phase 2 checkout flow now
appears here automatically.

### Desktop
![Orders dark](preview/account-orders-dark.png)

### Mobile
![Orders mobile](preview/mobile-account-orders.png)

**UX decisions:** each order gets a 4-step visual tracker (Placed →
Processing → Shipped → Delivered). New orders start at "Processing" — a
mocked but realistic mid-flight state, since Phase 5's real fulfillment
events don't exist yet to drive this honestly. Flagged clearly in the
implementation log.

**Components used:** `Card`, `OrderTracker` (new — a small standalone
stepper component), `useOrders()`.

**Accessibility:** the tracker is a labelled `role="list"` announcing
overall status ("Order status: Processing"), not just a row of colored
circles.

**Responsive behavior:** tracker steps wrap naturally; order cards stack
full-width on mobile.

---

## 13. Loyalty & Rewards

**Purpose:** Show the customer's tier and points, calculated from their
real local order history (1 point per ₦1,000 spent) rather than a static
number — placing an order and then checking this page shows a real change.

### Desktop
![Loyalty dark](preview/account-loyalty-dark.png)

**UX decisions:** three tiers (Member/Gold/Heritage) shown side by side
with the current one highlighted in gold, plus a "X pts to next tier"
nudge — makes the loyalty ladder visible rather than abstract.

**Components used:** `Card`, `useOrders()` (points are derived, not
separately stored — one source of truth).

**Accessibility:** points/tier are presented as plain text, not
color-only — screen readers get the same information sighted users do.

**Responsive behavior:** tier cards go 3-column → 1-column below `sm`.

---

## 14. Notifications

**Purpose:** Channel preferences (Email/SMS/WhatsApp/Push) — the PRD lists
all four channels; this is where a customer controls them.

### Desktop
![Notifications dark](preview/account-notifications-dark.png)

**UX decisions:** real toggle switches with `role="switch"`, not checkboxes
styled to look like toggles — matters for both screen readers and for
correctness (a switch and a checkbox have different expected keyboard
behavior).

**Components used:** `useNotificationPrefs()`.

**Accessibility:** every switch has `aria-checked` reflecting live state
and a channel-specific `aria-label`.

**Responsive behavior:** single-column list at all sizes — nothing here
benefits from a wider layout.

---

## 15. AI Fashion Assistant

**Purpose:** The Brand Book's named AI feature — implemented here as an
honest, working preview: a simple keyword-matching chat against the real
product catalogue, clearly framed as a preview rather than pretending to be
the full Phase 5 AI service.

### Desktop
![AI stylist dark](preview/account-ai-stylist-dark.png)

### Mobile
![AI stylist mobile](preview/mobile-account-ai-stylist.png)

**UX decisions:** purple is used for the assistant's chat bubbles and
header icon, consistent with Brand Book §15 ("purple = AI features"); this
is the one place in the whole product where purple is a primary color
rather than an accent, which is intentional and matches the brand rule
precisely. Suggested products render as small cards inline in the
conversation rather than as a separate results list, keeping the
interaction feeling conversational.

**Components used:** custom chat UI built directly against `PRODUCTS` data
(no new context needed — conversation state is page-local, not persisted,
since it's a preview interaction rather than a saved asset).

**Accessibility:** the message list is `aria-live="polite"` so new replies
are announced; the input has a visually-hidden label.

**Responsive behavior:** message bubbles and product-suggestion cards wrap
naturally; layout otherwise unchanged from desktop.

---

## 16. Outfit Builder

**Purpose:** Manually compose an outfit from any pieces in the catalogue
(not just pre-set "Complete the Look" pairings) and save it for later —
the PRD's Outfit Builder feature.

### Desktop
![Outfit builder dark](preview/account-outfit-builder-dark.png)

**UX decisions:** selection is a simple tap-to-toggle on any product tile
(gold border = selected) rather than a drag-and-drop canvas — far more
usable on mobile, and honestly just as fast for building a look from a
small catalogue. A running total and save bar appears only once something
is selected, so the empty state stays clean.

**Components used:** `Card`, `Button`, `useStyle()` (new — saved outfits
context).

**Accessibility:** each tile is a real `<button>` with `aria-pressed` and
a state-aware label ("Add X to outfit" / "Remove X from outfit").

**Responsive behavior:** 4-column grid → 2-column on mobile.

---

## 17. Style Quiz

**Purpose:** A short quiz producing a style profile — feeds into (a) a
personalized-feeling result shown here and (b) a stored preference other
features can reference later (e.g. a real AI service in Phase 5).

### Desktop (in progress)
![Style quiz dark](preview/account-style-quiz-dark.png)

**UX decisions:** result is shown immediately and persists — returning to
this page later shows your existing profile with a "Retake" option, rather
than forcing the quiz again every visit.

**Components used:** `Button`, `useStyle()`.

**Accessibility:** one question at a time with a clear "Question X of Y"
progress indicator; answer options are full-width buttons, not a
radio-button list, for a larger touch target.

**Responsive behavior:** single-column at all sizes — a quiz doesn't
benefit from extra width.

---

## What still needs your review (Phase 3)

- **Order Tracking's "Processing" default status** — every order starts
  there since there's no real fulfillment backend yet to report actual
  status. Confirm you're comfortable with this mock default ahead of
  Phase 5's real status events.
- **Account dashboard accessible without real login** — same interim
  approach as Family Shopping in Phase 2: browser-local storage with a
  visible notice, so the full experience is reviewable now. Let me know if
  you'd rather gate any specific page behind a "coming soon" state instead.
- **AI Fashion Assistant as keyword-matching preview** — confirm this
  honestly-scoped-down version is the right approach for now versus, say,
  not shipping the page at all until Phase 5.
- **Addresses not yet wired into Checkout's address form** — they're
  separate today (Checkout still collects address inline). Flag if you'd
  like that connected now rather than later.
- Anything missing from Phase 3's scope before Phase 4 begins.

---

# Phase 1 — Foundation (approved)

## 1. Home / Landing Page

**Purpose:** First impression of the brand. Establishes the "boutique, not
marketplace" positioning before any product catalogue exists, and routes
people toward shopping or family-account creation.

### Desktop — Dark theme (primary)
![Home dark desktop](preview/home-dark.png)

### Desktop — Light theme
![Home light desktop](preview/home-light.png)

### Mobile
![Home mobile](preview/mobile-home.png)

### Mobile menu (open state)
![Mobile menu](preview/mobile-menu.png)

**UX decisions**
- Hero leads with the full logo lockup and the official tagline, not a
  generic banner — the brand *is* the opening statement.
- No stock photography. The Brand Book explicitly rejects generic stock
  images, and no real product/lifestyle photography has been supplied yet —
  showing placeholder photos would misrepresent the eventual brand.
- Four "brand pillar" cards (Family Shopping, Complete the Look, AI Fashion
  Assistant, Loyalty) instead of a product grid — Phase 1 has no catalogue
  yet, so the page sells the *experience*, not products.
- Purple is used only on the AI Fashion Assistant icon (Brand Book §15:
  purple = AI features only). Gold appears only in the eyebrow label and
  trust-strip headlines — deliberately sparing use per "don't overuse gold."

**Components used:** `Navbar`, `Footer`, `Card` / `CardTitle` / `CardDescription`, `Button` (primary + outline variants).

**Accessibility**
- Skip-to-content link (visible on keyboard focus).
- All icon-only buttons (search, wishlist, bag, theme toggle, menu) have
  `aria-label`s.
- Mobile menu button has `aria-expanded` / `aria-controls`.
- Heading hierarchy: one `h1` (hero), `h2`s for each section, `h3`s for
  pillar card titles.

**Responsive behavior:** Desktop nav collapses to a hamburger + slide-down
mobile menu below the `lg` breakpoint. Pillar grid: 4 columns → 2 → 1. Hero
button row stacks vertically on mobile. Footer link columns stack to a single
column.

---

## 2. Sign In

**Purpose:** Authenticate returning customers. Gated only where the PRD
requires login (checkout, wishlist, orders, family profiles, AI
personalization) — browsing itself never requires this page.

### Desktop — Dark theme
![Login dark desktop](preview/login-dark.png)

### Desktop — Light theme
![Login light desktop](preview/login-light.png)

### Mobile
![Login mobile](preview/mobile-login.png)

**UX decisions**
- Email/Phone tab switcher matches the PRD's requirement to support both
  login methods without splitting them into separate pages.
- "Remember me" defaults **on** — most returning customers want to stay
  signed in on their own device; unchecking is one click.
- Full logo lockup appears here (an approved usage location) to keep the
  auth flow feeling like part of the same boutique experience, not a bare
  utility form.

**Components used:** `Input` (labelled, with `aria-describedby` wiring),
`Button`, tab control (native `role="tablist"`/`role="tab"`).

**Accessibility**
- Every input has a real, associated `<label>` (not a placeholder standing
  in for one).
- Password field uses `autoComplete="current-password"`; email uses
  `autoComplete="email"`.
- Form errors are wired to `role="alert"` and `aria-invalid` (not yet visible
  here since there's no backend to reject input against — the wiring exists
  in `components/ui/Input.tsx` for Phase 5).

**Responsive behavior:** Single-column form at all sizes by design — a
sign-in form does not need a wider layout. Nav collapses the same way as the
home page below `lg`.

---

## 3. Create Account

**Purpose:** New customer registration — the entry point into the loyalty,
wishlist and family-profile features.

### Desktop — Dark theme
![Register dark desktop](preview/register-dark.png)

### Desktop — Light theme
![Register light desktop](preview/register-light.png)

**UX decisions**
- Deliberately short (name, email, password) — family member profiles and
  address details are collected later in the dashboard (Phase 3), not
  front-loaded here where they'd raise drop-off risk.
- Password field carries a plain-language hint ("At least 8 characters")
  instead of a strength meter, matching the calm, non-intrusive tone the
  Brand Book asks for.

**Components used:** Same `Input` / `Button` set as Sign In, for visual and
behavioral consistency between the two auth flows.

**Accessibility:** Same pattern as Sign In — labelled fields, `autoComplete`
hints (`name`, `email`, `new-password`).

**Responsive behavior:** Same single-column, centered layout at all sizes.

---

## Theme system (applies to every page above)

Dark is the default/primary brand experience (Brand Book). Light is derived
from the same palette — warm parchment instead of white, deep-emerald ink
instead of black, no bright green anywhere, gold deepened slightly for
contrast on light surfaces. Every screen above was captured in both modes
except the two auth pages' mobile views, which follow the identical layout
already shown for Home.

## Phase 2 review notes (for reference — already approved)

- Product placeholder treatment (gradient tiles), Family Shopping's
  pre-login interim state, and checkout's placeholder payment section were
  all reviewed and approved as part of Phase 2 sign-off.

## Phase 1 review notes (for reference — already approved)

- Dark/light color choices, typeface pairing, and landing-page copy were
  all approved as part of Phase 1 sign-off.
