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
 * @param item - {@link ItemMap | `ItemMap`} object.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
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
  item: Partial<Item>,
  entityToken: EntityToken,
  overwrite = false,
): Partial<Item> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Update hash key.
    let newItem = updateItemHashKey(
      entityManager,
      item,
      entityToken,
      overwrite,
    );

    // Update range key.
    newItem = updateItemRangeKey(
      entityManager,
      newItem,
      entityToken,
      overwrite,
    );

    // Update generated properties.
    for (const property in entityManager.config.entities[entityToken]
      .generated) {
      if (overwrite || isNil(item[property as keyof Item])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          newItem,
          entityToken,
          property,
        );

        if (encoded) Object.assign(newItem, { [property]: encoded });
        else delete newItem[property as keyof Item];
      }
    }

    console.debug('updated entity item generated properties', {
      item,
      entityToken,
      overwrite,
      newItem,
    });

    return newItem;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { item, entityToken, overwrite });

    throw error;
  }
}
