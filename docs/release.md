# Manual release

1. Confirm the repository metadata, npm account access to @emtt and the exact package/version on registry.npmjs.org.
2. Update version, CHANGELOG and both README publication status notes.
3. Run CONTRIBUTING.md checks and build the demo.
4. Run pnpm pack. Inspect contents and install the actual tarball into an isolated Vue application. Check types, production build and UI.
5. Publish that verified tarball with pnpm publish <tarball> --access public --registry=https://registry.npmjs.org/.
6. Verify registry metadata and install the exact published version. Create a Git tag/release when authorized.

If a publish response is uncertain, query the exact version before retrying. Do not bump the version to bypass an unresolved error. Automatic npm publication is intentionally absent.
