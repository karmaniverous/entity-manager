import type { Entity } from '@karmaniverous/entity-tools';
import { expectType } from 'tsd';

import type {
  ConfigMap,
  QueryOptionsByCF,
  QueryOptionsByCC,
  ShardQueryFunction,
  ShardQueryMapByCF,
  ShardQueryMapByCC,
} from '../src/index.ts';

// Minimal entities for testing.
interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}

interface User extends Entity {
  beneficiaryId: string;
  created: number;
  firstNameCanonical: string;
  lastNameCanonical: string;
  phone?: string;
  updated: number;
  userId: string;
}

// Config map (aligns with other tests).
type MyConfigMap = ConfigMap<{
  EntityMap: {
    email: Email;
    user: User;
  };
  HashKey: 'hashKey2';
  RangeKey: 'rangeKey';
  ShardedKeys: 'beneficiaryPK' | 'userPK';
  UnshardedKeys: 'firstNameRK' | 'lastNameRK' | 'phoneRK';
  TranscodedProperties:
    | 'beneficiaryId'
    | 'created'
    | 'email'
    | 'firstNameCanonical'
    | 'lastNameCanonical'
    | 'phone'
    | 'updated'
    | 'userId';
}>;

// Values-first config literal capturing index tokens.
const cf = {
  indexes: {
    firstName: { hashKey: 'hashKey2', rangeKey: 'firstNameRK' },
    lastName: { hashKey: 'hashKey2', rangeKey: 'lastNameRK' },
  },
} as const;
type CF = typeof cf;
const cc = cf;
type CC = typeof cc;

// PageKey narrowing demonstrated via SQFs (compile-only test).
const firstNameSQF: ShardQueryFunction<MyConfigMap, 'user', 'firstName', CF> =
  async (hashKey, pageKey, pageSize) => ({ count: 0, items: [], pageKey });
const lastNameSQF: ShardQueryFunction<MyConfigMap, 'user', 'lastName', CF> =
  async (hashKey, pageKey, pageSize) => ({ count: 0, items: [], pageKey });

// CF-aware ShardQueryMapByCF — only 'firstName' | 'lastName' allowed.
const mapCF: ShardQueryMapByCF<MyConfigMap, 'user', CF> = {
  firstName: firstNameSQF,
  lastName: lastNameSQF,
};
expectType<ShardQueryMapByCF<MyConfigMap, 'user', CF>>(mapCF);

// Negative: extra keys not in CF.indexes are rejected.
declare function acceptMapCF(
  m: ShardQueryMapByCF<MyConfigMap, 'user', CF>,
): void;
acceptMapCF({
  firstName: firstNameSQF,
  // @ts-expect-error - 'unknownKey' not present in CF.indexes
  unknownKey: firstNameSQF,
});

// CC-aware ShardQueryMapByCC — mirrored behavior; derive ITS from CC.
const mapCC: ShardQueryMapByCC<MyConfigMap, 'user', CC> = {
  firstName: firstNameSQF,
  lastName: lastNameSQF,
};
expectType<ShardQueryMapByCC<MyConfigMap, 'user', CC>>(mapCC);

// Negative: extra keys not in CC.indexes are rejected.
declare function acceptMapCC(
  m: ShardQueryMapByCC<MyConfigMap, 'user', CC>,
): void;
acceptMapCC({
  firstName: firstNameSQF,
  // @ts-expect-error - 'unknownKey' not present in CC.indexes
  unknownKey: firstNameSQF,
});

// Options aliases — CF-driven ITS derivation + CF channel for narrowing.
const optionsCF: QueryOptionsByCF<MyConfigMap, 'user', CF> = {
  entityToken: 'user',
  item: {},
  shardQueryMap: mapCF,
  limit: 25,
  pageSize: 10,
};
expectType<QueryOptionsByCF<MyConfigMap, 'user', CF>>(optionsCF);

// Options aliases — CC-driven ITS derivation + CC as CF channel.
const optionsCC: QueryOptionsByCC<MyConfigMap, 'user', CC> = {
  entityToken: 'user',
  item: {},
  shardQueryMap: mapCC,
  limit: 25,
  pageSize: 10,
};
expectType<QueryOptionsByCC<MyConfigMap, 'user', CC>>(optionsCC);
