import {
  type EntityMap,
  type Exactify,
  isNil,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';

import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
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
export function addKeys<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
  T extends TranscodeMap,
  Item extends EntityItem<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys>,
>(
  entityManager: EntityManager<
    M,
    HashKey,
    RangeKey,
    ShardedKeys,
    UnshardedKeys,
    TranscodedProperties,
    T
  >,
  entityToken: keyof Exactify<M> & string,
  item: Item,
  overwrite = false,
): Item {
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
      if (overwrite || isNil(item[property as keyof Item])) {
        const encoded = encodeGeneratedProperty(
          entityManager,
          property as ShardedKeys | UnshardedKeys,
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
