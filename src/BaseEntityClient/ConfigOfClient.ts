import type { EntityItem, EntityRecord, EntityToken } from '../EntityManager';
import type { BaseEntityClient } from './BaseEntityClient';

/**
 * Extract the captured config map type from a {@link BaseEntityClient | `BaseEntityClient`} instance type.
 *
 * @typeParam EC - A {@link BaseEntityClient | `BaseEntityClient`} instance type.
 *
 * @remarks
 * This is a pure type-level helper used to derive token-aware types from a client
 * instance type without requiring callers to restate the config map type.
 */
export type ConfigOfClient<EC> =
  EC extends BaseEntityClient<infer CC> ? CC : never;

/**
 * Map a client instance type + entity token to the storage-facing record type.
 *
 * @typeParam EC - A {@link BaseEntityClient | `BaseEntityClient`} instance type.
 * @typeParam ET - An {@link EntityToken | `EntityToken`} for that client’s config.
 */
export type EntityClientRecordByToken<
  EC,
  ET extends EntityToken<ConfigOfClient<EC>>,
> = EntityRecord<ConfigOfClient<EC>, ET>;

/**
 * Map a client instance type + entity token to the domain-facing item type.
 *
 * This is the “item-facing” shape (global keys and generated property tokens are
 * not required and are typically stripped via {@link EntityManager.removeKeys | `removeKeys`}).
 *
 * @typeParam EC - A {@link BaseEntityClient | `BaseEntityClient`} instance type.
 * @typeParam ET - An {@link EntityToken | `EntityToken`} for that client’s config.
 */
export type EntityClientItemByToken<
  EC,
  ET extends EntityToken<ConfigOfClient<EC>>,
> = EntityItem<ConfigOfClient<EC>, ET>;
