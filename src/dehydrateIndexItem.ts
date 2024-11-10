import type {
  EntityMap,
  Exactify,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import { encodeElement } from './encodeElement';
import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import { unwrapIndex } from './unwrapIndex';
import { validateEntityToken } from './validateEntityToken';
import { validateIndexToken } from './validateIndexToken';

/**
 * Condense an {@link EntityItem | `EntityItem`} into a delimited string representing the deduped, sorted, ungenerated component elements of an {@link Config.indexes | index}, leaving out those of the index hash key.
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
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.indexes`} key.
 * @param item - {@link EntityItem | `EntityItem`} object.
 *
 * @returns Dehydrated index value.
 *
 * @throws `Error` if `indexToken` is invalid.
 */
export function dehydrateIndexItem<
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
  entityToken: keyof Exactify<M> & string,
  indexToken: string,
  item: Item | undefined,
): string {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);
    validateIndexToken(entityManager, indexToken);

    // Handle degenerate case.
    if (!item) return '';

    // Unwrap index elements.
    const { hashKey } = entityManager.config.indexes[indexToken];

    const elements = unwrapIndex(entityManager, entityToken, indexToken, [
      hashKey,
    ]);

    // Join index element values.
    const { generatedKeyDelimiter } = entityManager.config;

    const dehydrated = elements
      .map((element) => encodeElement(entityManager, element, item))
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
