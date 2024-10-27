import type { Entity } from '@karmaniverous/entity-tools';

import type { BaseShardQueryMapBuilderOptions } from './BaseShardQueryMapBuilderOptions';
import type { ShardQueryMap } from './ShardQueryMap';

/**
 * Entity Manager shard query builder base class.
 *
 * @category Query
 */
export abstract class BaseShardQueryMapBuilder<
  Item extends Entity,
  Options extends BaseShardQueryMapBuilderOptions,
> {
  constructor(readonly options: Options) {}

  abstract getShardQueryMap(): ShardQueryMap<Item>;
}
