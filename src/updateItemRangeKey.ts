import {
  type Exactify,
  isNil,
  type TypeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem, EntityMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the range key on a partial {@link EntityItem | `EntityItem`} object. Mutates `item`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param item - Partial {@link EntityItem | `EntityItem`} object.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param overwrite - Overwrite existing {@link ConfigKeys.rangeKey | `this.config.rangeKey`} property value (default `false`).
 *
 * @returns Mutated `item` with updated range key.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `item` {@link ConfigEntity.uniqueProperty | `this.config.entities<entityToken>.uniqueProperty`} property value is missing.
 */
export function updateItemRangeKey<
  Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  item: Partial<Item>,
  entityToken: EntityToken,
  overwrite = false,
): Partial<Item> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Return current item if rangeKey exists and overwrite is false.
    if (item[entityManager.config.rangeKey as keyof Item] && !overwrite) {
      console.debug('did not overwrite existing entity item range key', {
        item,
        entityToken,
        overwrite,
      });

      return item;
    }

    // Get item unique property & validate.
    const uniqueProperty =
      item[
        entityManager.config.entities[entityToken].uniqueProperty as keyof Item
      ];

    if (isNil(uniqueProperty)) throw new Error(`missing item unique property`);

    // Update range key.
    Object.assign(item, {
      [entityManager.config.rangeKey]: [
        entityManager.config.entities[entityToken].uniqueProperty,
        uniqueProperty,
      ].join(entityManager.config.generatedValueDelimiter),
    });

    console.debug('updated entity item range key', {
      entityToken,
      overwrite,
      item,
    });

    return item;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { item, entityToken, overwrite });

    throw error;
  }
}
