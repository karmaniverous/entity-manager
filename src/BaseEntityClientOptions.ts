import type { BatchProcessOptions } from '@karmaniverous/batch-process';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

/**
 * Base EntityClient options.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 */
export interface BaseEntityClientOptions {
  /** Default batch process options. */
  batchProcessOptions?: Omit<
    BatchProcessOptions<unknown, unknown>,
    'batchHandler' | 'unprocessedItemExtractor'
  >;

  /** Injected logger object. Must support `debug` and `error` methods. Default: `console` */
  logger?: Pick<Console, 'debug' | 'error'>;
}
