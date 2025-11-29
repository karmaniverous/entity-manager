import { isNil } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { StorageItem } from './StorageItem';
import type { EntityItemPartial, EntityRecordPartial } from './TokenAware';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the range key on an {@link EntityItemPartial | `EntityItemPartial`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `this.config.entities`} key.
 * @param item - {@link StorageItem | `StorageItem`} object.
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
  item: EntityItemPartial<C, EntityToken<C>>,
  overwrite = false,
): EntityRecordPartial<C, EntityToken<C>> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Return current item if rangeKey exists and overwrite is false.
    const rkProp = entityManager.config.rangeKey as keyof StorageItem<C>;
    if ((item as StorageItem<C>)[rkProp] && !overwrite) {
      entityManager.logger.debug(
        'did not overwrite existing entity item range key',
        {
          entityToken,
          item,
          overwrite,
        },
      );

      return { ...item } as EntityRecordPartial<C, EntityToken<C>>;
    }

    // Get item unique property & validate.
    const upProp = entityManager.config.entities[entityToken]
      .uniqueProperty as keyof StorageItem<C>;
    const uniqueValue = (item as StorageItem<C>)[upProp];

    if (isNil(uniqueValue)) throw new Error(`missing item unique property`);

    // Update range key.
    const newItem = Object.assign(
      { ...item },
      {
        [entityManager.config.rangeKey]: [
          entityManager.config.entities[entityToken].uniqueProperty,
          String(uniqueValue),
        ].join(entityManager.config.generatedValueDelimiter),
      },
    ) as EntityRecordPartial<C, EntityToken<C>>;

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
