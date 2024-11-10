import { defaultTranscodes, type Entity } from '@karmaniverous/entity-tools';

import { type Config } from './Config';
import type { ConfigMap } from './ConfigMap';

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

export type MyConfigMap = ConfigMap<{
  EntityMap: {
    email: Email;
    user: User;
  };
  HashKey: 'hashKey';
  RangeKey: 'rangeKey';
  ShardedKeys: 'beneficiaryHashKey' | 'userHashKey';
  UnshardedKeys: 'firstNameRangeKey' | 'lastNameRangeKey';
  TranscodedProperties:
    | 'beneficiaryId'
    | 'created'
    | 'email'
    | 'firstNameCanonical'
    | 'lastNameCanonical'
    | 'phone'
    | 'updated'
    | 'userId';
}>;

// Create config directly.
export const myConfig: Config<MyConfigMap> = {
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
