import {
  defaultTranscodes,
  type Entity,
  type EntityMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem } from '../src/EntityItem';
import { EntityManager } from '../src/EntityManager';
import type { User } from './users';

export const now = Date.now();
export const day = 24 * 60 * 60 * 1000;

export interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}

export interface MyEntityMap extends EntityMap {
  user: User;
  email: Email;
}

type MyHashKey = 'hashKey2';
type MyRangeKey = 'rangeKey';
type MyShardedKeys = 'beneficiaryPK' | 'userPK';
type MyUnshardedKeys = 'firstNameRK' | 'lastNameRK' | 'phoneRK';
type MyTranscodedProperties =
  | 'beneficiaryId'
  | 'created'
  | 'email'
  | 'firstNameCanonical'
  | 'lastNameCanonical'
  | 'phone'
  | 'updated'
  | 'userId';

export const entityManager = new EntityManager<
  MyEntityMap,
  MyHashKey,
  MyRangeKey,
  MyShardedKeys,
  MyUnshardedKeys,
  MyTranscodedProperties
>({
  entities: {
    email: {
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
    user: {
      shardBumps: [
        { timestamp: now + day, charBits: 2, chars: 1 },
        { timestamp: now + day * 2, charBits: 2, chars: 2 },
      ],
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
  },
  generatedProperties: {
    sharded: {
      beneficiaryPK: ['beneficiaryId'],
      userPK: ['userId'],
    },
    unsharded: {
      firstNameRK: ['firstNameCanonical', 'lastNameCanonical'],
      lastNameRK: ['lastNameCanonical', 'firstNameCanonical'],
      phoneRK: ['phone', 'created'],
    },
  },
  hashKey: 'hashKey2',
  indexes: {
    beneficiaryCreated: { hashKey: 'beneficiaryPK', rangeKey: 'created' },
    created: { hashKey: 'hashKey2', rangeKey: 'created' },
    firstName: { hashKey: 'hashKey2', rangeKey: 'firstNameRK' },
    lastName: { hashKey: 'hashKey2', rangeKey: 'lastNameRK' },
    phone: { hashKey: 'hashKey2', rangeKey: 'phone' },
    updated: { hashKey: 'hashKey2', rangeKey: 'updated' },
    userCreated: { hashKey: 'userPK', rangeKey: 'created' },
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
});

export type Item = EntityItem<
  MyEntityMap,
  MyHashKey,
  MyRangeKey,
  MyShardedKeys,
  MyUnshardedKeys
>;
