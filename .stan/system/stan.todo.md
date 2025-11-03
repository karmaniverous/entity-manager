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

- Zod v4 migration (no deprecated APIs):
  - Updated ParsedConfig schema to Zod v4: z.record(key, value) everywhere.
  - Switched to z.function(argsTuple, returnType) for encode/decode shapes.
  - Replaced ZodIssueCode.invalid_enum_value with invalid_value.
  - This restores correct typing of config entities/indexes and removes
    “unknown” index errors across helpers (decode/encode/dehydrate, etc.).

- ESLint coverage of config file:
  - Keep strict, type-aware rules across source and tests.
  - Lint eslint.config.ts under recommended + Prettier/import-sort/TSDoc to avoid a known upstream crash in @typescript-eslint/unified-signatures.

- Tests: reduce console verbosity
  - Injected a no-op logger for `EntityManager` in test/config.ts to suppress
    noisy `logger.debug` output during Vitest runs while preserving errors via
    `console.error`. This cuts multi‑MB test logs to a minimal, readable output.

- Tests: make error logs opt-in
  - logger.error in test/config.ts now only emits when VERBOSE_TEST is set;
    default runs are quiet even for expected-throw tests.

- Zod v4 typing fixes & TS errors
  - Replaced z.function usages in ParsedConfig with tolerant z.custom function
    checks for transcodes.encode/decode to avoid TS2554 and inference issues.
  - Switched addIssue calls with invalid_value to custom messages compatible
    with Zod v4 typing.
  - Adjusted encodeElement/decodeElement to cast encode/decode functions,
    fixing TS2554/TS2322.

- Tests: update Zod v4 message expectations
  - ParsedConfig.test.ts assertions now match "Too small/Too big" messages.

- Build: fix Rollup JSON import assertion & DTS plugins
  - Remove `assert { type: 'json' }` and read package.json via fs; flatten DTS
    plugins array to avoid nested arrays.

- Lint/Knip: guard upstream crash and cleanup
  - Disable @typescript-eslint/unified-signatures; update knip.json to remove
    redundant ignores and ignore expected anchors/type-only file.

- Zod (no deprecated APIs) & ESLint fixes
  - Removed all uses of deprecated `.safe()` and `ZodIssueCode.*`; switched to
    `.int()` and string-literal `"custom"` codes in ParsedConfig.
  - Avoided deprecated `z.function` completely; function shapes validated with
    z.custom guards.
  - Type-safe transcode encode/decode invocation; removed unnecessary .toString().
  - ESLint: limit type-aware linting to src/config files (tests excluded);
    provided TS parser for eslint.config.ts; silenced dynamic delete at exact
    sites; fixed logger typing in tests.

- ESLint: enforce strict, type-aware rules across ALL TS (tests included)
  - Removed `src/**/*.test.ts` from tsconfig.json `exclude` so parserOptions.project includes test specs.
  - Set TS parser on the `eslint.config.ts` override to resolve “Unexpected token as” when linting the config file.
  - Fixed lint violations:
    - Replaced `any[]` in ParsedConfig transcode encode signature with `(value: unknown) => string` (no-explicit-any).
    - Avoided unnecessary `String()` conversion in encodeGeneratedProperty by using a template literal (no-unnecessary-type-conversion).
    - Added a targeted disable for dynamic delete in removeKeys loop (consistent with existing targeted disables).
  - Re-ran lint: typed-lint now applies to tests without requiring an eslint-specific tsconfig.

- TS: fix TS2769 on ParsedConfig transcodes default
  - Relaxed Zod schema function shapes to `z.custom<unknown>` for `encode` and
    `decode`, avoiding contravariance issues with narrower parameter types in
    `defaultTranscodes`. Keeps runtime validation (function check) while
    preserving consumer DX and fixing typecheck/docs/build errors.
- ESLint: remove dynamic-delete usage in removeKeys
  - Refactored removeKeys to build a Set of keys to strip and reconstruct
    the item via Object.entries + filter, avoiding the delete operator for
    hashKey, rangeKey, and generated properties. This satisfies
    @typescript-eslint/no-dynamic-delete without disables.

- Docs: fix TypeDoc @param name mismatch
  - Updated JSDoc on EntityManager.addKeys and getPrimaryKey array overloads
    to use `@param item` (matches parameter name), clearing the warning.