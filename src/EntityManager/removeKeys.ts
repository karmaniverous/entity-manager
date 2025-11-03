import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import type { EntityRecord } from './EntityRecord';
import type { EntityToken } from './EntityToken';
import { validateEntityToken } from './validateEntityToken';

/**
 * Strips generated properties, hash key, and range key from an {@link EntityRecord | `EntityRecord`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param item - {@link EntityRecord | `EntityRecord`} object.
 *
 * @returns {@link EntityItem | `EntityItem`} with generated properties, hash key & range key removed.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function removeKeys<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  item: EntityRecord<C>,
): EntityItem<C> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Delete hash & range keys.
    const newItem = { ...item };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newItem[entityManager.config.hashKey as keyof EntityItem<C>];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newItem[entityManager.config.rangeKey as keyof EntityItem<C>];

    // Delete generated properties.
    const { sharded, unsharded } = entityManager.config.generatedProperties;

    for (const property in { ...sharded, ...unsharded })
      delete newItem[property as keyof EntityItem<C>];

    entityManager.logger.debug('stripped entity item generated properties', {
      entityToken,
      item,
      newItem,
    });

    return newItem;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { entityToken, item });

    throw error;
  }
}
