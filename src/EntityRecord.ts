import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityKey } from './EntityKey';

/**
 * Database-facing Entity record object: an {@link EntityItem} with hash and range key required.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 */
export type EntityRecord<C extends BaseConfigMap> = EntityItem<C> &
  EntityKey<C>;
