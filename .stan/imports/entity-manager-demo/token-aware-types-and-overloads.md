# Interop — Token-aware types and overloads in entity-manager

Purpose
- Improve type inference in downstream consumers (this repo) so handlers do not
  need assertions like `as User[]` after calling `removeKeys`, `addKeys`, or
  `getPrimaryKey`.
- Scope is limited to `@karmaniverous/entity-manager` (types-only changes). No
  changes are required in `@karmaniverous/entity-tools`. Optional follow-up can
  enhance `@karmaniverous/entity-client-dynamodb`, but it is not required to
  meet this repo’s needs.

Current behavior (problem)
- Public APIs such as `removeKeys`, `addKeys`, and `getPrimaryKey` are typed in
  terms of the global `ConfigMap` (C). Return types are union-shaped across all
  entities (`EntityItem<C>[]`, `EntityRecord<C>[]`), not narrowed to the entity
  token passed at the call site.
- As a result, downstream code that knows the token (e.g., `'user'`) must
  assert:  
  `entityManager.removeKeys('user', items) as User[]`.

Goal
- Make the APIs token-aware so that passing a literal entity token narrows the
  return type to the corresponding entity’s item/record shape. This removes the
  need for consumer assertions and enables “types flow with inference.”

Constraints and scope
- Types-only change in `entity-manager`:
  - Add token-aware helper types.
  - Add overloads for key APIs that accept a token `E` and return token-narrowed
    types. Keep existing broad signatures for backward compatibility.
- No changes in `entity-tools`:
  - The needed building blocks (`Exactify`, `FlattenEntityMap`, etc.) already
    exist there. Token-awareness depends on the config and entity tokens, which
    are `entity-manager` concepts.
- Optional/next: similar overloads in `entity-client-dynamodb` can be added to
  make `getItems` typed by token, but current consumer benefit is achieved by
  `removeKeys` alone.

Proposed API additions (types)

Note: names are illustrative; choose names consistent with the codebase.

```ts
// Existing: BaseConfigMap, EntityToken<C>, EntityKey<C>, EntityItem<C>, EntityRecord<C>, etc.
// New helper types:

export type EntityOfToken<
  C extends BaseConfigMap,
  E extends EntityToken<C>
> = Exactify<C['EntityMap']>[E];

// The "item" shape for a single entity token E (without requiring keys).
export type EntityItemByToken<
  C extends BaseConfigMap,
  E extends EntityToken<C>
> = Partial<EntityOfToken<C, E>> & Record<string, unknown>;

// The "record" shape for a single entity token E (with required keys).
export type EntityRecordByToken<
  C extends BaseConfigMap,
  E extends EntityToken<C>
> = EntityItemByToken<C, E> & EntityKey<C>;
```

Proposed API additions (overloads)

Keep existing, broad signatures; add token-aware overloads on top so literal
tokens pick the narrower types automatically.

```ts
// removeKeys — add token-aware overloads
export function removeKeys<C extends BaseConfigMap, E extends EntityToken<C>>(
  entityToken: E,
  item: EntityRecord<C>
): EntityItemByToken<C, E>;

export function removeKeys<C extends BaseConfigMap, E extends EntityToken<C>>(
  entityToken: E,
  items: EntityRecord<C>[]
): EntityItemByToken<C, E>[];

// addKeys — add token-aware overloads
export function addKeys<C extends BaseConfigMap, E extends EntityToken<C>>(
  entityToken: E,
  item: EntityItemByToken<C, E>,
  overwrite?: boolean
): EntityRecordByToken<C, E>;

export function addKeys<C extends BaseConfigMap, E extends EntityToken<C>>(
  entityToken: E,
  items: EntityItemByToken<C, E>[],
  overwrite?: boolean
): EntityRecordByToken<C, E>[];

// getPrimaryKey — token-aware input (return remains EntityKey<C>[], as today)
export function getPrimaryKey<C extends BaseConfigMap, E extends EntityToken<C>>(
  entityToken: E,
  item: EntityItemByToken<C, E>,
  overwrite?: boolean
): EntityKey<C>[];

export function getPrimaryKey<C extends BaseConfigMap, E extends EntityToken<C>>(
  entityToken: E,
  items: EntityItemByToken<C, E>[],
  overwrite?: boolean
): EntityKey<C>[];
```

Optional (nice-to-have)
- Query API typing by token:
  - `EntityManager.query` and `BaseQueryBuilder.query` could accept an optional
    entity token type parameter `E` and surface `items: EntityItemByToken<C, E>[]`
    in `QueryResult`. This is not required to remove casts in our handlers, but
    rounds out the API.

Backwards compatibility
- Overloads are additive; no breaking runtime changes.
- When the token is not a literal (e.g., `const t: string = getToken()`), the
  existing broad signatures still apply and the result type remains the union
  shape. This preserves current behavior for dynamic-token code paths.
- Version impact: minor version bump recommended.

Implementation hints
- Keep implementation signatures unchanged; add token-aware overload
  declarations only. The actual implementation can still use the broad types
  internally.
- Reuse existing exported types. Only new helper types are needed to tie a
  token `E` to the per-entity shape from `C['EntityMap']`.
- Prefer `Exactify<C['EntityMap']>[E]` to avoid index signature bleed-through
  and keep inference crisp.
- Performance: avoid deep conditional types in hot paths. The helpers shown
  above keep complexity low.

Consumer impact (this repo)

Before (casting):
```ts
const { items } = await entityClient.getItems(keys);
return entityManager.removeKeys('user', items) as User[];
```

After (no casts):
```ts
const { items } = await entityClient.getItems(keys);
return entityManager.removeKeys('user', items); // inferred as User[]
```

Out of scope
- No behavior change to sharding, key composition, decoding, or query logic.
- No changes to `@karmaniverous/entity-tools` (remains config-agnostic).
- No required changes to `@karmaniverous/entity-client-dynamodb`. Optional
  follow-up could add token-aware overloads to `getItems`, but downstream
  casts already disappear once `removeKeys` becomes token-aware.

Suggested upstream tests (entity-manager)

Prefer type-level tests (e.g., `tsd`) and small runtime sanity checks to ensure
the implementation signatures remain compatible.

1) Setup: minimal config map for tests
```ts
// Pseudocode for test-only config
type MyConfigMap = ConfigMap<{
  EntityMap: {
    email: { created: number; email: string; userId: string };
    user: {
      beneficiaryId: string;
      created: number;
      firstName: string;
      firstNameCanonical: string;
      lastName: string;
      lastNameCanonical: string;
      phone?: string;
      updated: number;
      userId: string;
    };
  };
  ShardedKeys: 'userHashKey' | 'beneficiaryHashKey';
  UnshardedKeys: 'firstNameRangeKey' | 'lastNameRangeKey';
  TranscodedProperties:
    | 'beneficiaryId'
    | 'created'
    | 'email'
    | 'firstNameCanonical'
    | 'lastNameCanonical'
    | 'phone'
    | 'updated'
    | 'userId';
}>;
```

2) tsd tests: removeKeys narrows by token
```ts
// Given: records: EntityRecord<MyConfigMap>[]
// Expect: removeKeys('user', records) -> User[]
import { expectType } from 'tsd';

declare const records: EntityRecord<MyConfigMap>[];
const users = entityManager.removeKeys('user', records);
expectType<Array<MyConfigMap['EntityMap']['user']>>(users);
```

3) tsd tests: addKeys narrows by token
```ts
import { expectType } from 'tsd';

declare const userItem: Partial<MyConfigMap['EntityMap']['user']>;
const userRecord = entityManager.addKeys('user', userItem);
// Record must contain keys:
expectType<string>(userRecord.hashKey);
expectType<string>(userRecord.rangeKey);
```

4) tsd tests: array overloads
```ts
declare const emailItems: Partial<MyConfigMap['EntityMap']['email']>[];
const emailRecords = entityManager.addKeys('email', emailItems);
// emailRecords inferred as EntityRecordByToken<..., 'email'>[]
expectType<string>(emailRecords[0].hashKey);
expectType<string>(emailRecords[0].rangeKey);
```

5) tsd tests: dynamic token preserves broad shape
```ts
declare const t: string;
declare const records2: EntityRecord<MyConfigMap>[];
const items2 = entityManager.removeKeys(t as EntityToken<MyConfigMap>, records2);
expectType<Array<FlattenEntityMap<MyConfigMap['EntityMap']>>>(items2);
```

6) Optional tsd tests: Query typing (if implemented)
```ts
// If QueryResult becomes token-aware, assert items type matches token E
import { expectType } from 'tsd';
declare const result: QueryResultByToken<MyConfigMap, 'user'>;
expectType<Array<MyConfigMap['EntityMap']['user']>>(result.items);
```

7) Runtime sanity (optional)
- Smoke test that overloads remain compatible at runtime:
  - Construct a minimal EntityManager with a trivial config.
  - Call `addKeys/removeKeys/getPrimaryKey` in a small integration test to ensure
    no runtime regressions (types-only change).

Acceptance criteria
- Passing a literal token `E` to `removeKeys/addKeys` yields per-entity types
  without consumer assertions.
- Dynamic/non-literal tokens continue to compile with broad union types.
- No behavior or runtime API changes; no performance regression from the new
  types.

Rationale
- Token-aware overloads encode the relationship “token → entity type” directly
  in the public API. This shifts today’s common consumer assertions into the
  type system without altering runtime behavior, aligns with how consumers use
  the library, and keeps `entity-tools` generic and untouched.

Follow-ups (optional)
- Add token-aware overloads to `@karmaniverous/entity-client-dynamodb.getItems`
  to propagate typed records sooner in consumer flows. Not required for this
  repo once `removeKeys` is token-aware.
```
