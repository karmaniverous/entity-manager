import type { Exactify } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityKey } from './EntityKey';
import type { EntityToken } from './EntityToken';

/**
 * Entity-of-token — resolves the concrete entity shape for a token ET.
 */
export type EOT<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = Exactify<CC['EntityMap']>[ET];

/**
 * EntityItemByToken — database-facing partial item for a specific entity token.
 * Mirrors EntityItem<CC> but narrows the entity surface to the token.
 */
export type EIBT<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
> = Partial<
  EOT<CC, ET> &
    Record<
      CC['HashKey'] | CC['RangeKey'] | CC['ShardedKeys'] | CC['UnshardedKeys'],
      string
    >
> &
  Record<string, unknown>;

/**
 * EntityRecordByToken — database-facing record (keys required) for a token.
 */
export type ERBT<CC extends BaseConfigMap, ET extends EntityToken<CC>> = EIBT<
  CC,
  ET
> &
  EntityKey<CC>;

export {};
