# Development Plan

## Next up (in priority order)

- Entity-manager v8.0.0 — implement big-bang by-token type model (Item/Record × Full/Partial)
  - Types & exports
    - Introduce new by-token types in TokenAware (or a dedicated types module):
      - EntityItem<CC, ET> (strict, full; no index signature)
      - EntityItemPartial<CC, ET, K=unknown> (Projected<EntityItem<…>, K>)
      - EntityRecord<CC, ET> (strict, full DB; keys required; no index signature)
      - EntityRecordPartial<CC, ET, K=unknown> (Projected<EntityRecord<…>, K>)
    - Remove legacy EntityItemByToken / EntityRecordByToken from public exports.
    - Update src/EntityManager/index.ts export surface to the new names.
  - Core API signatures
    - QueryOptions.item → EntityItemPartial<CC, ET>
    - ShardQueryFunction/Result → items: EntityItemPartial<CC, ET, K>
    - QueryResult.items → EntityItemPartial<CC, ET, K>[]
    - EntityManager.addKeys → accepts EntityItemPartial; returns EntityRecordPartial
    - EntityManager.removeKeys overloads:
      - EntityRecord → EntityItem (strict)
      - EntityRecordPartial → EntityItemPartial (projection-preserving)
    - EntityManager.getPrimaryKey → accepts EntityItemPartial (unchanged output)
  - Internals (by-token where ET is present)
    - Convert helper signatures where appropriate to EntityItemPartial:
      - updateItemHashKey / updateItemRangeKey / encodeElement / decodeElement
      - encodeGeneratedProperty / decodeGeneratedProperty
      - dehydrateIndexItem / rehydrateIndexItem
      - dehydratePageKeyMap / rehydratePageKeyMap
      - unwrapIndex / getIndexComponents
    - Keep purely property-level helpers generic if clearer.
  - Tests (tsd + runtime)
    - tsd: pin strict vs partial flows:
      - query→getItems(no attrs)→removeKeys returns EntityItem (strict; required fields present)
      - projection flows remain partial unless enriched or projected to include required fields
      - addKeys return type and removeKeys overloads behave correctly
    - runtime: smoke over key update, (de)hydration, and query orchestration (unchanged semantics)
  - Docs
    - TypeDoc & README: document the new type model (Item/Record × Full/Partial),
      projection K, schema-level looseness guidance (catchall)
    - Migration mapping (old → new type names) and handler patterns
  - Lint/build/typecheck: ensure repo passes ESLint, Vitest, tsd, rollup

- DynamoDB adapter v1.0.0 — align with new type model (type-only changes)
  - Overload getItems returns:
    - No attrs → EntityRecord<CC, ET>[]
    - With attrs A → EntityRecordPartial<CC, ET, A>[]
  - Ensure QueryBuilder docs emphasize:
    - “no projection → strict; projection → partial”
  - Tsd tests: pin overload behavior and removeKeys narrowing after enrichment

- Cross-repo validation & release
  - Validate downstream fixture(s) (e.g., SMOZ) search route:
    - Non-projection flow types as strict domain (required fields present) without casts
    - Projection flows remain partial unless re-enriched
  - Version & release:
    - @karmaniverous/entity-manager v8.0.0 (breaking types)
    - @karmaniverous/entity-client-dynamodb v1.0.0 (type surface)

## Completed

**CRITICAL: This list is append-only; do not edit items! Place most recent entries at the BOTTOM of the list. When pruning, remove older entries from the top.**

- Plan: captured the big-bang by-token refactor (EntityItem / EntityItemPartial /
  EntityRecord / EntityRecordPartial) in .stan/system/stan.todo.by-token.md.

- Lint: refactored advanced type aliases to satisfy @typescript-eslint/no-redundant-type-constituents (Extract/Exclude rewrites; removed redundant intersections/unions; no suppressions).

- Lint/TS: deduped index component unions via KeyUnion mapped-type; fixed
  template literals by coercing entityToken to string (TS2731, restrict-template-expressions).

- Lint: finalized no-redundant-type-constituents cleanup in PageKey by introducing
  DistinctFromBase (conditional exclusion of base keys) and removing KeyUnion.

- Lint: gated derived index tokens with conditional helpers (WithIndexHashKey /
  WithIndexComponents) to avoid redundant unions in PageKey without suppressions.

- Lint: finalized PageKey by deriving component unions via key-set mapped types
  (PresentIndexTokenSet/FallbackIndexTokenSet) and `keyof` (no redundant unions).

- Lint/TS: replaced `{}` conditionals with key-remapping to `never` in
  PresentIndexTokenSet, ensuring `keyof` stays string-only and avoids overlaps.

- Docs/API: exported PresentIndexTokenSet and FallbackIndexTokenSet from PageKey.

- Docs/API: exported BaseKeyTokens from PageKey to include shared base-token definition in TypeDoc and remove remaining warning.

- Types & exports: introduced new by-token type model and removed legacy
  EntityItemByToken/EntityRecordByToken exports. Updated public API (QueryOptions,
  QueryResult, ShardQueryResult, EntityManager overloads) and tsd tests to use
  EntityItem/EntityItemPartial/EntityRecord/EntityRecordPartial. No runtime changes.

- Follow-through: replaced stale EntityItemByToken cast in
  decodeGeneratedProperty (degenerate path) with EntityItemPartial and aligned
  EntityManager.removeKeys implementation signature/return to satisfy overloads
  and ESLint no-redundant-type-constituents.

- Follow-through: finalized removeKeys implementation to accept both strict and
  projected DB records (single/array) and return strict domain items, resolving
  the TS2394 overload incompatibility during build/docs.

- Follow-through: widened removeKeys implementation signature to cover both
  strict and projected DB record inputs and unified implementation return to
  EntityItemPartial, resolving remaining TS2394 in build/docs.

- Follow-through: added K generic to the removeKeys implementation and accepted
  EntityRecordPartial forms (single/array) to match overloads exactly; unified
  return to EntityItemPartial<…, K>, fixing TS2394 in build/docs.

- Follow-through: finalized removeKeys implementation as a supertype of all
  overloads (accepting strict and projected inputs) and returning strict domain
  items, satisfying overload compatibility (TS2394) during build/docs.

- Fix: resolved TS2394 in EntityManager.removeKeys by adding generic K to the
  implementation and widening its parameter to accept strict/projected record(s)
  (single/array). Kept return as strict DomainItem(s); overloads remain authoritative.

- Fix: replaced removeKeys implementation with a generic, conditional signature
  that ties the return shape to the input (array vs single) and remains a proper
  supertype of all overloads without using any.

- Internal types: renamed EntityItem/EntityRecord → StorageItem/StorageRecord
  (token-agnostic, storage-facing) and updated all helper imports to remove
  collisions with public by-token types. Kept Storage\* @internal (not exported).

- Policy alignment: confirmed requirements already mandate by-token signatures
  for helpers that accept entityToken; this change is a stepping stone toward
  converting remaining helpers (encodeElement/decodeElement remain property-level).

- Fix: repaired PageKeyByIndex to use StorageItem and removed stray duplicate
  line that broke parsing; typecheck now advances past PageKey.ts.

- Fix: cleaned up unused imports (ET alias, EntityRecordPartial) and removed
  unsafe any-typed assignments in removeKeys via a typed loop over unknown
  values; resolved duplicate variable in getPrimaryKey and test lint issue.

- Fix: typecheck and lint — StorageItem alignment and safer indexing
  - Imported StorageItem and replaced unsafe/symbol indexing with typed keys in
    updateItemHashKey/updateItemRangeKey/getHashKeySpace.
  - Cast page-key/record intermediates to StorageItem where property-level helpers
    require token-agnostic storage shapes (addKeys, getPrimaryKey, rehydratePageKeyMap).
  - query.ts: removed unknown/Record cast; pass EntityItemPartial directly to
    rehydratePageKeyMap seed parameter.
  - EntityManager.removeKeys: widened implementation signature to a proper
    supertype of all overloads (strict and projected, single and array) and
    returned via local variables to satisfy no-unsafe-return.
  - Tests: fixed pick() key typing in rehydratePageKeyMap.test and removed
    unnecessary optional chaining in updateItemHashKey.test.

- Follow-up: fix remaining typecheck/lint
  - updateItemRangeKey: import StorageItem; use typed indexing for range/unique
    properties; return EntityRecordPartial; build rangeKey string safely.
  - rehydratePageKeyMap.test: ensure pick() receives keys typed to the exact
    object literal via a local obj and keyed cast.
  - updateItemHashKey: replace String() conversion with direct cast to satisfy
    no-unnecessary-type-conversion lint.

- Finalize: early-return cast and lint cleanup
  - updateItemHashKey: cast early return `{ ...item }` to EntityRecordPartial
    to satisfy strict return type when K is unknown.
  - updateItemRangeKey: replace String(uniqueValue) with a direct string cast
    to resolve no-unnecessary-type-conversion.
