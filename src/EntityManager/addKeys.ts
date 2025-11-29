import { isNil } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { StorageItem } from './StorageItem';
import type { EntityItemPartial, EntityRecordPartial } from './TokenAware';
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
export function addKeys<C extends BaseConfigMap, T extends EntityToken<C>>(
  entityManager: EntityManager<C>,
  entityToken: T,
  item: EntityItemPartial<C, T>,
  overwrite = false,
): EntityRecordPartial<C, T> {
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
      if (overwrite || isNil(item[property as keyof typeof item])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          property as C['ShardedKeys'] | C['UnshardedKeys'],
          newItem as StorageItem<C>,
        );

        if (encoded) Object.assign(newItem, { [property]: encoded });
        else
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (newItem as Record<string, unknown>)[property];
      }
    }

    entityManager.logger.debug('updated entity item generated properties', {
      item,
      entityToken,
      overwrite,
      newItem,
    });

    return newItem;
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
