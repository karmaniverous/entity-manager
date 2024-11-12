// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { BaseEntityClientOptions } from './BaseEntityClientOptions';
import type { EntityManager } from './EntityManager';

/**
 * Base EntityClient class. Integrates {@link EntityManager | `EntityManager`} with injected logging & enhanced batch processing.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 */
export abstract class BaseEntityClient<C extends BaseConfigMap> {
  readonly batchProcessOptions: NonNullable<
    BaseEntityClientOptions['batchProcessOptions']
  >;
  readonly logger: NonNullable<BaseEntityClientOptions['logger']>;

  /**
   * DynamoDB EntityClient constructor.
   *
   * @param options - {@link BaseEntityClientOptions | `BaseEntityClientOptions`} object.
   */
  constructor(
    readonly entityManager: EntityManager<C>,
    options: BaseEntityClientOptions = {},
  ) {
    const { batchProcessOptions = {}, logger = console } = options;

    this.batchProcessOptions = batchProcessOptions;
    this.logger = logger;
  }
}
