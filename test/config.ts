import {
  defaultTranscodes,
  type Entity,
  type EntityMap,
} from '@karmaniverous/entity-tools';

import type { ConfigMap } from '../src/EntityManager/ConfigMap';
import { EntityManager } from '../src/EntityManager/EntityManager';
import type { StorageItem } from '../src/EntityManager/StorageItem';
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

export type MyConfigMap = ConfigMap<{
  EntityMap: MyEntityMap;
  HashKey: MyHashKey;
  RangeKey: MyRangeKey;
  ShardedKeys: MyShardedKeys;
  UnshardedKeys: MyUnshardedKeys;
  TranscodedProperties: MyTranscodedProperties;
}>;

// Silence verbose debug logging in tests. Keep error logs behind an opt-in
// env var to avoid noisy stderr by default. Set VERBOSE_TEST=1 to re-enable.
export const testLogger: Pick<Console, 'debug' | 'error'> = {
  debug: () => undefined,
  error: (...args: Parameters<Console['error']>) => {
    if (process.env.VERBOSE_TEST) console.error(...args);
  },
};

export const entityManager = new EntityManager<MyConfigMap>(
  {
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
  },
  testLogger,
);

export type Item = StorageItem<MyConfigMap>;
