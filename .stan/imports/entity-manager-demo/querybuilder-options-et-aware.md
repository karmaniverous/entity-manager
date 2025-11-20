# Interop Request — Make QueryBuilder options ET‑aware (eliminate `item: never`)

Context

- Downstream repo: @karmaniverous/entity-manager-demo (values‑first + schema‑first DX demo).
- Goal: Zero casts at call sites after the recent upstream refactors (values‑first factory, token‑aware helpers, CF‑aware QueryBuilder).
- Status: Writes (addKeys/getPrimaryKey/putItems) can be cast‑free with literal tokens preserved locally. However, QueryBuilder.query currently forces a cast at the options `item` site because the exported options type hard‑codes `ET = never`.

Problem (types only; current d.ts)

- In entity-manager/dist/index.d.ts:
  - `QueryBuilderQueryOptions` is defined as:
    ```ts
    // current (abridged)
    type QueryBuilderQueryOptions<CC, CF = unknown> =
      Omit<QueryOptions<CC, never, string, CF>, 'entityToken' | 'pageKeyMap' | 'shardQueryMap'>;
    ```
  - And `BaseQueryBuilder.query` consumes that:
    ```ts
    query(options: QueryBuilderQueryOptions<CC, CF>): Promise<QueryResult<CC, ET, ITS, K>>;
    ```
- Effect: options.item narrows to `EntityItemByToken<CC, never>`, i.e., `never`. Consumers must cast `item` to `never` at every `.query(...)` call, which defeats the no‑cast DX target.

Impact downstream

- In the demo, both email and user search handlers must write:
  ```ts
  queryBuilder.query({ item: {} as never, ... })
  ```
  even though the builder instance already carries `ET` in its class generics. This is the only cast left after local literal‑token preservation for writes.

Proposed upstream fix (types only; no runtime behavior change)

Thread `ET` through the `QueryBuilderQueryOptions` type and the `BaseQueryBuilder.query` signature so the options `item` is typed as `EntityItemByToken<CC, ET>` rather than `never`.

Suggested edits (conceptual diff)

```ts
// before
export type QueryBuilderQueryOptions<CC extends BaseConfigMap, CF = unknown> =
  Omit<QueryOptions<CC, never, string, CF>, 'entityToken' | 'pageKeyMap' | 'shardQueryMap'>;

export abstract class BaseQueryBuilder<CC extends BaseConfigMap, EntityClient extends BaseEntityClient<CC>, IndexParams, ET extends EntityToken<CC> = EntityToken<CC>, ITS extends string = string, CF = unknown, K = unknown> {
  // ...
  query(options: QueryBuilderQueryOptions<CC, CF>): Promise<QueryResult<CC, ET, ITS, K>>;
}

// after
export type QueryBuilderQueryOptions<CC extends BaseConfigMap, ET extends EntityToken<CC>, CF = unknown> =
  Omit<QueryOptions<CC, ET, string, CF>, 'entityToken' | 'pageKeyMap' | 'shardQueryMap'>;

export abstract class BaseQueryBuilder<CC extends BaseConfigMap, EntityClient extends BaseEntityClient<CC>, IndexParams, ET extends EntityToken<CC> = EntityToken<CC>, ITS extends string = string, CF = unknown, K = unknown> {
  // ...
  query(options: QueryBuilderQueryOptions<CC, ET, CF>): Promise<QueryResult<CC, ET, ITS, K>>;
}
```

Notes

- The class already carries `ET` (`ET extends EntityToken<CC>`). We’re just reflecting it into the options type so `options.item` is correctly typed as `EntityItemByToken<CC, ET>`.
- No runtime code changes are required; this is a declarations‑only update.

entity-client-dynamodb alignment

- Its concrete `QueryBuilder<C, ET, ITS, CF, K>` already carries `ET` in the class generics and returns `QueryResult<C, ET, ITS, K>`.
- After the above change, the concrete builder’s `.query(...)` will accept `QueryBuilderQueryOptions<C, ET, CF>` automatically. No API changes are necessary; this tightens types and removes the need for downstream casts on options.item.

Acceptance criteria

1) In a consumer that builds a typed QueryBuilder:
   - `createQueryBuilder({ entityClient, entityToken: 'user', ... })` infers `ET = 'user'`.
   - `builder.query({ item: { userId: 'u1' } })` type‑checks without casts.
   - `options.item` is typed as `EntityItemByToken<CC, 'user'>` (or narrowed via K when used).

2) The change is backward‑compatible for existing consumers:
   - No call‑site generics required.
   - No new parameters.
   - All current QueryBuilder methods continue to type‑check.

3) Type tests (tsd) cover:
   - `QueryBuilderQueryOptions<CC, ET, CF>` resolves `item` to `EntityItemByToken<CC, ET>`.
   - A concrete builder instance carrying `ET = 'email'` accepts `{ item: { email: string } }` without casts.

Developer ergonomics (optional nicety; separate PR)

- To minimize downstream friction capturing literal tokens (hashKey/sharded/unsharded/index keys) in values‑first configs, consider exporting an identity helper:
  ```ts
  export function defineConfig<const CC extends ConfigInput>(config: CC): CC {
    return config;
  }
  ```
  This encourages value‑first usage with `as const` at the call site while providing an obvious “right entry point” for consumers. It doesn’t change semantics but helps prevent accidental widening of generatedProperty/index keys to `string`.

Why this matters

- Recent work across the stack aimed to enable a cast‑free, inference‑only DX:
  - values‑first factory (`createEntityManager(config)`)
  - token‑aware helpers (`addKeys/getPrimaryKey/removeKeys`)
  - CF‑aware QueryBuilder (index token unions + per‑index page keys)
- The remaining cast in `.query({ item })` is purely a typing hole (`ET = never`) and conflicts with that DX objective. Fixing it restores the expected “no generics, no casts” experience.

Risks & migration

- Risk is low; this is a type‑only change aligning options with the builder’s existing generics.
- Existing consumers should compile without modifications; some will benefit immediately (cast removal).

Appendix — minimal consumer example (post‑fix; no casts)

```ts
import { createQueryBuilder } from '@karmaniverous/entity-client-dynamodb';

const qb = createQueryBuilder({
  entityClient,
  entityToken: 'user' as const,
  hashKeyToken: 'hashKey' as const,
  cf: {
    indexes: {
      created: { hashKey: 'hashKey', rangeKey: 'created' },
    } as const,
  } as const,
});

const result = await qb
  .addRangeKeyCondition('created', {
    property: 'created',
    operator: 'between',
    value: { from: tsFrom, to: tsTo },
  })
  .query({
    item: { userId: 'u1' }, // typed as EntityItemByToken<CC, 'user'>
    timestampFrom: tsFrom,
    timestampTo: tsTo,
  });
```
