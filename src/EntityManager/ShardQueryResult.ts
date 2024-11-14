// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { PageKey } from './PageKey';

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export interface ShardQueryResult<C extends BaseConfigMap> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: EntityItem<C>[];

  /** The page key for the next query on this shard. */
  pageKey?: PageKey<C>;
}
