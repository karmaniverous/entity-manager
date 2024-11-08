import type { BaseEntityClientOptions } from './BaseEntityClientOptions';

/**
 * Base EntityClient class. Integrates {@link EntityManager | `EntityManager`} with injected logging & enhanced batch processing.
 *
 * @category EntityClient
 */
export abstract class BaseEntityClient {
  public readonly batchProcessOptions: NonNullable<
    BaseEntityClientOptions['batchProcessOptions']
  >;
  public readonly logger: NonNullable<BaseEntityClientOptions['logger']>;

  /**
   * DynamoDB EntityClient constructor.
   *
   * @param options - {@link EntityClientOptions | `EntityClientOptions`} object.
   */
  constructor(options: BaseEntityClientOptions) {
    const { batchProcessOptions = {}, logger = console } = options;

    this.batchProcessOptions = batchProcessOptions;
    this.logger = logger;
  }
}
