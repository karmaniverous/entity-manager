import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import type { ShardQueryMap } from './ShardQueryMap';
import type { ShardQueryMapBuilderOptions } from './ShardQueryMapBuilderOptions';

/**
 * Entity Manager shard query builder base class.
 *
 * @category Query
 */
export abstract class ShardQueryMapBuilder<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
  Options extends ShardQueryMapBuilderOptions<
    Item,
    EntityToken,
    M,
    HashKey,
    RangeKey,
    T
  >,
> {
  constructor(protected readonly options: Options) {}

  abstract getShardQueryMap(): ShardQueryMap<
    Item,
    EntityToken,
    M,
    HashKey,
    RangeKey,
    T
  >;
}
