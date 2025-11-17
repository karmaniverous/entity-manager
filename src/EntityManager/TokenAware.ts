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
 * Mirrors EntityItem<CC> with the entity surface restricted to EntityOfToken<CC, ET>.
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

export {};
