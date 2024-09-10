/* eslint-disable @typescript-eslint/no-unused-vars */
import { Config, ExclusiveKey, PropertiesOfType } from './types';

interface User {
  created: number;
  firstNameCanonical: string;
  firstNameRK: never;
  lastNameCanonical: string;
  lastNameRK: never;
  phone: string;
  updated: number;
  userId: string;
}

interface Email {
  created: number;
  email: string;
  userId: string;
}

interface MyEntityMap {
  user: User;
  email: Email;
}

// ExclusiveKey correctly types an unused key.
let unusedKey: ExclusiveKey<'foo', MyEntityMap> = 'foo';

// @ts-expect-error Unused key can't be reassigned.
unusedKey = 'bar';

// @ts-expect-error ExclusiveKey correctly rejects a used key.
const usedKey: ExclusiveKey<'optional', MyEntityMap>;

// PropertiesOfType correctly extracts properties of a given type.
type testStringProperties = PropertiesOfType<User, string>;

// PropertiesOfType correctly extracts properties of a given type.
type testNumberProperties = PropertiesOfType<User, number>;

type noGeneratedProperties = PropertiesOfType<Email, never>;

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
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
    email: {
      indexes: {
        userId: ['entityPK', 'entitySK', 'userId'],
      },
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
  },
  hashKey: 'entityPK',
  uniqueKey: 'entitySK',
};

// Default configuration retuens no errors.
const degenerateConfig: Config = {
  hashKey: 'hashKey',
  uniqueKey: 'uniqueKey',
};
