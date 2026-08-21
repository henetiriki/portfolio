# Documentation

Specs describing the current implementation of Louw Swart's personal portfolio site. These documents describe **what exists today**, not a design proposal — treat the source as the authority if anything drifts out of sync, and correct the drift rather than working around it. Keeping them accurate is part of shipping a change: the [release checklist](release-checklist.md#documentation-sweep) makes the sweep a required step in both directions.

## Contents

- [Architecture](architecture.md) — tech stack, directory layout, request lifecycle, path aliases
- [Pages & Routing](pages-and-routing.md) — every route, its purpose, and the redirects in `next.config.js`
- [State Management](state-management.md) — the single global `PortfolioState` context/reducer
- [Components](components.md) — component catalog grouped by feature area
- [Travel / Google Maps Feature](travel-feature.md) — how the interactive map, markers and polylines work
- [Contact Feature](contact-feature.md) — form validation, spam handling, and the Nodemailer-based email flow
- [Styling & Theming](styling-theming.md) — Mantine theme, custom color palette, CSS Modules setup
- [PWA & SEO](pwa-seo.md) — manifest, service worker, meta tags, sitemap/robots
- [Security](security.md) — response headers, Content Security Policy, bot protection, code scanning, secrets
- [Environment Variables](environment-variables.md) — every `process.env` value the app reads
- [Development Workflow](development.md) — scripts, linting, formatting, git hooks
- [Release Checklist](release-checklist.md) — how a change gets from a feature branch to production
- [Roadmap](roadmap.md) — open work, known issues, and planned upgrades
- [Engineering Decisions](decisions.md) — durable technical choices and their rationale
- [Project History](project-history.md) — concise record of completed milestones

## At a glance

- **Framework**: Next.js 16 (Pages Router) + React 19 + TypeScript 6, strict mode
- **UI kit**: Mantine v9 (`@mantine/core`, `form`, `hooks`, `notifications`) styled via CSS Modules + CSS variables
- **Purpose**: a single-person portfolio/CV site with four content pages (Home, Experience, Portfolio, Travel) and a Contact page that emails the owner
- **Notable integrations**: Google Maps JS API (travel map), Vercel BotID (bot/spam protection on the contact form), Nodemailer over Gmail SMTP, Serwist (PWA/service worker, generated in every production build), `next-sitemap`
- **State**: one `useReducer`-backed React Context (`PortfolioState`) shared app-wide — no Redux/Zustand/query library
- **Testing**: Jest + React Testing Library for units (full coverage, 95% enforced floor), Playwright + axe for browser behaviour jsdom cannot see — see [Development Workflow](development.md#testing)
- **Package manager**: Yarn 4 (Berry), Node `24.x`
