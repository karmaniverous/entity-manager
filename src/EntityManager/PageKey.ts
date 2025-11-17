// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityToken } from './EntityToken';

/**
 * A partial {@link EntityItem | `EntityItem`} restricted to keys defined in `C`.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category QueryBuilder
 * @protected
 */
export type PageKey<CC extends BaseConfigMap> = Pick<
  EntityItem<CC>,
  | CC['HashKey']
  | CC['RangeKey']
  | CC['ShardedKeys']
  | CC['UnshardedKeys']
  | CC['TranscodedProperties']
>;

/**
 * Internal helpers to safely derive index component tokens for an index IT.
 *
 * These helpers avoid direct generic indexing into `CF['indexes'][IT]` which can
 * trigger TS2536. They guard presence and key membership before extracting
 * literal types when available.
 */
type IndexHashKeyOf<CF, IT extends string> = CF extends { indexes?: infer I }
  ? I extends Record<string, unknown>
    ? IT extends keyof I
      ? I[IT] extends { hashKey: infer HK }
        ? HK & string
        : never
      : never
    : never
  : never;

type IndexRangeKeyOf<CF, IT extends string> = CF extends { indexes?: infer I }
  ? I extends Record<string, unknown>
    ? IT extends keyof I
      ? I[IT] extends { rangeKey: infer RK }
        ? RK & string
        : never
      : never
    : never
  : never;

type HasIndexFor<CF, IT extends string> = CF extends { indexes?: infer I }
  ? I extends Record<string, unknown>
    ? IT extends keyof I
      ? true
      : false
    : false
  : false;

export type IndexComponentTokens<
  CC extends BaseConfigMap,
  CF,
  IT extends string,
> =
  HasIndexFor<CF, IT> extends true
    ?
        | CC['HashKey']
        | CC['RangeKey']
        | IndexHashKeyOf<CF, IT>
        | IndexRangeKeyOf<CF, IT>
    :
        | CC['HashKey']
        | CC['RangeKey']
        | CC['ShardedKeys']
        | CC['UnshardedKeys']
        | CC['TranscodedProperties'];

/**
 * Page key typed for a specific index token.
 *
 * - With CF (values-first config literal) present and carrying `indexes`, the
 *   shape narrows to exactly the component tokens of IT.
 * - Without CF, falls back to the broad PageKey<CC> shape.
 */
export type PageKeyByIndex<
  CC extends BaseConfigMap,
  // TECHDEBT: placeholder retained for symmetry with other ET-aware types.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ET extends EntityToken<CC>,
  IT extends string = string,
  CF = unknown,
> = Pick<EntityItem<CC>, IndexComponentTokens<CC, CF, IT>>;
