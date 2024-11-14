import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';

/**
 * Validate that an entity is defined in the EntityManager config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - `entityManager.config.entities` key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function validateEntityToken<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!entityManager.config.entities[entityToken])
    throw new Error('invalid entity token');
}
