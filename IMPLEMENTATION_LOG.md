# OMV Implementation Log

This log is updated at the end of every development phase. It records
technical decisions, assumptions, deviations from the source documents, and
completed milestones so the project stays easy to maintain and hand over.

---

## Phase 1 — Foundation

**Status:** Complete, pending review.

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
