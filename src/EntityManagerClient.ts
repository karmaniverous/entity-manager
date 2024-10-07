import { conditionalize } from './conditionalize';
import { EntityManagerClientBatchOptions } from './EntityManagerClientBatchOptions';
import { LoggerOptions } from './Logger';

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
    ...options
  }: O) {
    this.#options = {
      ...options,
      batchSize,
      delayIncrement,
      maxRetries,
      throttle,
      logInternals,
      logger: {
        ...logger,
        debug: conditionalize(logger.debug, logInternals),
      },
    } as Required<O>;
  }

  /**
   * Returns the options used to create the EntityManagerClient instance.
   */
  get options() {
    return this.#options;
  }
}
