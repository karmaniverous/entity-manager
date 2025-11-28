import { expectType } from 'tsd';
import { z } from 'zod';

import type { BaseEntityClient } from '../src/BaseEntityClient/BaseEntityClient';
import { createEntityManager, type CapturedConfigMapFrom, type EntitiesFromSchema } from '../src/EntityManager/createEntityManager';

// Values-first config literal capturing 'firstName' | 'lastName' index tokens.
const config = {
  hashKey: 'hashKey2',
  rangeKey: 'rangeKey',
  generatedProperties: {
    sharded: {
      userPK: ['userId'] as const,
    },
    unsharded: {
      firstNameRK: ['firstNameCanonical', 'lastNameCanonical'] as const,
      lastNameRK: ['lastNameCanonical', 'firstNameCanonical'] as const,
    },
  },
  propertyTranscodes: {
    userId: 'string',
    created: 'timestamp',
    firstNameCanonical: 'string',
    lastNameCanonical: 'string',
  },
  indexes: {
    firstName: { hashKey: 'hashKey2', rangeKey: 'firstNameRK' },
    lastName: { hashKey: 'hashKey2', rangeKey: 'lastNameRK' },
  } as const,
  entities: {
    user: {
      uniqueProperty: 'userId',
      timestampProperty: 'created',
    },
  },
  entitiesSchema: {
    user: z.object({
      userId: z.string(),
      created: z.number(),
      firstNameCanonical: z.string(),
      lastNameCanonical: z.string(),
    }),
  },
} as const;

type CC = CapturedConfigMapFrom<typeof config, EntitiesFromSchema<typeof config>>;

// A client typed on CC + CF (values-first config literal).
declare const client: BaseEntityClient<CC, typeof config>;

// Through the client, entityManager.findIndexToken narrows to 'firstName' | 'lastName'.
const it1 = client.entityManager.findIndexToken('hashKey2', 'firstNameRK');
expectType<'firstName' | 'lastName'>(it1);

const it2 = client.entityManager.findIndexToken('hashKey2', 'lastNameRK', true);
expectType<'firstName' | 'lastName' | undefined>(it2);

// Ensure hash/range key inputs are typed (we pass literals from config).
// @ts-expect-error - not a valid hashKey token
client.entityManager.findIndexToken('hashKeyX' as unknown as 'hashKeyX', 'firstNameRK');
// @ts-expect-error - not a valid rangeKey token
client.entityManager.findIndexToken('hashKey2', 'unknownRange' as unknown as 'unknownRange');
