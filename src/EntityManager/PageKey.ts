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
 * Internal helper — derive index component tokens for an index IT.
 *
 * If CF (config-literal) provides an `indexes` object with preserved literal
 * keys, we return the union of [global hash/range] plus the specific
 * index hashKey/rangeKey for IT. Otherwise, fall back to the broad union
 * of all token sets.
 */
type IndexComponentTokens<
  CC extends BaseConfigMap,
  CF,
  IT extends string,
> = CF extends {
  indexes?: Record<string, { hashKey: string; rangeKey: string }>;
}
  ? IT extends keyof CF['indexes']
    ?
        | CC['HashKey']
        | CC['RangeKey']
        | (CF['indexes'][IT]['hashKey'] & string)
        | (CF['indexes'][IT]['rangeKey'] & string)
    : CC['HashKey'] | CC['RangeKey']
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
  ET extends EntityToken<CC>,
  IT extends string = string,
  CF = unknown,
> = Pick<EntityItem<CC>, IndexComponentTokens<CC, CF, IT>>;
