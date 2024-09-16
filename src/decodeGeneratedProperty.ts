import { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { objectify } from 'radash';

import { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { string2Stringifiable } from './string2Stringifiable';
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
  IndexableTypes extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  encoded: string,
  entityToken: EntityToken,
): Partial<Item> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Handle degenerate case.
    if (!encoded) return {};

    // Split encoded into keys.
    const keys = encoded.split(entityManager.config.generatedKeyDelimiter);

    // Initiate result with hashKey if sharded.
    const decoded = keys[0].includes(entityManager.config.shardKeyDelimiter)
      ? { [entityManager.config.hashKey]: keys.shift() }
      : {};

    // Split keys into values & validate.
    const values = keys.map((key) => {
      const pair = key.split(entityManager.config.generatedValueDelimiter);

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
          string2Stringifiable<IndexableTypes>(
            entityManager.config.entities[entityToken].types[key],
            value,
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
