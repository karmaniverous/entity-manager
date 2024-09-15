import type { Entity } from '@karmaniverous/entity-tools';

import type { Config, EntityItem, EntityMap } from '../src/Config';
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

export const config: Config<MyEntityMap, 'hashKey2'> = {
  entities: {
    email: {
      indexes: {
        userId: ['hashKey2', 'rangeKey', 'userId'],
      },
      timestampProperty: 'created',
      types: { created: 'number', email: 'string', userId: 'string' },
      uniqueProperty: 'email',
    },
    user: {
      indexes: {
        created: ['hashKey2', 'rangeKey', 'created'],
        firstName: ['hashKey2', 'rangeKey', 'firstNameRK'],
        lastName: ['hashKey2', 'rangeKey', 'lastNameRK'],
        phone: ['hashKey2', 'rangeKey', 'phone'],
        updated: ['hashKey2', 'rangeKey', 'updated'],
      },
      generated: {
        firstNameRK: {
          elements: ['firstNameCanonical', 'lastNameCanonical'],
        },
        lastNameRK: {
          elements: ['lastNameCanonical', 'firstNameCanonical'],
          sharded: true,
        },
        phoneRK: {
          atomic: true,
          elements: ['phone', 'created'],
        },
      },
      shardBumps: [
        { timestamp: now + day, charBits: 2, chars: 1 },
        { timestamp: now + day * 2, charBits: 2, chars: 2 },
      ],
      timestampProperty: 'created',
      types: {
        created: 'number',
        firstNameCanonical: 'string',
        lastNameCanonical: 'string',
        phone: 'string',
        updated: 'number',
        userId: 'string',
      },
      uniqueProperty: 'userId',
    },
  },
  hashKey: 'hashKey2',
  rangeKey: 'rangeKey',
};

export type UserItem = EntityItem<'user', MyEntityMap, 'hashKey2'>;

export const entityManager = new EntityManager(config);
