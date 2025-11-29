import { objectify } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import { decodeElement } from './decodeElement';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { EntityItemPartial } from './TokenAware';

/**
 * Decode a generated property value. Returns an {@link EntityItem | `EntityItem`}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param encoded - Encoded generated property value.
 *
 * @returns {@link EntityItem | `EntityItem`} object with updated properties decoded from `encoded`.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function decodeGeneratedProperty<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
>(
  entityManager: EntityManager<CC>,
  entityToken: ET,
  encoded: string,
): EntityItemPartial<CC, ET> {
  try {
    const {
      generatedKeyDelimiter,
      generatedValueDelimiter,
      hashKey,
      shardKeyDelimiter,
    } = entityManager.config;

    // Handle degenerate case.
    if (!encoded) return {} as EntityItemPartial<CC, ET>;

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
          decodeElement(
            entityManager,
            key as CC['TranscodedProperties'],
            value,
          ),
      ),
    );

    entityManager.logger.debug('decoded generated property', {
      encoded,
      decoded,
    });

    // entityToken used for typing only (ET-narrowed result).
    void entityToken;
    return decoded as EntityItemPartial<CC, ET>;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { encoded });

    throw error;
  }
}
