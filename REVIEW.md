# OMV — Phase 1 Design Review

**Phase:** 1 — Foundation
**Status:** Awaiting your approval

This document walks through every screen built in Phase 1: what it's for, the
UX decisions behind it, which reusable components it's built from, and how it
behaves across devices and themes. Full-resolution PNGs are in `/preview`.

---

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

## What still needs your review

- Do the dark/light color choices read as "premium boutique" to you, or
  does anything feel off?
- Typeface pairing (Playfair Display headings / Inter body) — placeholder
  choice, flagged in `IMPLEMENTATION_LOG.md`.
- Copy tone on the landing page (hero line, pillar descriptions) — first
  full pass, open to edits.
- Anything missing from Phase 1's scope before Phase 2 begins.
