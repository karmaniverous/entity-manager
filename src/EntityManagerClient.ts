import { cluster, isFunction, parallel } from 'radash';
import { setTimeout } from 'timers/promises';

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
 * @typeParam O - Options type extended from {@link EntityManagerClientOptions | `EntityManagerClientOptions`}.
 *
 * @category Client
 */
export abstract class EntityManagerClient<
  O extends EntityManagerClientOptions,
> {
  #options: Required<O>;

  /**
   * EntityManagerClient base constructor.
   * @param options - Options object extended from {@link EntityManagerClientOptions | `EntityManagerClientOptions`}.
   */
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

  /**
   * Executes a batch operation.
   *
   * @param items - Items to batch execute.
   * @param executeBatch - Function to execute the batch.
   * @param getUnprocessedItems - Function to get unprocessed items from the output.
   * @param options - Batch options.
   *
   * @typeParam Item - Input item type.
   * @typeParam Output - Output type.
   *
   * @returns Output array.
   */
  protected async batchExecute<Item, Output>(
    items: Item[],
    executeBatch: (items: Item[]) => Promise<Output>,
    getUnprocessedItems?: (output: Output) => Item[] | undefined,
    {
      batchSize = this.options.batchSize,
      delayIncrement = this.options.delayIncrement,
      maxRetries = this.options.maxRetries,
      throttle = this.options.throttle,
    }: EntityManagerClientBatchOptions = {},
  ): Promise<Output[]> {
    const batches = cluster(items, batchSize);
    const outputs: Output[] = [];

    await parallel(throttle!, batches, async (batch) => {
      let delay = 0;
      let retry = 0;

      while (batch.length) {
        if (delay) await setTimeout(delay);

        const output = await executeBatch(batch);

        this.options.logger!.debug('executed batch', {
          batch,
          delay,
          retry,
          output,
        });

        outputs.push(output);

        batch = getUnprocessedItems?.(output) ?? [];

        if (batch.length) {
          if (retry === maxRetries) throw new Error('max retries exceeded');

          delay = delay ? delay * 2 : delayIncrement!;
          retry++;
        }
      }
    });

    return outputs;
  }
}
