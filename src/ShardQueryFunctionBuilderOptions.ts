import type {
  Exactify,
  PropertiesOfType,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';

/**
 * {@link ShardQueryFunctionBuilder | `ShardQueryFunctionBuilder`} options.
 *
 * @category Query
 */
export interface ShardQueryFunctionBuilderOptions<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> {
  /** {@link EntityManager | `EntityManager`} instance. */
  entityManager: EntityManager<M, HashKey, RangeKey, T>;

  /** `entityManager.config.entities` key. */
  entityToken: EntityToken;

  /** Either the designated entity hash key or a generated property with `sharded === true`. */
  hashKeyToken: HashKey | PropertiesOfType<M[EntityToken], void>;

  /** `entityManager.config.entities.<entityToken>.indexes` key. */
  indexToken: string;

  /** A partial `Item` sufficiently populated to generate the query hash key & index values. */
  item: Partial<Item>;

  /** Dehydrated page key from the previous query data page. */
  pageKey?: string;
}
