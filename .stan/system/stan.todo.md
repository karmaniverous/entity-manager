# Development Plan

## Next up (in priority order)

None

## Completed (append-only)

**CRITICAL: This list is append-only; do not edit items! Place most recent entries at the BOTTOM of the list. When pruning, remove older entries from the top.**

None

- Accept compile-time `entitiesSchema` in both flows:
  - Strip `entitiesSchema` (whitelist) in EntityManager constructor before Zod
    parsing so the same values-first config literal works via factory or direct
    constructor; runtime config remains unchanged.
  - Added runtime tests for factory/constructor acceptance and key validations:
    query param validation (limit/pageSize), rehydrate edge cases, key update
    error paths, and validator error paths.