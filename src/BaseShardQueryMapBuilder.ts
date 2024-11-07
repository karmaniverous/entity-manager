import type {
  Exactify,
  PropertiesOfType,
  TranscodeMap,
} from '@karmaniverous/entity-tools';
import { mapValues } from 'radash';

import type { BuilderQueryOptions } from './BuilderQueryOptions';
import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import type { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryMap } from './ShardQueryMap';

/**
 * Abstract base class supporting a fluent API for building a {@link ShardQueryMap | `ShardQueryMap`} using a database client.
 *
 * @category ShardQueryMapBuilder
 */
export abstract class BaseShardQueryMapBuilder<
  IndexParams,
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> {
  /**
   * Maps `indexToken` values to database platform-specific parameters.
   *
   * @protected
   */
  readonly indexParamsMap: Record<string, IndexParams> = {};

  /** BaseShardQueryMapBuilder constructor. */
  constructor(
    public readonly entityManager: EntityManager<M, HashKey, RangeKey, T>,
    public readonly entityToken: EntityToken,
    public readonly hashKeyToken:
      | PropertiesOfType<M[EntityToken], never>
      | HashKey,
    public readonly pageKeyMap?: string,
  ) {}

  protected abstract getShardQueryFunction(
    indexToken: string,
  ): ShardQueryFunction<Item>;

  /**
   * Builds a {@link ShardQueryMap | `ShardQueryMap`} object.
   *
   * @returns - The {@link ShardQueryMap | `ShardQueryMap`} object.
   */
  build(): ShardQueryMap<Item> {
    return mapValues(this.indexParamsMap, (indexConfig, indexToken) =>
      this.getShardQueryFunction(indexToken),
    );
  }

  async query(
    options: BuilderQueryOptions<Item, EntityToken, M, HashKey, RangeKey>,
  ) {
    const { entityManager, entityToken, pageKeyMap } = this;
    const shardQueryMap = this.build();

    return await entityManager.query<Item, EntityToken>({
      ...options,
      entityToken,
      pageKeyMap,
      shardQueryMap,
    });
  }
}
