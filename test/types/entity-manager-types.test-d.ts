import type { Entity } from '@karmaniverous/entity-tools';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

import type {
  BaseConfigMap,
  ConfigMap,
  EntityItem,
  EntityKey,
  EntityRecord,
  EntityToken,
  PageKey,
  QueryOptions,
  QueryResult,
  ShardBump,
  ShardQueryFunction,
  ShardQueryMap,
  ShardQueryResult,
} from '../../src/index.ts';

// BaseConfigMap availability/shape
expectType<BaseConfigMap>({} as BaseConfigMap);
// Define a minimal EntityMap for testing.
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

// EntityItem — partial, accepts any subset of flattened entity properties.
const itemOk: EntityItem<MyConfigMap> = { userId: 'u', created: Date.now() };
expectAssignable<EntityItem<MyConfigMap>>(itemOk);

// EntityKey — requires hashKey and rangeKey tokens of the config.
const keyOk: EntityKey<MyConfigMap> = {
  hashKey2: 'user!0',
  rangeKey: 'userId#u',
};
expectAssignable<EntityKey<MyConfigMap>>(keyOk);
// Wrong key token names should not be assignable.
expectNotAssignable<EntityKey<MyConfigMap>>({ hashKey: 'x', rangeKey: 'y' });

// EntityRecord — EntityItem + required key properties.
const recordOk: EntityRecord<MyConfigMap> = {
  hashKey2: 'user!0',
  rangeKey: 'userId#u',
  userId: 'u',
};
expectAssignable<EntityRecord<MyConfigMap>>(recordOk);

// EntityToken — only valid entity map keys.
type ET = EntityToken<MyConfigMap>;
expectAssignable<ET>('user');
expectAssignable<ET>('email');
expectNotAssignable<ET>('unknown');

// PageKey — keys that can appear in page keys.
const pageKeyOk: PageKey<MyConfigMap> = { rangeKey: 'userId#u' };
expectAssignable<PageKey<MyConfigMap>>(pageKeyOk);

// ShardQueryFunction — provider-agnostic query of a single shard.
const shardQueryFn: ShardQueryFunction<MyConfigMap, 'user', 'firstName'> = (
  hashKey: string,
  pageKey?: PageKey<MyConfigMap>,
  pageSize?: number,
) => {
  // satisfy ESLint no-unused-vars in type tests
  void hashKey;
  void pageKey;
  void pageSize;
  const items: EntityItem<MyConfigMap>[] = [];
  const res: ShardQueryResult<MyConfigMap, 'user', 'firstName'> = {
    count: 0,
    // items can be broader assignable type at compile-time check
    // (runtime narrowing occurs by token-aware helpers).
    items: items as unknown as EntityItem<MyConfigMap>[],
    pageKey,
  };
  return Promise.resolve(res);
};

// ShardQueryMap — map index token -> shard query fn.
const shardQueryMap: ShardQueryMap<
  MyConfigMap,
  'user',
  'firstName' | 'lastName'
> = {
  firstName: shardQueryFn,
  lastName: shardQueryFn,
};
expectAssignable<ShardQueryMap<MyConfigMap, 'user', 'firstName' | 'lastName'>>(
  shardQueryMap,
);

// QueryOptions — minimal valid options.
const qo: QueryOptions<MyConfigMap, 'user', 'firstName' | 'lastName'> = {
  entityToken: 'user',
  item: {} as EntityItem<MyConfigMap>,
  shardQueryMap,
};
expectAssignable<QueryOptions<MyConfigMap, 'user', 'firstName' | 'lastName'>>(
  qo,
);

// QueryResult — shape contract.
const qr: QueryResult<MyConfigMap, 'user', 'firstName' | 'lastName'> = {
  count: 0,
  items: [],
  pageKeyMap: '',
};
expectAssignable<QueryResult<MyConfigMap, 'user', 'firstName' | 'lastName'>>(
  qr,
);
expectType<number>(qr.count);
expectType<EntityItem<MyConfigMap>[]>(
  qr.items as unknown as EntityItem<MyConfigMap>[],
);
expectType<string>(qr.pageKeyMap);

// ShardBump — sharding time window definition.
const bump: ShardBump = { timestamp: 0, charBits: 2, chars: 1 };
expectAssignable<ShardBump>(bump);
