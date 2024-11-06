import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { cluster, mapValues, range, unique, zipToObject } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import { EntityManager } from './EntityManager';
import { getHashKeySpace } from './getHashKeySpace';
import { getIndexComponents } from './getIndexComponents';
import type { PageKeyMap } from './PageKeyMap';
import { rehydrateIndexItem } from './rehydrateIndexItem';
import { updateItemRangeKey } from './updateItemRangeKey';
import { validateEntityIndexToken } from './validateEntityIndexToken';

/**
 * Rehydrate an array of dehydrated page keys into a {@link PageKeyMap | `PageKeyMap`} object.
 *
 * Reverses the {@link EntityManager.dehydratePageKeyMap | `dehydratePageKeyMap`} method.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexTokens - Array of {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} keys used as keys of the original {@link PageKeyMap | `PageKeyMap`}.
 * @param item - Partial item object sufficiently populated to generate index hash keys.
 * @param dehydrated - Array of dehydrated page keys or undefined if new query.
 * @param timestampFrom - Lower timestanp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `Date.now()`.
 *
 * @returns A tuple of `hashKeyToken` and rehydrated {@link PageKeyMap | `PageKeyMap`} object.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexTokens` is empty.
 * @throws `Error` if any `indexTokens` are invalid.
 * @throws `Error` if `indexTokens` represent indexes with inconsistent hashKeys.
 * @throws `Error` if `dehydrated` has invalid length.
 */
export function rehydratePageKeyMap<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  indexTokens: string[],
  item: Partial<Item>,
  dehydrated: string[] | undefined,
  timestampFrom = 0,
  timestampTo = Date.now(),
): [string, PageKeyMap<Item, T>] {
  try {
    // Validate indexTokens populated.
    if (!indexTokens.length) throw new Error('indexTokens empty');

    // Validate indexTokens exist.
    const hashKeys = unique(
      indexTokens.map((indexToken) => {
        validateEntityIndexToken(entityManager, entityToken, indexToken);
        return entityManager.config.entities[entityToken].indexes[indexToken]
          .hashKey;
      }),
    );

    // Validate hashKeys consistent.
    if (hashKeys.length > 1) throw new Error('inconsistent hashKeys');

    const [hashKeyToken] = hashKeys;

    indexTokens.map((index) =>
      validateEntityIndexToken(entityManager, entityToken, index),
    );

    // Shortcut empty dehydrated.
    if (dehydrated && !dehydrated.length) return [hashKeyToken, {}];

    // Get hash key space.
    const hashKeySpace = getHashKeySpace(
      entityManager,
      entityToken,
      hashKeyToken,
      item,
      timestampFrom,
      timestampTo,
    );

    // Default dehydrated.
    dehydrated ??= [...range(1, hashKeySpace.length * indexTokens.length, '')];

    // Validate dehydrated length
    if (dehydrated.length !== hashKeySpace.length * indexTokens.length)
      throw new Error('dehydrated length mismatch');

    // Rehydrate pageKeys.
    const rehydrated = mapValues(
      zipToObject(indexTokens, cluster(dehydrated, hashKeySpace.length)),
      (dehydratedIndexPageKeyMaps, index) =>
        zipToObject(hashKeySpace, (hashKey, i) => {
          if (!dehydratedIndexPageKeyMaps[i]) return;

          let item = {
            [hashKeyToken]: hashKey,
            ...rehydrateIndexItem(
              entityManager,
              entityToken,
              index,
              dehydratedIndexPageKeyMaps[i],
              [hashKeyToken],
            ),
          } as Partial<Item>;

          item = updateItemRangeKey(entityManager, entityToken, item);

          return zipToObject(
            getIndexComponents(entityManager, entityToken, index),
            (component) =>
              entityManager.config.entities[entityToken].generated[component]
                ? encodeGeneratedProperty(
                    entityManager,
                    entityToken,
                    component,
                    item,
                  )!
                : item[component as keyof Item],
          );
        }),
    );

    entityManager.logger.debug('rehydrated page key map', {
      entityToken,
      indexTokens,
      dehydrated,
      rehydrated,
    });

    return [hashKeyToken, rehydrated as PageKeyMap<Item, T>];
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        indexTokens,
        dehydrated,
      });

    throw error;
  }
}
