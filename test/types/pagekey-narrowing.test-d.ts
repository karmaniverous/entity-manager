import { expectError, expectType } from 'tsd';

import type {
  ConfigMap,
  PageKeyByIndex,
  ShardQueryFunction,
} from '../../src/index.ts';

// Minimal entity shapes for testing.
interface Email {
  created: number;
  email: string;
  userId: string;
}

interface User {
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

// PageKeyByIndex should narrow to hashKey2 | rangeKey | firstNameRK for 'firstName'.
type PKFirst = PageKeyByIndex<MyConfigMap, 'user', 'firstName', CF>;
declare const pkFirst: PKFirst;
expectType<string | undefined>(pkFirst.hashKey2);
expectType<string | undefined>(pkFirst.rangeKey);
expectType<string | undefined>(pkFirst.firstNameRK);
// Not allowed for 'firstName' index:
// @ts-expect-error — lastNameRK is not part of the 'firstName' index components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _bad1 = pkFirst.lastNameRK;
// @ts-expect-error — phoneRK is not part of the 'firstName' index components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _bad2 = pkFirst.phoneRK;

// ShardQueryFunction pageKey param should also be narrowed to the same components.
type SQFFirst = ShardQueryFunction<MyConfigMap, 'user', 'firstName', CF>;
const sqfFirst: SQFFirst = async (_hashKey, pageKey, _pageSize) => {
  if (pageKey) {
    expectType<string | undefined>(pageKey.hashKey2);
    expectType<string | undefined>(pageKey.rangeKey);
    expectType<string | undefined>(pageKey.firstNameRK);
    // @ts-expect-error — lastNameRK is not part of the 'firstName' index components
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _bad3 = pageKey.lastNameRK;
  }
  return { count: 0, items: [], pageKey };
};

// Same check for 'lastName' index — ensure allowed/forbidden keys are consistent.
type PKLast = PageKeyByIndex<MyConfigMap, 'user', 'lastName', CF>;
declare const pkLast: PKLast;
expectType<string | undefined>(pkLast.hashKey2);
expectType<string | undefined>(pkLast.rangeKey);
expectType<string | undefined>(pkLast.lastNameRK);
// @ts-expect-error — firstNameRK is not part of the 'lastName' index components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _bad4 = pkLast.firstNameRK;

type SQFLast = ShardQueryFunction<MyConfigMap, 'user', 'lastName', CF>;
const sqfLast: SQFLast = async (_hashKey, pageKey, _pageSize) => {
  return { count: 0, items: [], pageKey };
};
