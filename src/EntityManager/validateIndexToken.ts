import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';

/**
 * Validate that an entity index is defined in EntityManager config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param indexToken - {@link Config.indexes | `entityManager.config.indexes`} key.
 *
 * @throws `Error` if `indexToken` is invalid.
 */
export function validateIndexToken<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  indexToken: string,
): void {
  if (!(indexToken in entityManager.config.indexes))
    throw new Error('invalid index token');
}
