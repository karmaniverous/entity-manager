import type { Entity } from '@karmaniverous/entity-tools';
import { expectNotAssignable, expectType } from 'tsd';

import type {
  ConfigMap,
  EntityItemByToken,
  QueryBuilderQueryOptions,
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

// ET='user' — options.item narrows to EntityItemByToken<..., 'user'>.
type OptUser = QueryBuilderQueryOptions<MyConfigMap, 'user'>;
declare const optUser: OptUser;
expectType<EntityItemByToken<MyConfigMap, 'user'>>(optUser.item);
// And is not assignable to EntityItemByToken<..., 'email'>.
expectNotAssignable<EntityItemByToken<MyConfigMap, 'email'>>(optUser.item);

// ET='email' — options.item narrows to EntityItemByToken<..., 'email'>.
type OptEmail = QueryBuilderQueryOptions<MyConfigMap, 'email'>;
declare const optEmail: OptEmail;
expectType<EntityItemByToken<MyConfigMap, 'email'>>(optEmail.item);
// And is not assignable to EntityItemByToken<..., 'user'>.
expectNotAssignable<EntityItemByToken<MyConfigMap, 'user'>>(optEmail.item);
