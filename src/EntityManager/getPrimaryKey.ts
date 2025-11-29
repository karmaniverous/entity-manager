import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityKey } from './EntityKey';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import { getHashKeySpace } from './getHashKeySpace';
import type { EntityItemPartial } from './TokenAware';
import { updateItemHashKey } from './updateItemHashKey';
import { updateItemRangeKey } from './updateItemRangeKey';

/**
 * Convert an {@link EntityItem | `EntityItem`} into one or more {@link EntityKey | `EntityKey`} values.
 *
 * Behavior:
 * - Always returns an array of keys.
 * - If `overwrite` is false and the item already has both hash and range keys, returns exactly that pair.
 * - Otherwise, computes the range key. Then:
 *   - If the timestampProperty is present, computes exactly one hash key and returns a single key.
 *   - If the timestampProperty is missing, enumerates the hash-key space across all shard bumps
 *     (with uniqueProperty present → one suffix per bump) and returns one key per bump.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config | `Config`} `entities` key.
 * @param item - {@link EntityItem | `EntityItem`} object.
 * @param overwrite - Overwrite existing properties (default `false`).
 *
 * @returns Array of {@link EntityKey | `EntityKey`} values derived from `item`.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getPrimaryKey<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  item: EntityItemPartial<C, EntityToken<C>>,
  overwrite = false,
): EntityKey<C>[] {
  const { hashKey, rangeKey } = entityManager.config;

  // If both keys are present and we're not overwriting, return the exact pair.
  const rec = item as Partial<Record<string, string>>;
  const hk = hashKey;
  const rk = rangeKey;
  if (!overwrite && rec[hk] && rec[rk]) {
    return [
      {
        [hashKey]: rec[hk],
        [rangeKey]: rec[rk],
      } as EntityKey<C>,
    ];
  }

  // Compute/refresh the range key (throws if uniqueProperty missing).
  const withRangeKey = updateItemRangeKey(
    entityManager,
    entityToken,
    item,
    true,
  );

  // If timestamp present, compute exactly one hash key and return single pair.
  const tsProp = entityManager.config.entities[entityToken].timestampProperty;
  if ((withRangeKey as Record<string, unknown>)[tsProp] !== undefined) {
    // Note: use StorageItem here
    const withHashKey = updateItemHashKey(
      entityManager,
      entityToken,
      withRangeKey,
      true,
    );

    return [
      {
        [hashKey]: withHashKey[hashKey] as string,
        [rangeKey]: withHashKey[rangeKey] as string,
      } as EntityKey<C>,
    ];
  }

  // No timestamp: enumerate hash-key space across all shard bumps (0..Infinity).
  const hashKeys = getHashKeySpace(
    entityManager,
    entityToken,
    hashKey as C['HashKey'],
    withRangeKey,
    0,
    Infinity,
  );

  // Map to keys and de-duplicate.
  const rangeKeyValue = withRangeKey[rangeKey] as string;
  const seen = new Set<string>();
  const keys = hashKeys
    .map((hk) => {
      const key = {
        [hashKey]: hk,
        [rangeKey]: rangeKeyValue,
      } as unknown as EntityKey<C>;
      const sig = `${hk}|${rangeKeyValue}`;
      if (seen.has(sig)) return undefined;
      seen.add(sig);
      return key;
    })
    .filter((k): k is EntityKey<C> => !!k);

  return keys;
}
