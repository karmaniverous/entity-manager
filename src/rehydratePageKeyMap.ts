import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { cluster, mapValues, range, zipToObject } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import { EntityManager } from './EntityManager';
import { getHashKeySpace } from './getHashKeySpace';
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
 * @param dehydrated - Array of dehydrated page keys or undefined if new query.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexTokens - Array of {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} keys used as keys of the original {@link PageKeyMap | `PageKeyMap`}.
 * @param timestampFrom - Lower timestanp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `Date.now()`.
 *
 * @returns Rehydrated {@link PageKeyMap | `PageKeyMap`} object.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexTokens` is empty.
 * @throws `Error` if any `indexTokens` are invalid.
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
  dehydrated: string[] | undefined,
  entityToken: EntityToken,
  indexTokens: string[],
  timestampFrom = 0,
  timestampTo = Date.now(),
): PageKeyMap<Item, T> {
  try {
    // Validate params.
    if (!indexTokens.length) throw new Error('indexTokens empty');
    indexTokens.map((index) =>
      validateEntityIndexToken(entityManager, entityToken, index),
    );

    // Shortcut empty dehydrated.
    if (dehydrated && !dehydrated.length) return {};

    // Get hash key space.
    const hashKeySpace = getHashKeySpace(
      entityManager,
      entityToken,
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
            [entityManager.config.hashKey]: hashKey,
            ...rehydrateIndexItem(
              entityManager,
              dehydratedIndexPageKeyMaps[i],
              entityToken,
              index,
              [entityManager.config.hashKey],
            ),
          } as Partial<Item>;

          item = updateItemRangeKey(entityManager, item, entityToken);

          return zipToObject(
            entityManager.config.entities[entityToken].indexes[index],
            (component) =>
              entityManager.config.entities[entityToken].generated[component]
                ? encodeGeneratedProperty(
                    entityManager,
                    item,
                    entityToken,
                    component,
                  )!
                : item[component as keyof Item],
          );
        }),
    );

    console.debug('rehydrated page key map', {
      dehydrated,
      entityToken,
      indexTokens,
      rehydrated,
    });

    return rehydrated as PageKeyMap<Item, T>;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, {
        dehydrated,
        entityToken,
        indexTokens,
      });

    throw error;
  }
}
