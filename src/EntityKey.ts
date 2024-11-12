import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Entity key object containing only an {@link EntityItem} hash and range key.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 */
export type EntityKey<C extends BaseConfigMap> = Record<
  C['HashKey'] | C['RangeKey'],
  string
>;
