import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { BaseQueryOptions } from './BaseQueryOptions';
import { BaseShardQueryMapBuilder } from './BaseShardQueryMapBuilder';
import type { EntityMap, ItemMap } from './Config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager';

/**
 * Options passed to the {@link EntityManager.query | `EntityManager.query`} method.
 *
 * @category Query
 */
export interface QueryOptions<
  IndexParams,
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> extends BaseQueryOptions<Item, EntityToken, M, HashKey, RangeKey> {
  /** Instance of class extending {@link BaseShardQueryMapBuilder | `BaseShardQueryMapBuilder`}. */
  shardQueryMapBuilder: BaseShardQueryMapBuilder<
    IndexParams,
    Item,
    EntityToken,
    M,
    HashKey,
    RangeKey,
    T
  >;
}
