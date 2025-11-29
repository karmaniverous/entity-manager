# By-token type refactor — Big bang plan (EntityItem / EntityItemPartial / EntityRecord / EntityRecordPartial)

Context and problem

- Current types mix three distinct use-cases under one permissive shape:
  - EntityItemByToken (partial, domain-facing + loose, includes `Record<string, unknown>`)
  - EntityRecordByToken (DB-facing with keys, but domain side effectively partial in flows)
  - removeKeys returns EntityItemByToken even for full DB rows
- Symptoms downstream:
  - In QueryBuilder → getItems → removeKeys flows (no projections), TypeScript still sees “domain” items as partial (e.g., `created?`), and strict Zod-derived responses fail typecheck.
  - The root cause is that “full vs partial” isn’t encoded in the types for domain outputs, and the permissive, partial type is reused for inputs/outputs.

Guiding principles

- Separate the two orthogonal axes explicitly in the type system:
  1) Perspective: Item (domain-facing, keys removed) vs Record (DB-facing, keys present)
  2) Completeness: Full vs Partial (projection/seed)
- Keep permissive, partial input shapes for query/key helpers and projections.
- When the pipeline loads full DB rows (no projections), propagate “full” to the output of removeKeys — strict domain shape with required fields.
- Avoid string indexers on “strict” types (exact-enough domain/DB shapes). If a domain intends looseness, the Zod schema should express it (e.g., `.catchall(z.unknown())`).

New canonical type family (all by token; public surface)

- Domain (business-facing; keys removed)
  - EntityItem<CC, ET>
    - Strict “full” domain shape (required fields per entitiesSchema when present).
    - No `[key: string]: unknown` index signature.
  - EntityItemPartial<CC, ET, K = unknown>
    - Projected/seed domain shape. Equivalent to `Projected<EntityItem<CC, ET>, K>`.
    - Used for query seeds, permissive inputs, and explicit projections.

- DB (storage-facing; keys present)
  - EntityRecord<CC, ET>
    - Strict “full” DB record (EntityItem<CC, ET> + required hash/range keys).
    - No index signature.
  - EntityRecordPartial<CC, ET, K = unknown>
    - Projected DB record. Equivalent to `Projected<EntityRecord<CC, ET>, K>`.

Notes
- We will rename current EntityItemByToken → EntityItemPartial (breaking).
- We will split current EntityRecordByToken into:
  - EntityRecord (strict DB full) — new
  - EntityRecordPartial (projected DB) — new
- No index signature (string indexer) on strict types; and remove it from partials as well. Structural types allow extra properties; object-literal excess checks are often desirable and can be bypassed with local variables where needed.

Behavioral rules and API mapping

- QueryBuilder.query (unchanged semantics; type-only changes)
  - Returns items as EntityItemPartial<CC, ET, K>.
  - K narrows shapes on projection; K unknown (default) means permissive partial.

- entity-client-dynamodb.getItems overloads
  - getItems(entityToken, keys) → `{ items: EntityRecord<CC, ET>[] }`  // strict DB full
  - getItems(entityToken, keys, attributes: A) → `{ items: EntityRecordPartial<CC, ET, A>[] }` // projected
  - Runtime behavior unchanged: absence of attributes implies “full” DB rows.

- EntityManager.removeKeys overloads
  - removeKeys(entityToken, EntityRecord<CC, ET>[]) → EntityItem<CC, ET>[]            // strict domain
  - removeKeys(entityToken, EntityRecordPartial<CC, ET, K>[]) → EntityItemPartial<CC, ET, K>[] // projected/partial domain
  - Array + single overloads maintained for both forms.

- EntityManager.addKeys
  - Input remains permissive: EntityItemPartial<CC, ET> | EntityItemPartial<CC, ET>[]
  - Output is DB-facing projection-compatible: EntityRecordPartial<CC, ET> | array
    (adds keys but does not imply domain “full”; strict full rows come from DB reads)

- EntityManager.getPrimaryKey
  - Input: EntityItemPartial<CC, ET> | array (permits “just enough” fields)
  - Output: Array<EntityKey<CC>> (unchanged)

- updateItemHashKey / updateItemRangeKey / encodeElement / decodeElement / encodeGeneratedProperty / decodeGeneratedProperty
  - Inputs and outputs remain EntityItemPartial<CC, ET> unless a stricter shape is genuinely required. These helpers operate on specific fields; permissive inputs are desired DX.

Index signature policy

- No `[key: string]: unknown` in strict types (EntityItem, EntityRecord).
- None in partials either — rely on structural assignability and variable indirection if needed. If an app’s domain truly permits extra fields, express that in the Zod schema (e.g., `.catchall(z.unknown())`).

By-token internals

- Most internal helpers already accept an EntityToken argument; adopt by-token types across those signatures to improve inference and keep types tight (e.g., uniqueProperty/ timestampProperty become ET-aware).
- Only keep non-by-token internal types if a helper truly has no ET semantics (e.g., encodeElement on a specific property token).

Breaking changes (big bang)

- Replace exported types:
  - EntityItemByToken → EntityItemPartial (rename; semantics clarified as partial)
  - EntityRecordByToken → split into EntityRecord and EntityRecordPartial
- Update all public signatures in entity-manager and entity-client-dynamodb to use the new types.
- Remove index signatures from exposed types.
- Back-compat: not supported (explicitly requested).

Downstream effects

- Non-projection flows:
  - QueryBuilder.query (partial) → getPrimaryKey → getItems(no attributes) → removeKeys
  - Now types narrow to EntityItem<…> (domain strict), so required domain fields (e.g., created) are present at compile time and align with Zod-derived response types without casts.
- Projection flows:
  - When attributes are supplied, types reflect partial shapes (EntityItemPartial/EntityRecordPartial).
  - If a handler needs strict domain results, they must include required fields in projection or re-enrich (getItems without attributes) before removeKeys.
- App-level “looseness” belongs in the entity Zod schema. If the app expects unknown keys, the domain schema should use catchall; do not push looseness into the core types.

Repository scoped changes (phase plan)

Phase 1 — entity-manager (big-bang types; runtime unchanged)
1) Introduce new types in TokenAware (or a new dedicated typings module):
   - EntityItem<CC, ET>
     - When entitiesSchema is provided: strict domain shape per schema (required fields).
     - Else: best-available exactified domain from EntityMap (still strict within that scope).
   - EntityItemPartial<CC, ET, K = unknown>
     - Projected<EntityItem<CC, ET>, K>
   - EntityRecord<CC, ET>
     - EntityItem<CC, ET> & EntityKey<CC>
   - EntityRecordPartial<CC, ET, K = unknown>
     - Projected<EntityRecord<CC, ET>, K>
   - Remove `[key: string]: unknown` indexing from public shapes.
   - Maintain internal helper utility types as needed; prefer by-token variants.

2) Change public function signatures:
   - QueryOptions.item: EntityItemPartial<CC, ET>
   - ShardQueryFunction/ShardQueryResult: return items as EntityItemPartial<CC, ET, K>
   - QueryResult.items: EntityItemPartial<CC, ET, K>[]
   - removeKeys:
     - Overload 1: (entityToken, EntityRecord<CC, ET>[]) → EntityItem<CC, ET>[]
     - Overload 2: (entityToken, EntityRecordPartial<CC, ET, K>[]) → EntityItemPartial<CC, ET, K>[]
     - Provide matching single-item overloads
   - addKeys:
     - Input: EntityItemPartial<CC, ET> | array
     - Output: EntityRecordPartial<CC, ET> | array
   - getPrimaryKey: input EntityItemPartial<CC, ET> | array → unchanged output
   - Internals: update by-token types everywhere ET is present; otherwise leave unchanged

3) Remove or adapt legacy exports:
   - Delete EntityItemByToken and EntityRecordByToken from exports.
   - Adopt new types in src/EntityManager/index.ts export surface.

4) Tests (tsd + runtime where applicable)
   - Compile-time:
     - QueryBuilder(no projection) → getItems(no attrs) → removeKeys yields EntityItem<CC, ET> (strict domain; created required with schema).
     - QueryBuilder(with projection) → removeKeys yields EntityItemPartial (projection).
     - addKeys returns EntityRecordPartial for both single and array inputs.
   - Runtime:
     - Smoke tests for updated signatures compile and pass existing behavior (no runtime change).

5) Docs
   - TypeDoc: add a section “Type model: Item/Record × Full/Partial.”
   - README guides: clarify non-projection vs projection flows and how types reflect completeness.

6) Version
   - Major bump: @karmaniverous/entity-manager v8.0.0

Phase 2 — entity-client-dynamodb (adapter; type-only behavior adjustments)
1) Overload getItems
   - getItems(entityToken, keys) → `{ items: EntityRecord<CC, ET>[] }`
   - getItems(entityToken, keys, attributes: A) → `{ items: EntityRecordPartial<CC, ET, A>[] }`
   - No runtime change — only the return types differ based on presence of “attributes”.

2) Update QueryBuilder documentation examples (no API change if already CF-aware)
   - Keep CF-based ITS inference already present (remove explicit cf param in prior interop).
   - Emphasize: “no projection → strict; projection → partial.”

3) Tests (tsd)
   - Pin getItems overload behavior.
   - End-to-end compile-time checks showing handler flows infer strict domain types when no projections are set.

4) Version
   - Major bump: @karmaniverous/entity-client-dynamodb v1.0.0 (first 1.x if ready) or v0.9.0 with explicit BREAKING note.

Mapping from old to new types (for downstream migrations)

- Old → New
  - EntityItemByToken<CC, ET> → EntityItemPartial<CC, ET>
  - EntityRecordByToken<CC, ET>
    - If full DB record: EntityRecord<CC, ET>
    - If projected DB record: EntityRecordPartial<CC, ET, K>
  - removeKeys(…, EntityRecordByToken[]) → removeKeys(…, EntityRecord[])  // strict domain output; or EntityRecordPartial for projected paths

Call-site guidance (handlers)

- Non-projection handlers (recommended for strict responses)
  - QueryBuilder.query (partial) → getPrimaryKey → getItems(no attributes) → removeKeys
  - Compile-time output: EntityItem<…> — assignable to Zod-derived strict schemas (created required).

- Projection handlers (partial responses)
  - If you project, add required fields to attributes or re-enrich before removeKeys; otherwise your output remains EntityItemPartial and is not a match for strict schemas.

Rationale for removing string index signatures

- We previously used `Record<string, unknown>` to model NoSQL looseness. That leaks into domain types and makes strict responses harder to reason about.
- Strict domain/DB shapes should be exact enough to match Zod. If the app needs unknown keys, the domain should opt in via schema (e.g., `.catchall(z.unknown())`).
- TypeScript structural typing allows passing objects with extra properties once they are referenced via variables (object literal excess checks are a feature).

File-by-file change checklist (entity-manager)

- src/EntityManager/TokenAware.ts (or a new module)
  - Define:
    - EntityItem<CC, ET>
    - EntityItemPartial<CC, ET, K = unknown>
    - EntityRecord<CC, ET>
    - EntityRecordPartial<CC, ET, K = unknown>
  - Remove legacy EntityItemByToken/EntityRecordByToken.
  - Update related utility types:
    - ProjectedItemByToken → EntityItemPartial<CC, ET, K>
    - (Adjust Names: ProjectedItem/Projected<T,K> can stay in entity-tools; we consume it)

- src/EntityManager/QueryOptions.ts / QueryResult.ts / ShardQueryResult.ts
  - Replace occurrences of EntityItemByToken / ProjectedItemByToken with EntityItemPartial and update generics accordingly.

- src/EntityManager/EntityManager.ts
  - removeKeys overloads for EntityRecord / EntityRecordPartial
  - addKeys returns EntityRecordPartial
  - getPrimaryKey accepts EntityItemPartial
  - Internals by-token where ET is present

- src/EntityManager/addKeys.ts / removeKeys.ts / getPrimaryKey.ts / updateItemHashKey.ts / updateItemRangeKey.ts / encode/decode helpers
  - Align parameter and return types with the new family.
  - Keep permissive inputs for key-update helpers (EntityItemPartial).

- src/EntityManager/index.ts (exports)
  - Export new types; remove legacy names.

- tsd tests
  - New tests pinning strict vs partial behavior in both non-projection and projection flows.

File-by-file change checklist (entity-client-dynamodb)

- src/EntityClient/*.ts
  - Overload getItems per the plan and re-export types where appropriate.
  - Docs/examples updated to explain strict vs partial rows.

- QueryBuilder (no signature change needed for this refactor; CF already threaded)
  - Docs: emphasize projection channel and completeness story (strict vs partial).

TSDoc / Documentation

- EntityItem / EntityRecord / EntityItemPartial / EntityRecordPartial
  - Clear “what/when/how” docs with examples:
    - Query seed → permissive partial
    - Enrich (no attrs) → strict DB full → strict domain via removeKeys
    - Projection (attrs) → projected DB partial → partial domain via removeKeys
  - Index signature rationale and schema-level looseness guidance.

Release / versioning

- entity-manager: 8.0.0 (major; breaking types)
- entity-client-dynamodb: 1.0.0 (major; type surface breaking for getItems return)

Risks and mitigations

- Breaking type names:
  - The big-bang migration intentionally drops legacy names. Publish a migration note in CHANGELOG and interop docs.
- Strictness in handlers:
  - Non-projection handlers now typecheck strictly by default. Projection handlers must include required fields or re-enrich. This is intended and will surface places where runtime intent didn’t match compile-time expectations.
- Excess property checks without index signature:
  - Use variable indirection for object literals or opt-in to catchall in Zod for truly loose domain models.

Acceptance criteria (for this refactor)

- Non-projection: QueryBuilder.query → getItems(no attrs) → removeKeys returns EntityItem<…> (strict domain), assignable to strict Zod-derived response types (created required).
- Projection: With attributes present, types remain partial. Including required fields in projection yields types assignable to strict responses; otherwise re-enrich is required.
- No runtime behavior changes in either repo.
- Public API provides only by-token types; non-by-token types (if retained) are internal.
