import { isFunction } from 'radash';

import { conditionalize } from './conditionalize';
import type { EntityManagerClientBatchOptions } from './EntityManagerClientBatchOptions';
import type { LoggerOptions } from './Logger';

/**
 * EntityManagerClient base class options.
 *
 * @category Client
 */
export type EntityManagerClientOptions = EntityManagerClientBatchOptions &
  LoggerOptions;

/**
 * EntityManagerClient base class.
 *
 * @category Client
 */
export abstract class EntityManagerClient<
  O extends EntityManagerClientOptions,
> {
  #options: Required<O>;

  constructor({
    batchSize = 25,
    delayIncrement = 100,
    maxRetries = 5,
    throttle = 10,
    logger = console,
    logInternals = false,
    ...childOptions
  }: O) {
    if (!isFunction(logger.debug))
      throw new Error('logger must support debug method');
    if (!isFunction(logger.error))
      throw new Error('logger must support error method');

    this.#options = {
      batchSize,
      delayIncrement,
      maxRetries,
      throttle,
      logInternals,
      logger: {
        ...logger,
        debug: conditionalize(logger.debug, logInternals),
      },
      ...childOptions,
    } as Required<O>;
  }

  /**
   * Returns the options used to create the EntityManagerClient instance.
   */
  get options() {
    return this.#options;
  }
}
