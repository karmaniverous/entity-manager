import type { Exactify } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityKey } from './EntityKey';
import type { EntityToken } from './EntityToken';

/** EntityOfToken — resolves the concrete entity shape for a specific entity token. */
export type EntityOfToken<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = Exactify<CC['EntityMap']>[ET];

/**
 * EntityItemByToken — database-facing partial item narrowed to a specific entity token.
 * Mirrors `EntityItem<CC>` with the entity surface restricted to `EntityOfToken<CC, ET>`.
 *
 * Note: If using createEntityManager with entitiesSchema, the schema must declare
 * only base (non-generated) properties. Generated keys/tokens are layered by EntityManager.
 */
export type EntityItemByToken<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = Partial<
  EntityOfToken<CC, ET> &
    Record<
      CC['HashKey'] | CC['RangeKey'] | CC['ShardedKeys'] | CC['UnshardedKeys'],
      string
    >
> &
  Record<string, unknown>;

/** EntityRecordByToken — database-facing record (keys required) narrowed to a specific entity token. */
export type EntityRecordByToken<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = EntityItemByToken<CC, ET> & EntityKey<CC>;

/**
 * Normalize literals: string | readonly string[] -\> union of strings.
 */
export type KeysFrom<K> = K extends readonly (infer E)[]
  ? Extract<E, string>
  : K extends string
    ? K
    : never;

/**
 * Project item shape by keys; if K is never/unknown, fall back to T.
 */
export type Projected<T, K> = [KeysFrom<K>] extends [never]
  ? T
  : // Intersect requested keys with the exactified key set of T to avoid
    // collapse to `never` when T carries an index signature. Guard Exactify
    // usage behind an object check to satisfy TS constraints when T is not
    // known to be an object.
    T extends object
    ? Pick<T, Extract<KeysFrom<K>, keyof Exactify<T>>>
    : T;

/**
 * Projected item by token — narrows EntityItemByToken by K when provided.
 */
export type ProjectedItemByToken<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  K = unknown,
> = Projected<EntityItemByToken<CC, ET>, K>;

export {};
