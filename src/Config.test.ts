/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Config,
  Entity,
  EntityMap,
  Exactify,
  ExclusiveKey,
  PropertiesOfType,
  Stringifiable,
} from './Config';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

interface User extends Entity {
  created: number;
  firstNameCanonical: string;
  firstNameRK: never;
  json: Json;
  lastNameCanonical: string;
  lastNameRK: never;
  phone: string;
  updated: number;
  userId: string;
}

interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}

interface MyEntityMap extends EntityMap {
  user: User;
  email: Email;
}

// ExclusiveKey correctly types an unused key.
let unusedKey: ExclusiveKey<'foo', MyEntityMap> = 'foo';

// @ts-expect-error Unused key can't be reassigned.
unusedKey = 'bar';

// @ts-expect-error ExclusiveKey correctly rejects a used key.
const usedKey: ExclusiveKey<'optional', MyEntityMap> = 'created';

// PropertiesOfType correctly extracts properties of a given type.
type testStringProperties = PropertiesOfType<User, string>;

// PropertiesOfType correctly extracts properties of a given type.
type testNumberProperties = PropertiesOfType<User, number>;

type noGeneratedProperties = PropertiesOfType<Email, never>;

type neverProperties = PropertiesOfType<MyEntityMap['user'], never>;

type stringifiableProperties = PropertiesOfType<User, Stringifiable>;

type exactifiedUser = Exactify<User>;

const config: Config<MyEntityMap, 'entityPK', 'entitySK'> = {
  entities: {
    user: {
      indexes: {
        created: ['entityPK', 'entitySK', 'created'],
        firstName: ['entityPK', 'entitySK', 'firstNameRK'],
        lastName: ['entityPK', 'entitySK', 'lastNameRK'],
        phone: ['entityPK', 'entitySK', 'phone'],
        updated: ['entityPK', 'entitySK', 'updated'],
      },
      generated: {
        firstNameRK: {
          elements: ['firstNameCanonical', 'lastNameCanonical'],
        },
        lastNameRK: {
          elements: ['lastNameCanonical', 'firstNameCanonical'],
        },
      },
      types: {
        created: 'number',
        firstNameCanonical: 'string',
        lastNameCanonical: 'string',
        phone: 'string',
        updated: 'number',
        userId: 'string',
      },
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
    email: {
      indexes: {
        userId: ['entityPK', 'entitySK', 'userId'],
      },
      types: { created: 'number', email: 'string', userId: 'string' },
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
  },
  hashKey: 'entityPK',
  rangeKey: 'entitySK',
};

const configMissingGeneratedProperties: Config<
  Pick<MyEntityMap, 'user'>,
  'entityPK',
  'entitySK'
> = {
  entities: {
    user: {
      // @ts-expect-error missing generated properties.
      generated: {},
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
  },
  hashKey: 'entityPK',
  rangeKey: 'entitySK',
};

// Default configuration retuens no errors.
const degenerateConfig: Config = {};
