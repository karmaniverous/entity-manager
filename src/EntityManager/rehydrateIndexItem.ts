import { shake, zipToObject } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import { decodeElement } from './decodeElement';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { StorageItem } from './StorageItem';
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
export function rehydrateIndexItem<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  indexToken: string,
  dehydrated: string,
): StorageItem<C> {
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
    ) as StorageItem<C>;

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
