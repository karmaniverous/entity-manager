import {
  type Exactify,
  isNil,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the range key on a partial {@link ItemMap | `ItemMap`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 * @param overwrite - Overwrite existing {@link ConfigKeys.rangeKey | `this.config.rangeKey`} property value (default `false`).
 *
 * @returns Shallow clone of `item` with updated range key.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `item` {@link ConfigEntity.uniqueProperty | `this.config.entities<entityToken>.uniqueProperty`} property value is missing.
 */
export function updateItemRangeKey<
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

    // Return current item if rangeKey exists and overwrite is false.
    if (item[entityManager.config.rangeKey as keyof Item] && !overwrite) {
      entityManager.logger.debug(
        'did not overwrite existing entity item range key',
        {
          entityToken,
          item,
          overwrite,
        },
      );

      return { ...item };
    }

    // Get item unique property & validate.
    const uniqueProperty =
      item[
        entityManager.config.entities[entityToken].uniqueProperty as keyof Item
      ];

    if (isNil(uniqueProperty)) throw new Error(`missing item unique property`);

    // Update range key.
    const newItem = Object.assign(
      { ...item },
      {
        [entityManager.config.rangeKey]: [
          entityManager.config.entities[entityToken].uniqueProperty,
          uniqueProperty,
        ].join(entityManager.config.generatedValueDelimiter),
      },
    );

    entityManager.logger.debug('updated entity item range key', {
      entityToken,
      overwrite,
      item,
      newItem,
    });

    return newItem;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        item,
        overwrite,
      });

    throw error;
  }
}
