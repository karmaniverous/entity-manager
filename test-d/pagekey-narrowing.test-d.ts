import type { Entity } from '@karmaniverous/entity-tools';
import { expectType } from 'tsd';

import type {
  ConfigMap,
  PageKeyByIndex,
  ShardQueryFunction,
  ShardQueryMap,
} from '../src/index.ts';

// Minimal entity shapes for testing.
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

// Config map (matches the shape used elsewhere in tests).
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

// Values-first config literal capturing index tokens and their components.
const cf = {
  indexes: {
    firstName: { hashKey: 'hashKey2', rangeKey: 'firstNameRK' },
    lastName: { hashKey: 'hashKey2', rangeKey: 'lastNameRK' },
  },
} as const;
type CF = typeof cf;
// Keep cf “used” to satisfy ESLint in tsd context.
expectType<typeof cf>(cf);

// PageKeyByIndex should narrow to hashKey2 | rangeKey | firstNameRK for 'firstName'.
type PKFirst = PageKeyByIndex<MyConfigMap, 'user', 'firstName', CF>;
declare const pkFirst: PKFirst;
expectType<string | undefined>(pkFirst.hashKey2);
expectType<string | undefined>(pkFirst.rangeKey);
expectType<string | undefined>(pkFirst.firstNameRK);
// Not allowed for 'firstName' index:
// lastNameRK and phoneRK should not be accessible as components of 'firstName'
// @ts-expect-error - not a component of 'firstName' index
pkFirst.lastNameRK;
// @ts-expect-error - not a component of 'firstName' index
pkFirst.phoneRK;

// ShardQueryFunction pageKey param should also be narrowed to the same components.
type SQFFirst = ShardQueryFunction<MyConfigMap, 'user', 'firstName', CF>;
const sqfFirst: SQFFirst = (_hashKey, pageKey) => {
  if (pageKey) {
    expectType<string | undefined>(pageKey.hashKey2);
    expectType<string | undefined>(pageKey.rangeKey);
    expectType<string | undefined>(pageKey.firstNameRK);
    // @ts-expect-error - not a component of 'firstName' index pageKey
    pageKey.lastNameRK;
  }
  return Promise.resolve({ count: 0, items: [], pageKey });
};

// Same check for 'lastName' index — ensure allowed/forbidden keys are consistent.
type PKLast = PageKeyByIndex<MyConfigMap, 'user', 'lastName', CF>;
declare const pkLast: PKLast;
expectType<string | undefined>(pkLast.hashKey2);
expectType<string | undefined>(pkLast.rangeKey);
expectType<string | undefined>(pkLast.lastNameRK);
// @ts-expect-error - not a component of 'lastName' index
pkLast.firstNameRK;

type SQFLast = ShardQueryFunction<MyConfigMap, 'user', 'lastName', CF>;
const sqfLast: SQFLast = (_hashKey, pageKey) => {
  return Promise.resolve({ count: 0, items: [], pageKey });
};

// ShardQueryMap keys should be constrained by CF.indexes when CF is provided.
// Good: key matches CF.indexes ('firstName').
const goodMap: ShardQueryMap<MyConfigMap, 'user', 'firstName', CF> = {
  firstName: sqfFirst,
};

// Bad: 'unknownKey' is not present in CF.indexes; excess property rejected.
// @ts-expect-error - 'unknownKey' is not a valid index token per CF.indexes
const badMap: ShardQueryMap<
  MyConfigMap,
  'user',
  'firstName' | 'unknownKey',
  CF
> = { firstName: sqfFirst, unknownKey: sqfFirst };

