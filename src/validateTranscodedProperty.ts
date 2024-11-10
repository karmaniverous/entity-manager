import type {
  EntityMap,
  TranscodableProperties,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import { EntityManager } from './EntityManager';

/**
 * Validate that a property is defined as an {@link EntityManager | `EntityManager`} {@link Config.propertyTranscodes | transcoded property}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param property - {@link Config.propertyTranscodes | Transcoded property} key.
 *
 * @throws `Error` if `property` is not a {@link Config.propertyTranscodes | transcoded property}.
 */
export function validateTranscodedProperty<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends TranscodableProperties<M, T>,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<
    M,
    HashKey,
    RangeKey,
    ShardedKeys,
    UnshardedKeys,
    TranscodedProperties,
    T
  >,
  property: TranscodedProperties,
): void {
  if (!(property in entityManager.config.propertyTranscodes))
    throw new Error('invalid transcoded property');
}
