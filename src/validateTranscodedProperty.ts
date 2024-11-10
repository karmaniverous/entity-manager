import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';

/**
 * Validate that a property is defined as an {@link EntityManager | `EntityManager`} {@link Config.propertyTranscodes | transcoded property}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param property - {@link Config.propertyTranscodes | Transcoded property} key.
 *
 * @throws `Error` if `property` is not a {@link Config.propertyTranscodes | transcoded property}.
 */
export function validateTranscodedProperty<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  property: C['TranscodedProperties'],
): void {
  if (!(property in entityManager.config.propertyTranscodes))
    throw new Error('invalid transcoded property');
}
