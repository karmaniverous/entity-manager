import {
  type Exactify,
  isNil,
  type TypeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import { EntityManager } from './EntityManager';
import { updateItemHashKey } from './updateItemHashKey';
import { updateItemRangeKey } from './updateItemRangeKey';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update generated properties, hash key, and range key on an {@link ItemMap | `ItemMap`} object. Mutates `item`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param item - {@link ItemMap | `ItemMap`} object.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param overwrite - Overwrite existing properties (default `false`).
 *
 * @returns Mutated `item` with updated properties.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function addKeys<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  item: Item,
  entityToken: EntityToken,
  overwrite = false,
): Item {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Update hash key.
    updateItemHashKey(entityManager, item, entityToken, overwrite);

    // Update range key.
    updateItemRangeKey(entityManager, item, entityToken, overwrite);

    // Update generated properties.
    for (const property in entityManager.config.entities[entityToken]
      .generated) {
      if (overwrite || isNil(item[property as keyof Item])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          item,
          entityToken,
          property,
        );

        if (encoded) Object.assign(item, { [property]: encoded });
        else delete item[property as keyof Item];
      }
    }

    console.debug('updated entity item generated properties', {
      entityToken,
      overwrite,
      item,
    });

    return item;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { entityToken, overwrite, item });

    throw error;
  }
}
