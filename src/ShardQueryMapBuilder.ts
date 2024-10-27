import type { Entity } from '@karmaniverous/entity-tools';

import type { ShardQueryMap } from './ShardQueryMap';
import type { ShardQueryMapBuilderOptions } from './ShardQueryMapBuilderOptions';

/**
 * Entity Manager shard query builder base class.
 *
 * @category Query
 */
export abstract class ShardQueryMapBuilder<Item extends Entity> {
  constructor(readonly options: ShardQueryMapBuilderOptions) {}

  abstract getShardQueryMap(): ShardQueryMap<Item>;
}
