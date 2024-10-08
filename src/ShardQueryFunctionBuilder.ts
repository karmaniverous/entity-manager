import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryFunctionBuilderOptions } from './ShardQueryFunctionBuilderOptions';

/**
 * Entity Manager shard query builder base class.
 *
 * @category Query
 */
export abstract class ShardQueryFunctionBuilder<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
  Options extends ShardQueryFunctionBuilderOptions<
    Item,
    EntityToken,
    M,
    HashKey,
    RangeKey,
    T
  >,
> {
  constructor(private readonly options: Options) {}

  abstract getShardQueryFunction(): ShardQueryFunction<
    Item,
    EntityToken,
    M,
    HashKey,
    RangeKey,
    T
  >;
}
