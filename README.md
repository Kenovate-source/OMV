# OMV — Overcomers Multipurpose Ventures

Premium family fashion e-commerce platform. Phase 1 (Foundation) build.

## Stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS

## Getting started
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Structure
```
app/                 routes (App Router)
  (auth)/login        sign-in page
  (auth)/register     account creation page
  layout.tsx          root shell: fonts, theme + auth providers, nav/footer
  page.tsx            landing page
  globals.css         design tokens (dark + light theme CSS variables)
components/
  layout/             Navbar, Footer
  theme/              ThemeProvider, ThemeToggle
  ui/                 Button, Input, Card, ProductCard
lib/
  auth/               auth context (stubbed — wires to NestJS API in Phase 5)
  cn.ts               classnames utility
public/brand/         approved logo assets (favicon, app icon, full lockup)
```

See `IMPLEMENTATION_LOG.md` for decisions, assumptions, and what's next.
