import type {
  EntityItemByToken,
  EntityRecordByToken,
  EntityToken,
} from '../EntityManager';
import type { BaseEntityClient } from './BaseEntityClient';

// Extract the captured ConfigMap from a BaseEntityClient instance type.
export type ConfigOfClient<EC> =
  EC extends BaseEntityClient<infer CC, any> ? CC : never;

// Map a client instance type + entity token to the storage-record type.
export type EntityClientRecordByToken<
  EC,
  ET extends EntityToken<ConfigOfClient<EC>>,
> = EntityRecordByToken<ConfigOfClient<EC>, ET>;

// Map a client instance type + entity token to the domain-facing item type (keys stripped).
export type EntityClientItemByToken<
  EC,
  ET extends EntityToken<ConfigOfClient<EC>>,
> = EntityItemByToken<ConfigOfClient<EC>, ET>;
