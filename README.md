# Portfolio [![CI](https://github.com/henetiriki/portfolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/henetiriki/portfolio/actions/workflows/ci.yml) [![Dependabot Updates](https://github.com/henetiriki/portfolio/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/henetiriki/portfolio/actions/workflows/dependabot/dependabot-updates)

Personal portfolio and CV site for Louw Swart — live at **[www.ouwl.house](https://www.ouwl.house)**.

Four content pages (Home, Experience, Portfolio, Travel) plus a Contact page that emails the owner, an interactive Google Map of places travelled, and an opt-in PWA.

| Concern             | Choice                                                       |
| ------------------- | ------------------------------------------------------------ |
| **Framework**       | Next.js 16 (Pages Router) + React 19 + TypeScript (`strict`) |
| **UI**              | Mantine v9, styled with CSS Modules + CSS variables          |
| **Hosting**         | Vercel (auto-deploys `main`)                                 |
| **Testing**         | Jest + React Testing Library, Playwright + axe (browser)     |
| **Package manager** | Yarn 4 (Berry)                                               |
| **Node**            | `24.x` (pinned in [.nvmrc](.nvmrc))                          |

## Getting Started

Requires Node `24.x` and Corepack-enabled Yarn 4.

```bash
nvm use
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

The app needs environment variables to run — a Google Maps key, Gmail SMTP credentials for the contact form, and an image host. See [docs/environment-variables.md](docs/environment-variables.md) for the full list and which ones are required where.

## Scripts

| Script                                      | Purpose                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `yarn build`                                | Production build (webpack), then `next-sitemap` (sitemap + robots.txt) |
| `yarn clean`                                | Wipe the build cache (`.next`)                                         |
| `yarn css-vars:check` / `css-vars:generate` | Verify / regenerate the WebStorm CSS-variable stub from `colors.ts`    |
| `yarn dev`                                  | Dev server (Turbopack) with the Node inspector attached                |
| `yarn eslint:check` / `eslint:write`        | Lint / lint and autofix                                                |
| `yarn prettier:check` / `prettier:write`    | Format check / write                                                   |
| `yarn start`                                | Serve a production build locally                                       |
| `yarn test`                                 | Jest + React Testing Library                                           |
| `yarn test:coverage`                        | Tests with coverage (80% global threshold)                             |
| `yarn test:e2e`                             | Playwright browser regression suite (needs a build; serves on :3000)   |
| `yarn test:e2e:install`                     | Fetch the Playwright browser binary (install scripts are disabled)     |
| `yarn test:e2e:ui`                          | Browser suite in Playwright's interactive runner                       |
| `yarn test:watch`                           | Tests in watch mode                                                    |
| `yarn type-check`                           | `tsc --noEmit`                                                         |

Every production build generates the Serwist service worker; `yarn dev` never does. There is no flag to set.

## Project Layout

```
src/
  components/   Feature-grouped components (content, experience, footer, form, nav, shared, travel)
  containers/   Layout
  fixtures/     Static content and data authored as TypeScript/JSX
  hooks/        Reusable hooks
  pages/        Routes + pages/api endpoints
  server/       Server-only contact-form logic
  state/        Global Context + reducer
  styles/       Mantine theme, colour palette, global CSS
  utils/        Small helpers and test utilities
docs/           Living documentation (see below)
e2e/            Playwright browser regression suite
service-worker/ Serwist service worker source
```

Unit tests live in `__tests__/` folders beside the code they cover — except page and API tests, which mirror into `src/__tests__/pages/` so Next doesn't treat them as routes. Browser tests live separately in `e2e/`, because they exercise the built site rather than any single module.

## Documentation

Full documentation lives in **[docs/](docs/README.md)** — architecture, routing, state, components, the travel and contact features, styling, PWA/SEO, environment variables, and the development workflow.

Useful starting points:

- **[Development Workflow](docs/development.md)** — scripts, linting, testing conventions, git hooks
- **[Release Checklist](docs/release-checklist.md)** — how a change gets to production
- **[AGENTS.md](AGENTS.md)** — working conventions for AI coding agents (environment, shell hygiene, docs discipline)
- **[Engineering Decisions](docs/decisions.md)** — durable technical choices and why they were made
- **[Roadmap](docs/roadmap.md)** — open work and known follow-ups
- **[Project History](docs/project-history.md)** — concise record of completed milestones

## Deploying

There are no versions, tags, or release artefacts. A change ships by squash-merging a PR into `main`, which Vercel deploys automatically. [Project History](docs/project-history.md) is the concise release record, while the [Roadmap](docs/roadmap.md) contains open work only. Follow the [release checklist](docs/release-checklist.md) — CI runs the production build and asserts it emits a service worker.
