import type { Entity } from '@karmaniverous/entity-tools';
import { expectType } from 'tsd';

import type {
  ConfigMap,
  EntityItem,
  QueryOptions,
  QueryResult,
  ShardQueryFunction,
  ShardQueryMap,
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

// CF (values-first) capturing a single index.
const cf = {
  indexes: {
    firstName: { hashKey: 'hashKey2', rangeKey: 'firstNameRK' },
  },
} as const;
type CF = typeof cf;

// Projection attributes as const tuple — narrows K.
const attrs = ['userId', 'created'] as const;
type K = typeof attrs;

// A typed SQF: pageKey shape narrows via CF; items narrow via K.
const sqf: ShardQueryFunction<MyConfigMap, 'user', 'firstName', CF, K> =
  async (_hashKey, _pageKey, _pageSize) => ({
    count: 0,
    items: [], // never[] is assignable to ProjectedItemByToken<...>[]
    pageKey: _pageKey,
  });

// ShardQueryMap carrying CF and K.
const map: ShardQueryMap<MyConfigMap, 'user', 'firstName', CF, K> = {
  firstName: sqf,
};
expectType<ShardQueryMap<MyConfigMap, 'user', 'firstName', CF, K>>(map);

// Options carrying CF and K — no runtime change; type-only projection channel.
const options: QueryOptions<MyConfigMap, 'user', 'firstName', CF, K> = {
  entityToken: 'user',
  item: {},
  shardQueryMap: map,
};
expectType<QueryOptions<MyConfigMap, 'user', 'firstName', CF, K>>(options);

// Result items narrow to the projected keys union: 'userId' | 'created'.
type QR = QueryResult<MyConfigMap, 'user', 'firstName', K>;
declare const qr: QR;
expectType<
  Pick<EntityItem<MyConfigMap, 'user'>, 'userId' | 'created'>[]
>(qr.items);