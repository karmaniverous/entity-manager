import { expectType } from 'tsd';
import { z } from 'zod';

import { createEntityManager } from '../src/EntityManager/createEntityManager';

// Values-first config literal (as const) capturing index tokens 'firstName' | 'lastName'.
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
  // Minimal schema to demonstrate values+schema capture; only domain (non-generated) fields.
  entitiesSchema: {
    user: z.object({
      userId: z.string(),
      created: z.number(),
      firstNameCanonical: z.string(),
      lastNameCanonical: z.string(),
    }),
  },
} as const;

// CF is captured from the single literal; EntityManager<..., CF>.
const em = createEntityManager(config);

// findIndexToken narrows result type to the configured index union ('firstName' | 'lastName').
const it1 = em.findIndexToken('hashKey2', 'firstNameRK');
expectType<'firstName' | 'lastName'>(it1);

// Overload with suppressError: true — union | undefined.
const it2 = em.findIndexToken('hashKey2', 'lastNameRK', true);
expectType<'firstName' | 'lastName' | undefined>(it2);

// Note: Runtime resolution is covered by existing tests;
// this file validates type-level narrowing only.
