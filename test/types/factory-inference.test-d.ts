import { expectType } from 'tsd';
import { z } from 'zod';

import { createEntityManager } from '../../src/EntityManager/createEntityManager';

// Config with entitiesSchema (schemas define base fields only; no generated keys/tokens)
const config = {
  hashKey: 'hashKey2',
  rangeKey: 'rangeKey',
  generatedProperties: {
    sharded: {
      userPK: ['userId'] as const,
    },
    unsharded: {
      firstNameRK: ['firstNameCanonical', 'lastNameCanonical'] as const,
    },
  },
  propertyTranscodes: {
    userId: 'string',
    created: 'timestamp',
    firstNameCanonical: 'string',
    lastNameCanonical: 'string',
  },
  indexes: {
    created: { hashKey: 'hashKey2', rangeKey: 'created' },
    userCreated: { hashKey: 'userPK', rangeKey: 'created' },
  } as const,
  entities: {
    user: {
      uniqueProperty: 'userId',
      timestampProperty: 'created',
      shardBumps: [{ timestamp: Date.now(), charBits: 2, chars: 1 }],
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

const manager = createEntityManager(config);
// addKeys returns a record (keys required) consistent with schema + generated keys
const rec = manager.addKeys('user', {
  userId: 'u1',
  created: Date.now(),
  firstNameCanonical: 'a',
  lastNameCanonical: 'b',
});
// record-facing keys exist and are strings
expectType<string>(rec.hashKey2);
expectType<string>(rec.rangeKey);
// getPrimaryKey returns keys
const keys = manager.getPrimaryKey('user', {
  userId: 'u1',
});
expectType<Record<'hashKey2' | 'rangeKey', string>[]>(keys);
// removeKeys returns item-facing
const item = manager.removeKeys('user', rec);
// item-facing: entity fields preserved
expectType<string>(item.userId!);
// keys are optional/absent at runtime; type remains compatible with optional keys
// (allowing both undefined and string in the type-level view)

item.hashKey2;
