# Development Plan

## Next up (in priority order)

- Entity Client (downstream coordination): update EntityClient to be generic on
  CF and accept EntityManager<CC, CF>. Propagate CF through its type surface.
- QueryBuilder creation (downstream coordination): change createQueryBuilder to
  derive ITS = IndexTokensOf<CF> from EntityClient<CC, CF> and remove the
  explicit cf parameter from its public API.
- Types and tests (this repo):
  - Ensure exported types still compile with the new EntityManager signature.
  - Add/adjust tsd tests to confirm QueryOptions/ShardQueryMap typing remains
    stable and the CF channel continues to narrow per‑index PageKey types.
- Docs:
  - Update adapter docs/snippets to show builder creation without cf and
    emphasize “values‑first literal (as const)” for createEntityManager.
- Release:
  - Prepare minor release notes in this repo and coordinate adapter release
    once the downstream changes land.

## Completed

**CRITICAL: This list is append-only; do not edit items! Place most recent entries at the BOTTOM of the list. When pruning, remove older entries from the top.**

- Code: added CF as a phantom generic on EntityManager and updated the factory
  to return EntityManager<…, CF>. No runtime configLiteral field introduced.

- Interop: documented upstream changes and adapter leverage plan in
  .stan/interop/entity-client-dynamodb/preserve-config-literal-for-index-typing.md.

- Docs: updated TSDoc for EntityManager (CF phantom generic) and
  createEntityManager (CF capture from single-argument factory).

- Fix: resolved TS overload error in EntityManager.findIndexToken by dispatching
  with literal true/false; cleaned TSDoc to remove undefined @code tag usage.

- Tests (tsd): added findindextoken-narrowing.test-d.ts to assert that
  EntityManager.findIndexToken returns the configured index-token union (CF).

- Types: propagated CF through BaseEntityClient and BaseEntityClientOptions so
  client-facing calls (e.g., entityManager.findIndexToken) retain narrowed
  index-token unions.
- Tests (tsd): added findindextoken-through-client.test-d.ts to assert narrowing via BaseEntityClient.
