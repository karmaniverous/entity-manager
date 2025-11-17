// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityToken } from './EntityToken';
import type { ShardQueryFunction } from './ShardQueryFunction';

/**
 * Relates a specific index token to a {@link ShardQueryFunction | `ShardQueryFunction`} to be performed on that index.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`}.
 * @typeParam ET - Entity token narrowing the function item types.
 * @typeParam ITS - Index token subset (inferred from object keys).
 *
 * @category EntityManager
 * @protected
 */
export type ShardQueryMap<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  ITS extends string,
> = Record<ITS, ShardQueryFunction<CC, ET, ITS>>;
