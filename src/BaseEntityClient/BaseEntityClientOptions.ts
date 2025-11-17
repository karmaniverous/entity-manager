import type { BatchProcessOptions } from '@karmaniverous/batch-process';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap, EntityManager } from '../EntityManager';

/**
 * Base EntityClient options.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 */
export interface BaseEntityClientOptions<C extends BaseConfigMap> {
  /** Default batch process options. */
  batchProcessOptions?: Omit<
    BatchProcessOptions<unknown, unknown>,
    'batchHandler' | 'unprocessedItemExtractor'
  >;

  /** {@link EntityManager | `EntityManager`} instance. */
  entityManager: EntityManager<C>;

  /** Injected logger object. Must support `debug` and `error` methods. Default: `console` */
  logger?: Pick<Console, 'debug' | 'error'>;
}
