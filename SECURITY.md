# Security Policy

## Reporting a vulnerability

Please report privately. Do not open a public issue or pull request with the details.

- **[Open a private security advisory](https://github.com/henetiriki/portfolio/security/advisories/new)** — the fastest route, and the details stay private. Needs a GitHub account.
- **[Contact form](https://www.ouwl.house/contact)** — if you would rather not use GitHub.

Please allow a reasonable window for a fix before sharing details elsewhere. This is a personal portfolio site maintained by one person, so expect a human response time rather than a triage process. There is no bug bounty.

## Scope

The live site at [www.ouwl.house](https://www.ouwl.house) and this repository.

Two things are known and deliberate rather than worth reporting: the Content Security Policy carries `'unsafe-inline'` on `script-src` and `style-src`, and `/api/csp-report` is unauthenticated because browsers post violation reports without JavaScript. Both are explained in [docs/security.md](docs/security.md).

## Supported versions

There is one deployed version — whatever is currently on `main`, which Vercel deploys automatically. There are no releases, tags or version numbers, so there is nothing older still in support.

## What this file is not

[docs/security.md](docs/security.md) describes the site's security surface — response headers, the Content Security Policy, bot protection and how secrets are handled. It is documentation for whoever maintains this, not a reporting policy, and GitHub was previously surfacing it in this file's place.
