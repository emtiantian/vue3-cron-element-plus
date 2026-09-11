# Contributing

Use Node.js 22 and pnpm 10.7.1.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm build:demo
```

Add behavioral tests for changes. Keep both README translations current. See docs/decisions.md for scope and docs/release.md for manual release steps. No automated npm publication is configured.
