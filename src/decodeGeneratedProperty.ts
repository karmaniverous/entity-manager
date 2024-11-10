import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';
import { objectify } from 'radash';

import { decodeElement } from './decodeElement';
import { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';

/**
 * Decode a generated property value. Returns an {@link EntityItem | `EntityItem`}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - `entityManager.config.entities` key.
 * @param encoded - Encoded generated property value.
 *
 * @returns {@link EntityItem | `EntityItem`} object with updated properties decoded from `encoded`.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function decodeGeneratedProperty<
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
  encoded: string,
): Item {
  try {
    const {
      generatedKeyDelimiter,
      generatedValueDelimiter,
      hashKey,
      shardKeyDelimiter,
    } = entityManager.config;

    // Handle degenerate case.
    if (!encoded) return {} as Item;

    // Split encoded into keys.
    const keys = encoded.split(generatedKeyDelimiter);

    // Initiate result with hashKey if sharded.
    const decoded = keys[0].includes(shardKeyDelimiter)
      ? { [hashKey]: keys.shift() }
      : {};

    // Split keys into values & validate.
    const values = keys.map((key) => {
      const pair = key.split(generatedValueDelimiter);

      if (pair.length !== 2)
        throw new Error(`invalid generated property value '${key}'`);

      return pair;
    });

    // Assign decoded properties.
    Object.assign(
      decoded,
      objectify(
        values,
        ([key]) => key,
        ([key, value]) =>
          decodeElement(entityManager, key as TranscodedProperties, value),
      ),
    );

    entityManager.logger.debug('decoded generated property', {
      encoded,
      decoded,
    });

    return decoded as Item;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { encoded });

    throw error;
  }
}
