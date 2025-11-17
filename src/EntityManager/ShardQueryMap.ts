// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityToken } from './EntityToken';
import type { IndexTokensOf } from './PageKey';
import type { ShardQueryFunction } from './ShardQueryFunction';

/**
 * Relates a specific index token to a {@link ShardQueryFunction | `ShardQueryFunction`} to be performed on that index.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`}.
 * @typeParam ET - Entity token narrowing the function item types.
 * @typeParam ITS - Index token subset (inferred from object keys).
 * @typeParam CF - Optional values-first config literal type for narrowing. When
 *                 provided and it carries an `indexes` object with preserved
 *                 literal keys (prefer `as const` at call sites), the map keys
 *                 are constrained to that set. Excess keys are rejected by
 *                 excess property checks on object literals.
 *
 * @category EntityManager
 * @protected
 */
export type ShardQueryMap<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  ITS extends string,
  CF = unknown,
> = CF extends { indexes?: infer I }
  ? I extends Record<string, unknown>
    ? // Constrain keys to CF.indexes when present; extra keys are rejected by
      // excess property checks. Each value’s IT is also narrowed accordingly.
      Record<
        ITS & (keyof I & string),
        ShardQueryFunction<CC, ET, ITS & (keyof I & string), CF>
      >
    : Record<ITS, ShardQueryFunction<CC, ET, ITS, CF>>
  : Record<ITS, ShardQueryFunction<CC, ET, ITS, CF>>;

/**
 * Convenience alias for ShardQueryMap that derives ITS (index token subset)
 * directly from a values-first config literal CF when it carries `indexes`.
 *
 * - If CF has `indexes`, ITS becomes the union of its keys.
 * - Otherwise, ITS defaults to `string`.
 *
 * This is optional DX sugar; it does not change runtime behavior.
 */
export type ShardQueryMapByCF<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  CF = unknown,
> = ShardQueryMap<CC, ET, IndexTokensOf<CF>, CF>;
