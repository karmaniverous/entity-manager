import {
  defaultTranscodes,
  type Entity,
  type EntityMap,
} from '@karmaniverous/entity-tools';

import { type Config } from './Config';

export interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}

export interface User extends Entity {
  beneficiaryId: string;
  created: number;
  data: Record<string, unknown>;
  firstName: string;
  firstNameCanonical: string;
  lastName: string;
  lastNameCanonical: string;
  phone?: string;
  updated: number;
  userId: string;
}

export interface MyEntityMap extends EntityMap {
  email: Email;
  user: User;
}

export type MyHashKey = 'hashKey';
export type MyRangeKey = 'rangeKey';
export type MyShardedKeys = 'beneficiaryHashKey' | 'userHashKey';
export type MyUnshardedKeys = 'firstNameRangeKey' | 'lastNameRangeKey';
export type MyTranscodedProperties =
  | 'beneficiaryId'
  | 'created'
  | 'email'
  | 'firstNameCanonical'
  | 'lastNameCanonical'
  | 'phone'
  | 'updated'
  | 'userId';

// Create config directly.
export const myConfig: Config<
  MyEntityMap,
  MyHashKey,
  MyRangeKey,
  MyShardedKeys,
  MyUnshardedKeys,
  MyTranscodedProperties
> = {
  entities: {
    email: {
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
    user: {
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
  },
  generatedProperties: {
    sharded: {
      beneficiaryHashKey: ['beneficiaryId'],
      userHashKey: ['userId'],
    },
    unsharded: {
      firstNameRangeKey: ['firstNameCanonical', 'lastNameCanonical', 'created'],
      lastNameRangeKey: ['lastNameCanonical', 'firstNameCanonical', 'created'],
    },
  },
  hashKey: 'hashKey',
  indexes: {
    beneficiaryCreated: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'created',
    },
    beneficiaryFirstName: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'firstNameRangeKey',
    },
    beneficiaryLastName: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'lastNameRangeKey',
    },
    beneficiaryPhone: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'phone',
    },
    beneficiaryUpdated: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'updated',
    },
    created: {
      hashKey: 'hashKey',
      rangeKey: 'created',
    },
    firstName: {
      hashKey: 'hashKey',
      rangeKey: 'firstNameRangeKey',
    },
    lastName: {
      hashKey: 'hashKey',
      rangeKey: 'lastNameRangeKey',
    },
    phone: {
      hashKey: 'hashKey',
      rangeKey: 'phone',
    },
    updated: {
      hashKey: 'hashKey',
      rangeKey: 'updated',
    },
    userCreated: {
      hashKey: 'userHashKey',
      rangeKey: 'created',
    },
    userUpdated: {
      hashKey: 'userHashKey',
      rangeKey: 'updated',
    },
  },
  propertyTranscodes: {
    beneficiaryId: 'string',
    created: 'timestamp',
    email: 'string',
    firstNameCanonical: 'string',
    lastNameCanonical: 'string',
    phone: 'string',
    updated: 'timestamp',
    userId: 'string',
  },
  rangeKey: 'rangeKey',
  transcodes: defaultTranscodes,
};
