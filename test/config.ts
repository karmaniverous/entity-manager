import type { Entity } from '@karmaniverous/entity-tools';

import type { Config, EntityMap, ItemMap } from '../src/Config';
import { EntityManager } from '../src/EntityManager';
import type { User } from './users';

export const now = Date.now();
export const day = 24 * 60 * 60 * 1000;

export interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
  userPK?: never;
}

export interface MyEntityMap extends EntityMap {
  user: User;
  email: Email;
}

export const config: Config<MyEntityMap, 'hashKey2'> = {
  entities: {
    email: {
      elementTranscodes: {
        created: 'int',
        email: 'string',
        userId: 'string',
      },
      indexes: {
        created: { hashKey: 'hashKey2', rangeKey: 'created' },
        userCreated: { hashKey: 'userPK', rangeKey: 'created' },
      },
      generated: {
        userPK: { atomic: true, elements: ['userId'], sharded: true },
      },
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
    user: {
      indexes: {
        created: { hashKey: 'hashKey2', rangeKey: 'created' },
        firstName: { hashKey: 'hashKey2', rangeKey: 'firstNameRK' },
        lastName: { hashKey: 'hashKey2', rangeKey: 'lastNameRK' },
        phone: { hashKey: 'hashKey2', rangeKey: 'phone' },
        updated: { hashKey: 'hashKey2', rangeKey: 'updated' },
        userCreated: { hashKey: 'userPK', rangeKey: 'created' },
      },
      generated: {
        firstNameRK: {
          elements: ['firstNameCanonical', 'lastNameCanonical'],
        },
        lastNameRK: {
          elements: ['lastNameCanonical', 'firstNameCanonical'],
        },
        phoneRK: {
          atomic: true,
          elements: ['phone', 'created'],
        },
        userPK: { atomic: true, elements: ['userId'], sharded: true },
      },
      elementTranscodes: {
        created: 'int',
        firstNameCanonical: 'string',
        lastNameCanonical: 'string',
        phone: 'string',
        updated: 'int',
        userId: 'string',
      },
      shardBumps: [
        { timestamp: now + day, charBits: 2, chars: 1 },
        { timestamp: now + day * 2, charBits: 2, chars: 2 },
      ],
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
  },
  hashKey: 'hashKey2',
  rangeKey: 'rangeKey',
};

export type UserItem = ItemMap<MyEntityMap, 'hashKey2'>['user'];

export const entityManager = new EntityManager(config);
