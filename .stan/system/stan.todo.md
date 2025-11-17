# Development Plan

## Next up (in priority order)

- Step 2 — Introduce values-first factory and adopt strict acronyms (type parameter names only)
  - Add createEntityManager<const CC extends ConfigInput, EM extends EntityMap = MinimalEntityMapFrom<CC>>(config: CC, logger?).
  - Capture tokens/index names from the config value (CC). Zod parsing remains; intersect parsed output with captured CC types at the type level.
  - Adopt strict capitalized type-parameter acronyms across public APIs:
    - EM, E, ET, EOT, TR, TN, CC, HKT, RKT, SGKT, UGKT, PT, IT, ITS, EIBT, ERBT, PKBI, PKMBIS, SQFBI, QO, QR, PK, V.
  - Keep existing constructor temporarily (non-preferred) to ease the transition, but switch docs/examples to the factory.
  - Acceptance: code compiles; no behavior change; public templates use the agreed acronyms.

- Step 3 — Token- and index-aware typing (inference-first; no explicit generics at call sites)
  - Items/records:
    - EIBT<CC, EM, ET>, ERBT<CC, EM, ET>.
  - Core methods:
    - addKeys/removeKeys/getPrimaryKey — accept ET and infer types from parameters; return types narrowed to ET.
  - Low-level helpers:
    - getIndexComponents, unwrapIndex, encodeElement, decodeElement, dehydrateIndexItem, rehydrateIndexItem, dehydratePageKeyMap, rehydratePageKeyMap — thread ET and IT.
    - decodeGeneratedProperty requires (entityToken: ET, encoded) and returns EIBT<…>.
  - Query:
    - PKBI, PKMBIS, SQFBI, QO, QR with ET/ITS inference.
    - ITS inferred from shardQueryMap literal keys; ET inferred from options.entityToken.
  - IndexTokenByEntity:
    - Compute per CC (and EM when provided): global HKT → all; sharded generated → entity must carry elements; RKT → entity has uniqueProperty; unsharded generated → entity carries elements; scalar PT → entity has property and it is mapped in propertyTranscodes.
  - Acceptance: unit tests still pass; tsd tests added to assert type narrowing; no runtime behavior changes.

- Step 4 — Documentation and examples (DX)
  - Update README and API docs to:
    - Prefer the factory (values-first) + “satisfies/as const” guidance.
    - Demonstrate token-aware add/remove/keys and index-aware page keys, with inference across values (no explicit generics).
  - Provide concise usage snippets for PageKey typing by index; sorting with defineSortOrder<E> (entity-tools); and config authoring patterns.

- Step 5 — Type tests and guardrails
  - Add tsd tests covering:
    - createEntityManager inference from a literal value (CC capture).
    - Narrowing of addKeys/removeKeys/getPrimaryKey by ET.
    - Query typing: ET and ITS inferred from options values (entityToken and shardQueryMap keys).
    - Low-level helpers produce ET/IT-typed results.
  - Optional: add a simple CI check or script to scan generated d.ts and assert template parameter names follow the strict acronym dictionary.

- Step 6 — Release and coordination
  - Bump version with release notes summarizing:
    - values-first factory, strict acronyms, token/index-aware typing, decodeGeneratedProperty requiring ET.
  - Open/refresh the interop note for entity-client-dynamodb (provisional) and proceed with its refactor:
    - QueryBuilder<CC, EM, ET, ITS> adopting SQFBI, QO, QR; typed page keys per index (PKBI/PKMBIS).
    - Add typed overloads for getItems returning ERBT<CC, EM, ET>[] keyed by ET (retain broad fallback).
  - Update entity-manager-demo after client integration.

## Completed (append-only)

**CRITICAL: This list is append-only; do not edit items! Place most recent entries at the BOTTOM of the list. When pruning, remove older entries from the top.**

- Step 1 — Align with entity-tools rename (types only; mechanical)
  - Replaced all type-only imports:
    - TranscodeMap → TranscodeRegistry
    - DefaultTranscodeMap → DefaultTranscodeRegistry
  - Updated BaseConfigMap to expose TranscodeRegistry instead of TranscodeMap in the base configuration map and updated all dependent generic references (e.g., C['TranscodeRegistry']).
  - Updated doc-only imports across BaseEntityClient, BaseQueryBuilder, and EntityManager modules to reference TranscodeRegistry.
  - Acceptance: typecheck/build/docs green with zero runtime changes.
  - Amended: finalized the rename by correcting the Config<C> type in src/EntityManager/Config.ts and updating typedoc externalSymbolLinkMappings (DefaultTranscodeRegistry/TranscodeRegistry). This resolves TS parse errors and docs linkage issues so typecheck/build/docs pass.  - Amended: replaced remaining TSDoc references to TranscodeMap → TranscodeRegistry across BaseEntityClient, BaseQueryBuilder, and EntityManager public types (EntityItem/Record/Key/Token, PageKey, QueryOptions/Result, ShardQuery types, ValidateConfigMap). Resolves TypeDoc unresolved-link warnings.
