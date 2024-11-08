import type { BatchProcessOptions } from '@karmaniverous/batch-process';

/**
 * Base EntityClient options.
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
