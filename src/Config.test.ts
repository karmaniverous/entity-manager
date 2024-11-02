/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type DefaultTranscodeMap,
  defaultTranscodes,
  type Entity,
  type Exactify,
  type PropertiesOfType,
} from '@karmaniverous/entity-tools';

import type { Config, EntityMap, ExclusiveKey } from './Config';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type Json = JsonValue[] | Record<string, JsonValue>;

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

type test = PropertiesOfType<
  User,
  DefaultTranscodeMap[keyof DefaultTranscodeMap]
>;

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

type stringifiableProperties = PropertiesOfType<
  User,
  DefaultTranscodeMap[keyof DefaultTranscodeMap]
>;

type exactifiedUser = Exactify<User>;

const config: Config<MyEntityMap, 'entityPK', 'entitySK'> = {
  entities: {
    user: {
      indexes: {
        created: { hashKey: 'entityPK', rangeKey: 'created' },
        firstName: { hashKey: 'entityPK', rangeKey: 'firstNameRK' },
        lastName: { hashKey: 'entityPK', rangeKey: 'lastNameRK' },
        phone: { hashKey: 'entityPK', rangeKey: 'phone' },
        updated: { hashKey: 'entityPK', rangeKey: 'updated' },
      },
      generated: {
        firstNameRK: {
          elements: ['firstNameCanonical', 'lastNameCanonical'],
        },
        lastNameRK: {
          elements: ['lastNameCanonical', 'firstNameCanonical'],
        },
      },
      elementTranscodes: {
        created: 'timestamp',
        firstNameCanonical: 'string',
        lastNameCanonical: 'string',
        phone: 'string',
        updated: 'timestamp',
        userId: 'string',
      },
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
    email: {
      indexes: {
        userId: { hashKey: 'entityPK', rangeKey: 'userId' },
      },
      elementTranscodes: {
        created: 'timestamp',
        email: 'string',
        userId: 'string',
      },
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
  },
  transcodes: defaultTranscodes,
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
