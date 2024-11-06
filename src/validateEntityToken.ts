import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap } from './Config';
import { EntityManager } from './EntityManager';

/**
 * Validate that an entity is defined in the EntityManager config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - `entityManager.config.entities` key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function validateEntityToken<
  EntityToken extends keyof Exactify<M>,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!entityManager.config.entities[entityToken])
    throw new Error('invalid entity token');
}
