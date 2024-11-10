import { isNil } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the range key on a partial {@link ItemMap | `ItemMap`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `this.config.entities`} key.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 * @param overwrite - Overwrite existing {@link ConfigKeys.rangeKey | `this.config.rangeKey`} property value (default `false`).
 *
 * @returns Shallow clone of `item` with updated range key.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `item` {@link Config.uniqueProperty | `this.config.entities<entityToken>.uniqueProperty`} property value is missing.
 */
export function updateItemRangeKey<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  item: EntityItem<C>,
  overwrite = false,
): EntityItem<C> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Return current item if rangeKey exists and overwrite is false.
    if (
      item[entityManager.config.rangeKey as keyof EntityItem<C>] &&
      !overwrite
    ) {
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
        entityManager.config.entities[entityToken]
          .uniqueProperty as keyof EntityItem<C>
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
