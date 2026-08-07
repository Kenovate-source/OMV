# Changelog

All notable changes to the OMV project are documented here, newest first.

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
