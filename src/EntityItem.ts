import type { EntityMap, FlattenEntityMap } from '@karmaniverous/entity-tools';

/**
 * Extracts a database-facing partial item type from an {@link EntityMap} and generated properties, all of which are rendered as `string` values.
 *
 * @category Entities
 */
export type EntityItem<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
> = Partial<
  FlattenEntityMap<M> &
    Record<HashKey | RangeKey | ShardedKeys | UnshardedKeys, string>
> &
  Record<string, unknown>;
