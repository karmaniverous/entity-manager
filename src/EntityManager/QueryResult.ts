// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityToken } from './EntityToken';
import type { EntityItemByToken } from './TokenAware';

/**
 * A result returned by a query across multiple shards, where each shard may receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`}.
 * @typeParam ET - Entity token narrowing the result item type.
 * @typeParam ITS - Index token subset (carried for symmetry; not represented in the shape).
 *
 * @category EntityManager
 * @protected
 */
export interface QueryResult<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  ITS extends string,
> {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: EntityItemByToken<CC, ET>[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: string;
}
