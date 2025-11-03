# Development Plan

## Next up

- Verify CI picks up Vitest coverage artifacts (html/lcov) as expected.
- Review and prune any lingering Mocha/NYC references in docs or scripts.
- Optionally expand tsd tests to cover key exported types and generics.

## Completed (recent)

- Migrate tests from Mocha/NYC to Vitest with V8 coverage.
  - Added vitest, @vitest/coverage-v8 and vitest.config.ts (node env).
  - Converted test files to Vitest APIs (describe/it/expect).
  - Removed legacy .mocharc.json and .nycrc.json.
  - Updated editor recommendations/settings for Vitest.

- ESLint: move to TypeScript flat config, type-aware, repo-wide.
  - Created eslint.config.ts using @typescript-eslint strict/stylistic type-checked configs.
  - Integrated Prettier via eslint-plugin-prettier and import sorting/tsdoc.
  - Added @vitest/eslint-plugin for test files.
  - Lint scripts updated to cover entire repo (not just src).

- tsd integration for type tests.
  - Added tsd devDependency, tsd.config.json and a basic test in tests/types/.
  - Provided separate npm script `type:test` to run tsd.

- Tooling cleanup.
  - Removed Mocha/NYC/Chai and related types/plugins from devDependencies.
  - Updated knip configuration (removed Mocha section; ignored tsd test dir).
  - Kept build/docs scripts unchanged; no source logic changes in this pass.
