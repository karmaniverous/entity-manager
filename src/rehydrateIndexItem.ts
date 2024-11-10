import type {
  EntityMap,
  Exactify,
  TranscodableProperties,
  TranscodeMap,
} from '@karmaniverous/entity-tools';
import { shake, zipToObject } from 'radash';

import { decodeElement } from './decodeElement';
import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import { unwrapIndex } from './unwrapIndex';
import { validateEntityToken } from './validateEntityToken';
import { validateIndexToken } from './validateIndexToken';

/**
 * Convert a delimited string into an {@link EntityItem | `EntityItem`} object representing the ungenerated component elements of a Config entity index, minus its hash key.
 *
 * @remarks
 * Reverses {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`}.
 *
 * {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`} alphebetically sorts unwrapped index elements during the dehydration process. This method assumes delimited element values are presented in the same order.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link Config.indexes | `entityManager.config.indexes`} key.
 * @param dehydrated - Dehydrated index value.
 *
 * @returns {@link EntityItem | `EntityItem`} object containing rehydrated index component elements.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function rehydrateIndexItem<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends TranscodableProperties<M, T>,
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
  indexToken: string,
  dehydrated: string,
): Item {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);
    validateIndexToken(entityManager, indexToken);

    // Unwrap index elements.
    const { hashKey } = entityManager.config.indexes[indexToken];

    const elements = unwrapIndex(entityManager, entityToken, indexToken, [
      hashKey,
    ]);

    // Split dehydrated value & validate.
    const { generatedKeyDelimiter } = entityManager.config;

    const values = dehydrated.split(generatedKeyDelimiter);

    if (elements.length !== values.length)
      throw new Error('index rehydration key-value mismatch');

    // Assign values to elements.
    const rehydrated = shake(
      zipToObject(
        elements,
        values.map((value, i) =>
          decodeElement(entityManager, elements[i], value),
        ),
      ),
    ) as Item;

    entityManager.logger.debug('rehydrated index', {
      entityToken,
      indexToken,
      dehydrated,
      elements,
      values,
      rehydrated,
    });

    return rehydrated;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        indexToken,
        dehydrated,
      });

    throw error;
  }
}
