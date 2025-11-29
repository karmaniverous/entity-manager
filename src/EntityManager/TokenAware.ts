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
 * EntityItem — domain-facing item narrowed to a specific entity token, plus
 * optional key/token properties. Required fields per captured entitiesSchema
 * (when present); no string index signature.
 */
export type EntityItem<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = EntityOfToken<CC, ET> &
  Partial<
    Record<
      CC['HashKey'] | CC['RangeKey'] | CC['ShardedKeys'] | CC['UnshardedKeys'],
      string
    >
  >;

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

/** EntityRecord — DB-facing record (keys required), narrowed to a specific entity token. */
export type EntityRecord<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = Partial<EntityItem<CC, ET>> & EntityKey<CC>;

/** EntityItemPartial — projected/seed domain shape by token.
 * - If K provided: required projected keys (Projected<…>).
 * - If K omitted: permissive seed (Partial<EntityItem<…>>).
 */
export type EntityItemPartial<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  K = unknown,
> = [KeysFrom<K>] extends [never]
  ? Partial<EntityItem<CC, ET>>
  : Projected<EntityItem<CC, ET>, K>;

/** EntityRecordPartial — projected DB record shape by token. */
export type EntityRecordPartial<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  K = unknown,
> = Projected<EntityRecord<CC, ET>, K>;

export {};
