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
 * @param entityToken - `entityManager.config.entities` key.
 * @param encoded - Encoded generated property value.
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
  entityToken: EntityToken,
  encoded: string,
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
            entityToken,
            key as keyof Item & string,
            value,
          ),
      ),
    );

    entityManager.logger.debug('decoded generated property', {
      entityToken,
      encoded,
      decoded,
    });

    return decoded as Partial<Item>;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { entityToken, encoded });

    throw error;
  }
}
