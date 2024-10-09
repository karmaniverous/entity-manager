import type { ClientShardQueryMap } from './ShardQueryMap';
import type { ShardQueryMapBuilderOptions } from './ShardQueryMapBuilderOptions';

/**
 * Entity Manager shard query builder base class.
 *
 * @category Query
 */
export abstract class ShardQueryMapBuilder<
  Options extends ShardQueryMapBuilderOptions,
> {
  constructor(readonly options: Options) {}

  abstract getShardQueryMap(): ClientShardQueryMap;
}
