import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { StorageItem } from './StorageItem';
import type { StorageRecord } from './StorageRecord';
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
  item: StorageRecord<C>,
): StorageItem<C> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Build a set of keys to strip (hash, range, and all generated properties).
    const {
      hashKey,
      rangeKey,
      generatedProperties: { sharded, unsharded },
    } = entityManager.config;

    const keysToStrip = new Set<string>([
      hashKey,
      rangeKey,
      ...Object.keys(sharded),
      ...Object.keys(unsharded),
    ]);

    // Create a shallow copy of item omitting the keys above (no delete operator),
    // avoiding any-typed assignments.
    const source = item as Record<string, unknown>;
    const newItemObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(source)) {
      if (!keysToStrip.has(key)) {
        newItemObj[key] = value;
      }
    }

    entityManager.logger.debug('stripped entity item generated properties', {
      entityToken,
      item,
      newItem: newItemObj,
    });

    return newItemObj as unknown as import('./StorageItem').StorageItem<C>;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { entityToken, item });

    throw error;
  }
}
