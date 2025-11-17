// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';

/**
 * A result returned by a query across multiple shards, where each shard may receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export interface QueryResult<C extends BaseConfigMap> {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: EntityItem<C>[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: string;
}
