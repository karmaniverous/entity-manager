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
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export type EntityToken<CC extends BaseConfigMap> = Extract<
  keyof Exactify<CC['EntityMap']>,
  string
>;
