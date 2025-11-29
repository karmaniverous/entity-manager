// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityToken } from './EntityToken';
import type { PageKeyByIndex } from './PageKey';
import type { EntityItemPartial } from './TokenAware';

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`}.
 * @typeParam ET - Entity token narrowing the item type.
 * @typeParam IT - Index token (for page key typing).
 * @typeParam CF - Optional values-first config literal type for narrowing.
 * @typeParam K - Optional projection keys; narrows item shape when provided.
 *
 * @category EntityManager
 * @protected
 */
export interface ShardQueryResult<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  IT extends string,
  CF = unknown,
  K = unknown,
> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: EntityItemPartial<CC, ET, K>[];

  /** The page key for the next query on this shard. */
  pageKey?: PageKeyByIndex<CC, ET, IT, CF>;
}
