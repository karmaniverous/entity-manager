import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  Exactify,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Extracts entity tokens from a {@link ConfigMap | `ConfigMap`}.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export type EntityToken<C extends BaseConfigMap> = keyof Exactify<
  C['EntityMap']
> &
  string;
