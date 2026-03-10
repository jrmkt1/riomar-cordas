# Security Notes

## Current status (2026-03-09)

The project still reports high vulnerabilities in transitive dependencies from `sqlite3`:

- `sqlite3` -> `node-gyp` -> `make-fetch-happen` -> `cacache` -> `tar`
- `sqlite3` -> `node-gyp` -> `http-proxy-agent` -> `@tootallnate/once`

At this moment, the available automatic remediation from `npm audit` is `npm audit fix --force`, which suggests moving to `sqlite3@5.0.2` (semver major downgrade with compatibility risk). This path was intentionally not applied.

## Accepted risk

The transitive chain above is accepted temporarily with operational controls, until a safe migration path is defined.

## Operational controls

1. `SECRET_KEY` is mandatory in runtime (no insecure fallback in code).
2. Default admin credentials were removed; admin bootstrap now requires environment variables.
3. Use `npm run security:check` in CI/local gates.
4. Use `npm run audit:prod` for full audit visibility.

`security:check` fails only when a **new** high/critical vulnerability appears outside the accepted `sqlite3` transitive chain.

## Reassessment trigger

Reassess this acceptance when one of the items below happens:

1. New `sqlite3` release that resolves these advisories.
2. Migration to another database/driver.
3. New exploitability evidence affecting this project runtime directly.
