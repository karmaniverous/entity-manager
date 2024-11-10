import type {
  EntityMap,
  Exactify,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import { BaseEntityClient } from './BaseEntityClient';
import { EntityManager } from './EntityManager';

/**
 * Constructor options for {@link BaseQueryBuilder | `BaseQueryBuilder`}.
 *
 * @category QueryBuilder
 */
export interface BaseQueryBuilderOptions<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
  T extends TranscodeMap,
  EntityClient extends BaseEntityClient,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  entityClient: EntityClient;

  /** {@link EntityManager | `EntityManager`} instance. */
  entityManager: EntityManager<
    M,
    HashKey,
    RangeKey,
    ShardedKeys,
    UnshardedKeys,
    TranscodedProperties,
    T
  >;

  /** Entity token. */
  entityToken: keyof Exactify<M> & string;

  /** Hash key token. */
  hashKeyToken: HashKey | ShardedKeys;

  /** Dehydrated page key map. */
  pageKeyMap?: string;
}
