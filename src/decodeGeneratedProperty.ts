import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { objectify } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { decodeEntityElement } from './decodeEntityElement';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Decode a generated property value. Returns a partial ItemMap.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param encoded - Encoded generated property value.
 * @param entityToken - `entityManager.config.entities` key.
 *
 * @returns Partial {@link ItemMap | `ItemMap`} object with updated properties decoded from `encoded`.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function decodeGeneratedProperty<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  encoded: string,
  entityToken: EntityToken,
): Partial<Item> {
  try {
    const {
      generatedKeyDelimiter,
      generatedValueDelimiter,
      hashKey,
      shardKeyDelimiter,
    } = entityManager.config;

    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Handle degenerate case.
    if (!encoded) return {};

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
          decodeEntityElement(
            entityManager,
            value,
            entityToken,
            key as keyof Item & string,
          ),
      ),
    );

    console.debug('decoded generated property', {
      encoded,
      entityToken,
      decoded,
    });

    return decoded as Partial<Item>;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { encoded, entityToken });

    throw error;
  }
}
