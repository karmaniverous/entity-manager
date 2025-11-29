import type { Entity } from '@karmaniverous/entity-tools';
import { expectType } from 'tsd';

import type {
  ConfigMap,
  EntityItemPartial,
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
expectType<EntityItemPartial<MyConfigMap, 'user'>>(optUser.item);

// ET='email' — options.item narrows to EntityItemByToken<..., 'email'>.
type OptEmail = QueryBuilderQueryOptions<MyConfigMap, 'email'>;
declare const optEmail: OptEmail;
expectType<EntityItemPartial<MyConfigMap, 'email'>>(optEmail.item);