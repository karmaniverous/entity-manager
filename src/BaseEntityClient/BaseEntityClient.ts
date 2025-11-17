// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap, EntityManager } from '../EntityManager';
import type { BaseEntityClientOptions } from './BaseEntityClientOptions';

/**
 * Base EntityClient class. Integrates {@link EntityManager | `EntityManager`} with injected logging & enhanced batch processing.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityClient
 */
export abstract class BaseEntityClient<C extends BaseConfigMap> {
  /** Default batch process options. */
  readonly batchProcessOptions: NonNullable<
    BaseEntityClientOptions<C>['batchProcessOptions']
  >;

  /** {@link EntityManager | `EntityManager`} instance. */
  readonly entityManager: EntityManager<C>;

  /** Injected logger object. Must support `debug` and `error` methods. Default: `console` */
  readonly logger: NonNullable<BaseEntityClientOptions<C>['logger']>;

  /**
   * DynamoDB EntityClient constructor.
   *
   * @param options - {@link BaseEntityClientOptions | `BaseEntityClientOptions`} object.
   */
  constructor(options: BaseEntityClientOptions<C>) {
    const {
      batchProcessOptions = {},
      entityManager,
      logger = console,
    } = options;

    this.batchProcessOptions = batchProcessOptions;
    this.entityManager = entityManager;
    this.logger = logger;
  }
}
