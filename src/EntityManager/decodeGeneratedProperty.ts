import { objectify } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import { decodeElement } from './decodeElement';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';

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
export function decodeGeneratedProperty<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  encoded: string,
): EntityItem<C> {
  try {
    const {
      generatedKeyDelimiter,
      generatedValueDelimiter,
      hashKey,
      shardKeyDelimiter,
    } = entityManager.config;

    // Handle degenerate case.
    if (!encoded) return {} as EntityItem<C>;

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
          decodeElement(entityManager, key as C['TranscodedProperties'], value),
      ),
    );

    entityManager.logger.debug('decoded generated property', {
      encoded,
      decoded,
    });

    return decoded as EntityItem<C>;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { encoded });

    throw error;
  }
}
