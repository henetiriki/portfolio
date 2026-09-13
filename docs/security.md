# Security

This site uses layered protections appropriate to a small public portfolio: browser security headers, a Content Security Policy, server-side validation and abuse protection on contact submissions, dependency updates, code scanning, and review before deployment.

This page intentionally describes the public-facing posture. Exact configuration, provider controls, operational checks, monitoring coverage, and security decisions are maintained privately.

## Browser protections

Every route sends modern browser security headers. The Content Security Policy limits the browser capabilities and external resources the application needs, while the remaining headers reduce common browser-side risks such as framing, MIME-type confusion, and unnecessary hardware access.

The policy is enforced. Any change to a third-party integration, service worker, or browser capability is tested against the production-like preview before it is deployed.

### Response headers

Header configuration is reviewed and regression-tested as a group.

### Content Security Policy

The policy authorises the resources the application needs and is reviewed whenever an integration changes.

### Browser coverage

Browser tests confirm that expected protections are delivered to the site's content routes. Manual preview review complements the automated checks for integration changes.

## Contact protection

Contact submissions are validated and handled on the server. The site applies automated-abuse protection before delivery work, bounds and safely handles submitted content, returns stable public errors, and avoids logging user content or provider error details.

## Dependency and code review

Automated dependency updates and code scanning support normal code review. They are not a substitute for testing, preview review, or checking deployment configuration when an integration changes.

### Code scanning (CodeQL)

Code scanning is enabled as a supporting control.

## Configuration and secrets

See [Runtime Configuration](environment-variables.md) for credential storage and browser-visible identifiers.

Before publishing, review the staged diff for secrets and sensitive personal data. Removing an accidentally committed credential in a later commit does not remove it from history; rotate or revoke it promptly instead.

## Reporting a vulnerability

See the repository's [security policy](../SECURITY.md) for private reporting routes.
