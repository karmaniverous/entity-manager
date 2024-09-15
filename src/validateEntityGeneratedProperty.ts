import type { TypeMap } from '@karmaniverous/entity-tools';

import type { EntityMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Validate that an entity generated property is defined in EntityManager
 * config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param property - {@link ConfigEntityGenerated | `this.config.entities.<entityToken>.generated`} key.
 * @param sharded - Whether the generated property is sharded. `undefined` indicates no constraint.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `property` is invalid.
 * @throws `Error` if `sharded` is specified & does not match `this.config.entities.<entityToken>.generated.<property>.sharded`.
 */
export function validateEntityGeneratedProperty<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  entityToken: string,
  property: string,
  sharded?: boolean,
): void {
  validateEntityToken(entityManager, entityToken);

  const generated =
    entityManager.config.entities[entityToken].generated[property];

  if (!generated && property !== entityManager.config.hashKey)
    throw new Error('invalid entity generated property');

  if (
    sharded !== undefined &&
    ((generated && sharded !== generated.sharded) ||
      (!sharded && property === entityManager.config.hashKey))
  )
    throw new Error(
      `entity generated property ${sharded ? 'not ' : ''}sharded`,
    );
}
