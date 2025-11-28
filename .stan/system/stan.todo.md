# Development Plan

## Next up (in priority order)

- Entity Manager: add CF as a phantom generic on EntityManager and update the
  factory to return EntityManager<…, CF>.
  - Change: class EntityManager<CC extends BaseConfigMap, CF = unknown>.
  - Factory: createEntityManager returns EntityManager<CapturedConfigMapFrom<CC, EM>, CC>.
  - No runtime configLiteral field; CF is type‑only.
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
