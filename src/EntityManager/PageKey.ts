// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { StorageItem } from './StorageItem';
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
  StorageItem<CC>,
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
export type IndexHashKeyOf<CF, IT extends string> = CF extends {
  indexes?: infer I;
}
  ? I extends Record<string, unknown>
    ? IT extends keyof I
      ? I[IT] extends { hashKey: infer HK }
        ? HK & string
        : never
      : never
    : never
  : never;

export type IndexRangeKeyOf<CF, IT extends string> = CF extends {
  indexes?: infer I;
}
  ? I extends Record<string, unknown>
    ? IT extends keyof I
      ? I[IT] extends { rangeKey: infer RK }
        ? RK & string
        : never
      : never
    : never
  : never;

/**
 * Derive the union of index token names from a values-first config literal.
 *
 * When CF carries an `indexes` object with preserved literal keys (prefer `as const`),
 * this helper captures the index token union. Falls back to `string` if absent.
 */
export type IndexTokensOf<CF> = CF extends { indexes?: infer I }
  ? I extends Record<string, unknown>
    ? Extract<keyof I, string>
    : string
  : string;

export type HasIndexFor<CF, IT extends string> = CF extends {
  indexes?: infer I;
}
  ? I extends Record<string, unknown>
    ? IT extends keyof I
      ? true
      : false
    : false
  : false;

// Base key tokens used by all indexes (global hash & range).
/**
 * Base index component tokens shared by all indexes
 * (the global hashKey and rangeKey defined in the Config).
 *
 * @category QueryBuilder
 */
export type BaseKeyTokens<CC extends BaseConfigMap> =
  | CC['HashKey']
  | CC['RangeKey'];

// When CF/IT identify an index, build a key set via key-remapping (no overlaps):
// - Always include base key tokens.
// - Include index hashKey/rangeKey only when they do not collapse to base keys.
/**
 * Key set for index component tokens when CF/IT identify a concrete index.
 * - Always includes base key tokens (global hash/range).
 * - Conditionally includes index hashKey/rangeKey when they do not collapse
 *   to the base key union.
 *
 * @category QueryBuilder
 */
export type PresentIndexTokenSet<
  CC extends BaseConfigMap,
  CF,
  IT extends string,
> = Record<BaseKeyTokens<CC>, true> & {
  [K in IndexHashKeyOf<CF, IT> as K extends BaseKeyTokens<CC>
    ? never
    : K]: true;
} & {
  [K in IndexRangeKeyOf<CF, IT> as K extends BaseKeyTokens<CC>
    ? never
    : K]: true;
};

// Fallback key set when CF does not carry a typed index or IT is unknown.
/**
 * Key set for index component tokens when CF does not carry an `indexes` map
 * or IT is unknown. Includes global keys, generated keys, and transcodable
 * properties.
 *
 * @category QueryBuilder
 */
export type FallbackIndexTokenSet<CC extends BaseConfigMap> = Record<
  | CC['HashKey']
  | CC['RangeKey']
  | CC['ShardedKeys']
  | CC['UnshardedKeys']
  | CC['TranscodedProperties'],
  true
>;

export type IndexComponentTokens<
  CC extends BaseConfigMap,
  CF,
  IT extends string,
> =
  HasIndexFor<CF, IT> extends true
    ? keyof PresentIndexTokenSet<CC, CF, IT>
    : keyof FallbackIndexTokenSet<CC>;

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
> = Pick<StorageItem<CC>, IndexComponentTokens<CC, CF, IT>>;