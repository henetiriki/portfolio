# Portfolio [![CI](https://github.com/henetiriki/portfolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/henetiriki/portfolio/actions/workflows/ci.yml) [![Dependabot Updates](https://github.com/henetiriki/portfolio/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/henetiriki/portfolio/actions/workflows/dependabot/dependabot-updates) [![codecov](https://codecov.io/github/henetiriki/portfolio/graph/badge.svg?token=R6HYNAXNKX)](https://codecov.io/github/henetiriki/portfolio)

Personal portfolio and CV site for Louw Swart — live at **[www.ouwl.house](https://www.ouwl.house)**.

Four content pages (Home, Experience, Portfolio, Travel) plus a Contact page that emails the owner, an interactive Google Map of places travelled, and an installable PWA.

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

The app needs maintainer-supplied development configuration to run. Do not commit credentials or production configuration; see [Runtime Configuration](docs/environment-variables.md) for safe handling guidance.

## Scripts

Every `package.json` script is documented in [Development Workflow](docs/development.md#scripts-packagejson).

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

Full documentation lives in **[docs/](docs/README.md)** — architecture, routing, state, components, the travel and contact features, styling, PWA/SEO, security, environment variables, and the development workflow.

Useful starting points:

- **[Development Workflow](docs/development.md)** — scripts, linting, testing conventions, git hooks
- **[CI & Deploys](docs/ci-and-deploys.md)** — what CI runs, what skips a deploy, and how to roll back
- **[AGENTS.md](AGENTS.md)** — working conventions for AI coding agents (environment, shell hygiene, docs discipline)
- **[Roadmap](docs/roadmap.md)** — open work and known follow-ups

## Contributing and reuse

Pull requests are not accepted and issues are disabled — this is one person's CV rather than a project seeking contributors. Security problems and factual errors are welcome through the [contact form](https://www.ouwl.house/contact). See [CONTRIBUTING.md](CONTRIBUTING.md).

The source is published to be read, not copied: no licence is granted and all rights are reserved. See [LICENSE](LICENSE).

## Deploying

There are no versions, tags, or release artefacts. A change ships by squash-merging a PR into `main`, which Vercel deploys automatically, so the [merged pull requests](https://github.com/henetiriki/portfolio/pulls?q=is%3Apr+is%3Amerged) are the release record and the [Roadmap](docs/roadmap.md) contains open work only. CI runs the production build and asserts it emits a service worker; what else runs, and what skips a deploy entirely, is on [CI & Deploys](docs/ci-and-deploys.md).
