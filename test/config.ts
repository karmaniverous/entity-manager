import type { Entity } from '@karmaniverous/entity-tools';

import type { Config, EntityItem, EntityMap } from '../src/Config';
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

export const config: Config<MyEntityMap> = {
  entities: {
    email: {
      indexes: {
        userId: ['hashKey', 'rangeKey', 'userId'],
      },
      timestampProperty: 'created',
      types: { created: 'number', email: 'string', userId: 'string' },
      uniqueProperty: 'email',
    },
    user: {
      indexes: {
        created: ['hashKey', 'rangeKey', 'created'],
        firstName: ['hashKey', 'rangeKey', 'firstNameRK'],
        lastName: ['hashKey', 'rangeKey', 'lastNameRK'],
        phone: ['hashKey', 'rangeKey', 'phone'],
        updated: ['hashKey', 'rangeKey', 'updated'],
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
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',
};

export type UserItem = EntityItem<'user', MyEntityMap>;
