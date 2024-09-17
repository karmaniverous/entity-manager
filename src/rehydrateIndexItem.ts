import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { shake, zipToObject } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { decodeEntityElement } from './decodeEntityElement';
import { EntityManager } from './EntityManager';
import { unwrapIndex } from './unwrapIndex';
import { validateEntityIndexToken } from './validateEntityIndexToken';

/**
 * Convert a delimited string into a partial {@link ItemMap | `ItemMap`} object representing the ungenerated component elements of a Config entity index.
 *
 * @remarks
 * Reverses {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`}.
 *
 * {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`} alphebetically sorts unwrapped index elements during the dehydration process. This method assumes delimited element values are presented in the same order.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param dehydrated - Dehydrated index value.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 * @param omit - Array of index components omitted from `dehydrated`.
 *
 * @returns Partial {@link ItemMap | `ItemMap`} object containing rehydrated index component elements.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function rehydrateIndexItem<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  dehydrated: string,
  entityToken: EntityToken,
  indexToken: string,
  omit: string[] = [],
): Partial<Item> {
  try {
    const { generatedKeyDelimiter } = entityManager.config;

    // Validate params.
    validateEntityIndexToken(entityManager, entityToken, indexToken);

    // Unwrap index elements.
    const elements = unwrapIndex(entityManager, entityToken, indexToken).filter(
      (element) => !omit.includes(element),
    );

    // Split dehydrated value & validate.
    const values = dehydrated.split(generatedKeyDelimiter);

    if (elements.length !== values.length)
      throw new Error('index rehydration key-value mismatch');

    // Assign values to elements.
    const rehydrated = shake(
      zipToObject(
        elements,
        values.map((value, i) =>
          decodeEntityElement(entityManager, value, entityToken, elements[i]),
        ),
      ),
    ) as Partial<Item>;

    console.debug('rehydrated index', {
      dehydrated,
      entityToken,
      indexToken,
      elements,
      values,
      rehydrated,
    });

    return rehydrated;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { dehydrated, entityToken, indexToken });

    throw error;
  }
}
