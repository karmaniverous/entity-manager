import {
  type Exactify,
  isNil,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import { EntityManager } from './EntityManager';
import { updateItemHashKey } from './updateItemHashKey';
import { updateItemRangeKey } from './updateItemRangeKey';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update generated properties, hash key, and range key on an {@link ItemMap | `ItemMap`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param item - {@link ItemMap | `ItemMap`} object.
 * @param overwrite - Overwrite existing properties (default `false`).
 *
 * @returns Shallow clone of `item` with updated properties.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function addKeys<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  item: Partial<Item>,
  overwrite = false,
): Partial<Item> {
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
    for (const property in entityManager.config.entities[entityToken]
      .generated) {
      if (overwrite || isNil(item[property as keyof Item])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          entityToken,
          property,
          newItem,
        );

        if (encoded) Object.assign(newItem, { [property]: encoded });
        else delete newItem[property as keyof Item];
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
