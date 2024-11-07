import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { encodeEntityElement } from './encodeEntityElement';
import { EntityManager } from './EntityManager';
import { unwrapIndex } from './unwrapIndex';
import { validateEntityIndexToken } from './validateEntityIndexToken';

/**
 * Condense a partial {@link ItemMap | `ItemMap`} object into a delimited string representing the deduped, sorted, ungenerated component elements of an {@link ConfigEntity.indexes | Entity index}.
 *
 * @remarks
 * Reverses {@link EntityManager.rehydrateIndexItem | `rehydrateIndexItem`}.
 *
 * To create the output value, entityManager method:
 *
 * * Unwraps `index` components into deduped, sorted, ungenerated elements.
 * * Joins `item` element values with {@link Config.generatedKeyDelimiter | `entityManager.config.generatedKeyDelimiter`}.
 *
 * `item` must be populated with all required index component elements!
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 *
 * @returns Dehydrated index value.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function dehydrateIndexItem<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  indexToken: string,
  item: Partial<Item> | undefined,
): string {
  try {
    const { generatedKeyDelimiter } = entityManager.config;

    // Validate params.
    validateEntityIndexToken(entityManager, entityToken, indexToken);

    // Handle degenerate case.
    if (!item) return '';

    // Unwrap index elements.
    const { hashKey } =
      entityManager.config.entities[entityToken].indexes[indexToken];
    const elements = unwrapIndex(entityManager, entityToken, indexToken, [
      hashKey,
    ]);

    // Join index element values.
    const dehydrated = elements
      .map((element) =>
        encodeEntityElement(entityManager, entityToken, element, item),
      )
      .join(generatedKeyDelimiter);

    entityManager.logger.debug('dehydrated index', {
      item,
      entityToken,
      indexToken,
      elements,
      dehydrated,
    });

    return dehydrated;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        item,
        entityToken,
        indexToken,
      });

    throw error;
  }
}
