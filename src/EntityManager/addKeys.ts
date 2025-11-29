import { isNil } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { StorageItem } from './StorageItem';
import type { StorageRecord } from './StorageRecord';
import { updateItemHashKey } from './updateItemHashKey';
import { updateItemRangeKey } from './updateItemRangeKey';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update generated properties, hash key, and range key on an {@link EntityItem | `EntityItem`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigEntity.uniqueProperty | `this.config.entities`} key.
 * @param item - {@link EntityItem | `EntityItem`} object.
 * @param overwrite - Overwrite existing properties (default `false`).
 *
 * @returns {@link EntityRecord | `EntityRecord`} object with updated properties.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function addKeys<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  item: StorageItem<C>,
  overwrite = false,
): StorageRecord<C> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Update hash key.
    let newItem = updateItemHashKey(
      entityManager,
      entityToken,
      item,
      overwrite,
    );

    // Update range key.
    newItem = updateItemRangeKey(
      entityManager,
      entityToken,
      newItem,
      overwrite,
    );

    // Update generated properties.
    const { sharded, unsharded } = entityManager.config.generatedProperties;

    for (const property in { ...sharded, ...unsharded }) {
      if (overwrite || isNil(item[property as keyof StorageItem<C>])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          property as C['ShardedKeys'] | C['UnshardedKeys'],
          newItem,
        );

        if (encoded) Object.assign(newItem, { [property]: encoded });
        else
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete newItem[property as keyof StorageItem<C>];
      }
    }

    entityManager.logger.debug('updated entity item generated properties', {
      item,
      entityToken,
      overwrite,
      newItem,
    });

    return newItem as StorageRecord<C>;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        item,
        entityToken,
        overwrite,
      });

    throw error;
  }
}
