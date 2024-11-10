import type {
  EntityMap,
  Exactify,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Strips generated properties, hash key, and range key from an {@link ItemMap | `ItemMap`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param item - {@link ItemMap | `ItemMap`} object.
 *
 * @returns Shallow clone of `item` without generated properties, hash key or range key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function removeKeys<
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
): Item {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Delete hash & range keys.
    const newItem = { ...item };
    delete newItem[entityManager.config.hashKey as keyof Item];
    delete newItem[entityManager.config.rangeKey as keyof Item];

    // Delete generated properties.
    const { sharded, unsharded } = entityManager.config.generatedProperties;

    for (const property in { ...sharded, ...unsharded })
      delete newItem[property as keyof Item];

    entityManager.logger.debug('stripped entity item generated properties', {
      entityToken,
      item,
      newItem,
    });

    return newItem;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { entityToken, item });

    throw error;
  }
}
