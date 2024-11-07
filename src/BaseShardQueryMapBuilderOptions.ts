import type {
  Exactify,
  PropertiesOfType,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap } from './Config';
import { EntityManager } from './EntityManager';

/**
 * Constructor options for {@link BaseShardQueryMapBuilder | `BaseShardQueryMapBuilder`}.
 */
export interface BaseShardQueryMapBuilderOptions<
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> {
  /** {@link EntityManager | `EntityManager`} instance. */
  entityManager: EntityManager<M, HashKey, RangeKey, T>;

  /** Entity token. */
  entityToken: EntityToken;

  /** Hash key token. */
  hashKeyToken: PropertiesOfType<M[EntityToken], never> | HashKey;

  /** Dehydrated page key map. */
  pageKeyMap?: string;
}
