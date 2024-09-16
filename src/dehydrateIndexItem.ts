import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
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
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 * @param omit - Array of index components to omit from the output value.
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
  IndexableTypes extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  item: Partial<Item> | undefined,
  entityToken: EntityToken,
  indexToken: string,
  omit: string[] = [],
): string {
  try {
    // Validate params.
    validateEntityIndexToken(entityManager, entityToken, indexToken);

    // Handle degenerate case.
    if (!item) return '';

    // Unwrap index elements.
    const elements = unwrapIndex(entityManager, entityToken, indexToken).filter(
      (element) => !omit.includes(element),
    );

    // Join index element values.
    const dehydrated = elements
      .map((element) => item[element as keyof Item]?.toString() ?? '')
      .join(entityManager.config.generatedKeyDelimiter);

    console.debug('dehydrated index', {
      item,
      entityToken,
      indexToken,
      elements,
      dehydrated,
    });

    return dehydrated;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { item, entityToken, indexToken });

    throw error;
  }
}
