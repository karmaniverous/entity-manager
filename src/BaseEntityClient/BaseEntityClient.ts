/* eslint-disable @typescript-eslint/no-unused-vars */
// imported to support API docs
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools';

import type { BaseConfigMap, EntityManager } from '../EntityManager';
import type { BaseEntityClientOptions } from './BaseEntityClientOptions';

/**
 * Base EntityClient class. Integrates {@link EntityManager | `EntityManager`} with injected logging & enhanced batch processing.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s
 *                 {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}.
 *                 If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam CF - Values-first config literal type captured by the manager (phantom; type-only). Propagated so
 *                 client-facing calls that return `IndexTokensOf<CF>` retain the narrowed union.
 *
 * @category EntityClient
 */
export abstract class BaseEntityClient<CC extends BaseConfigMap, CF = unknown> {
  /** Default batch process options. */
  readonly batchProcessOptions: NonNullable<
    BaseEntityClientOptions<CC, CF>['batchProcessOptions']
  >;

  /** {@link EntityManager | `EntityManager`} instance. */
  readonly entityManager: EntityManager<CC, CF>;

  /** Injected logger object. Must support `debug` and `error` methods. Default: `console` */
  readonly logger: NonNullable<BaseEntityClientOptions<CC, CF>['logger']>;

  /**
   * Base EntityClient constructor.
   *
   * @param options - {@link BaseEntityClientOptions | `BaseEntityClientOptions`} object.
   */
  constructor(options: BaseEntityClientOptions<CC, CF>) {
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
