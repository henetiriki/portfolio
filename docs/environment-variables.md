# Runtime configuration

The application reads deployment configuration for its public site origin, media and map integrations, contact delivery, and optional local build analysis. The exact configuration inventory, exposure classification, and deployment procedure are maintained privately.

## Safe handling

- Keep credentials and server-only configuration in untracked local configuration or the hosting platform's secret store.
- Values deliberately exposed to browser code are public identifiers, not secrets. Restrict them in the relevant provider console where supported.
- Committed environment files and CI configuration contain only non-sensitive defaults or dummy test values.
- When a new configuration value is introduced, classify it before use: public-at-build, server-only, local/test-only, or build-only. Test and CI must receive safe values whenever configuration is loaded during a build or test.

## Local setup

Maintainers should obtain the required development configuration through the approved private channel. Do not add production values, keys, addresses, or provider settings to this repository or its public documentation.
