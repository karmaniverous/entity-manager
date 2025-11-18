# Development plan

## Next up

- Verify knip passes cleanly across CI; prune any remaining unused devDeps if reported.
- Consider removing legacy keywords (mocha/nyc/chai) from package.json for clarity.

## Completed (recent)

- Interop: propose token-aware types/overloads upstream in entity-manager
  - Added interop note at .stan/interop/entity-manager/token-aware-types-and-overloads.md
    specifying helper types (EntityItemByToken/EntityRecordByToken), overloads
    for removeKeys/addKeys/getPrimaryKey, scope (entity-manager only), and
    compatibility.
  - Included a concrete tsd-based test plan to validate inference (narrowed
    return types by token, fallback to union for dynamic tokens) and optional
    query typing extension.
  - This enables removing consumer-side casts like `as User[]` in this repo
    without changing runtime behavior.
- Tests: fix handlers CRUD assertions
  - Use updated[0] for deep include on array result from updateUser.
  - Expect empty array from readUser after delete (not undefined).
- Fix ESLint/TypeScript/Typedoc failures
  - Added devDependency eslint-plugin-prettier to satisfy flat-config import in
    eslint.config.ts and unblock lint/typedoc/knip.
  - Simplified "typecheck" script to "tsc -p tsconfig.json --noEmit"; removed
    stale tsd integration and config to avoid missing script/tool errors.

- Convert tests from Mocha/Chai to Vitest
  - Replaced before/after hooks with beforeAll/afterAll.
  - Removed explicit Chai imports; rely on Vitest’s globals and Chai-compatible
    assertions.
  - Removed unused Mocha-era devDependencies (chai, eslint-plugin-mocha,
    jsdom-global, source-map-support).

- Stabilize lint/typecheck for eslint.config.ts
  - Added ambient module declaration types/eslint-plugin-prettier.d.ts so
    TypeScript can typecheck the flat config without extra tsconfigs.
  - Included the new types/\*_/_.d.ts path in tsconfig.json "include".

- Eliminate Docker port conflict across suites
  - Configured Vitest single-worker execution (threads.singleThread = true) to
    prevent concurrent container startups on port 8000.

