# Interop — accept `entitiesSchema` in values‑first factory or strip in factory

Summary
- Problem: The values‑first factory `createEntityManager(config, logger?)` advertises optional `entitiesSchema` (Zod) to capture domain shapes for inference. At runtime, the underlying Zod config parser rejects this key:
  - ZodError: Unrecognized key: "entitiesSchema"
- Request: Update entity‑manager to either:
  1) Accept `entitiesSchema` in the Zod config schema, or
  2) Strip `entitiesSchema` inside the factory before calling `new EntityManager(parsedConfig, ...)`.

Either approach preserves the current runtime Config validation while keeping the documented, schema‑first developer experience.

Evidence (downstream repo: entity‑manager‑demo)
```text
ZodError: [
  {
    "code": "unrecognized_keys",
    "keys": [ "entitiesSchema" ],
    "path": [],
    "message": "Unrecognized key: \"entitiesSchema\""
  }
]
    at new EntityManager (...)
    at createEntityManager (...)
    at src/entity-manager/entityManager.ts:export const entityManager = createEntityManager(config, errorLogger);
```

Context/expectations
- entity‑manager README describes a schema‑first flow:
  - Provide Zod schemas (non‑generated fields only), and pass them as `entitiesSchema` in the values‑first config literal.
  - The factory should capture types from `entitiesSchema` for inference and still apply the normal runtime Config validation to the rest of the config.
- Current behavior indicates the Zod parser still uses a strict object that rejects unknown keys (or at least rejects `entitiesSchema`).

Proposed fixes (either is acceptable)

Option A — accept `entitiesSchema` in the Zod schema (preferred)
- Modify the top‑level config Zod object to include:
  - `entitiesSchema?: Record<string, z.ZodType>` (type‑only at runtime; no semantic impact).
- Keep the parser in strict/strip mode as today for other unknowns:
  - Only `entitiesSchema` becomes an acknowledged optional key; it is ignored by runtime logic after parsing.
- Advantages:
  - The entire config literal round‑trips cleanly through parsing without pre‑processing.
  - Matches README expectations directly.

Option B — strip `entitiesSchema` in the factory (minimal code change)
- In `createEntityManager(config, logger?)`, destructure and drop the key before constructing the manager:
  ```ts
  export function createEntityManager<const CC extends ConfigInput, EM extends EntityMap = EntitiesFromSchema<CC>>(
    config: CC,
    logger?: Pick<Console, 'debug' | 'error'>,
  ): EntityManager<CapturedConfigMapFrom<CC, EM>> {
    const { entitiesSchema, ...runtimeConfig } = config as any;
    // ...existing type capture remains (CC, EM inference)
    return new EntityManager(runtimeConfig as unknown as Config<CapturedConfigMapFrom<CC, EM>>, logger);
  }
  ```
- Advantages:
  - Touches only the factory; keeps Zod config schema unchanged.
  - Ensures the value used by the constructor is the same shape as before.
  - Preserves the schema‑first inference captured by the factory.

Required behavior (common to both options)
- Types:
  - `entitiesSchema` continues to drive `EntitiesFromSchema<CC>` and related inference helpers (no change).
  - No runtime reliance on `entitiesSchema` is introduced.
- Runtime:
  - Parsed Config passed to `EntityManager` is identical to a config without `entitiesSchema`.
  - All existing runtime validation rules stay intact.
  - No hidden behavior change to sharding, key generation, indexes, page keys, or query orchestration.

Acceptance criteria
1) Factory accepts config literals containing `entitiesSchema` without throwing a ZodError.
2) Parsed `entityManager.config` does not include `entitiesSchema`.
3) All existing tests and runtime behavior remain unchanged:
   - addKeys/getPrimaryKey/removeKeys work as before.
   - Query and page‑key dehydration/rehydration operate as before.
4) README examples using `entitiesSchema` are consistent with the implementation (no doc drift).

Suggested tests (minimal)

Unit (factory)
```ts
import { z } from 'zod';
import { createEntityManager } from '@karmaniverous/entity-manager';

const userSchema = z.object({
  userId: z.string(),
  created: z.number(),
});

const config = {
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',
  entitiesSchema: { user: userSchema },
  entities: {
    user: { uniqueProperty: 'userId', timestampProperty: 'created' },
  },
  generatedProperties: { sharded: {}, unsharded: {} },
  indexes: {},
  propertyTranscodes: { userId: 'string', created: 'timestamp' },
  transcodes: defaultTranscodes,
} as const;

const em = createEntityManager(config);
expect(em).toBeDefined();
// Optionally assert entities are usable (addKeys/removeKeys on a user item).
```

Integration (runtime parity)
- Use an existing repository integration test with a values‑first config literal, add `entitiesSchema`, and confirm:
  - No ZodError on initialization.
  - A basic addKeys / getPrimaryKey / removeKeys cycle works for at least one entity.
  - A minimal query using QueryBuilder (if present in the test suite) still works.

Type tests (tsd)
- Ensure that `EntitiesFromSchema<CC>` still infers entity shapes when `entitiesSchema` is present.
- Confirm that token‑aware helpers compile with the inferred shapes (`addKeys('user', ...)`, etc.).

Backwards compatibility
- No breaking changes. The only addition is tolerance for `entitiesSchema` in the values‑first path.
- Consumers that do not use `entitiesSchema` are unaffected.
- If Option B (strip in factory) is chosen, the runtime Config shape passed to the constructor remains identical to current releases.

Performance and risk
- Minimal: either add one optional key to Zod or a tiny destructure in the factory.
- No impact on hot paths; all query/sharding logic remains untouched.

Documentation
- README already documents `entitiesSchema` usage. After the patch:
  - Keep current examples as‑is (no change needed).
  - Optional: a short note stating `entitiesSchema` is compile‑time only and not part of the runtime config.

Rationale
- The values‑first + schema‑first DX is compelling and already documented. Allowing the config literal to include `entitiesSchema` (without forcing downstream shims) aligns behavior with the public docs and avoids confusion for adopters.
