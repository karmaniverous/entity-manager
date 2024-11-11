// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';

/**
 * Replaces a the type of a key `K` in an `object` `T` with an {@link EntityItem | `EntityItem`}.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam T - The `object` type to modify.
 * @typeParam K - The key to replace with an {@link EntityItem | `EntityItem`}.
 *
 * @category EntityClient
 * @protected
 */
export type EntityItemize<
  C extends BaseConfigMap,
  T extends object,
  K extends string,
> = {
  [P in keyof T]: P extends K ? EntityItem<C> : T[P];
};
