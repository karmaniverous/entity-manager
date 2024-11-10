import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import { EntityManager } from './EntityManager';

/**
 * Validate that a property is defined as an {@link EntityManager | `EntityManager`} {@link Config.generatedProperties | generated property}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param property - {@link Config.generatedProperties | Generated property} key.
 * @param isSharded - Whether the generated property is sharded. `undefined` indicates no constraint.
 *
 * @throws `Error` if `property` is not a {@link Config.generatedProperties | generated property}.
 * @throws `Error` if `sharded` is specified & does not match {@link Config.generatedProperties | generated property} type.
 */
export function validateGeneratedProperty<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
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
  property: ShardedKeys | UnshardedKeys,
  isSharded?: boolean,
): void {
  const { sharded, unsharded } = entityManager.config.generatedProperties;

  if (!(property in sharded) && !(property in unsharded))
    throw new Error('invalid generated property');

  if (
    isSharded !== undefined &&
    ((isSharded && !(property in sharded)) ||
      (!isSharded && !(property in unsharded)))
  )
    throw new Error(`generated property ${isSharded ? 'not ' : ''}sharded`);
}
