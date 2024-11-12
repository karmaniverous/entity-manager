import { isNil } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import type { EntityRecord } from './EntityRecord';
import type { EntityToken } from './EntityToken';
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
 * @returns Shallow clone of `item` with updated properties.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function addKeys<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  item: EntityItem<C>,
  overwrite = false,
): EntityRecord<C> {
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
      if (overwrite || isNil(item[property as keyof EntityItem<C>])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          property as C['ShardedKeys'] | C['UnshardedKeys'],
          newItem,
        );

        if (encoded) Object.assign(newItem, { [property]: encoded });
        else delete newItem[property as keyof EntityItem<C>];
      }
    }

    entityManager.logger.debug('updated entity item generated properties', {
      item,
      entityToken,
      overwrite,
      newItem,
    });

    return newItem as EntityRecord<C>;
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
