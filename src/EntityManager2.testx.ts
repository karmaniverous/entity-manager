/* eslint-env mocha */

import { MockDb } from '@karmaniverous/mock-db';
import { expect } from 'chai';
import { inspect } from 'util';

import { config } from '../test/config';
import { getUsers, User } from '../test/users';
import { Config } from './Config';
import { EntityManager } from './EntityManager2';

interface User extends Entity {
  created: number;
  firstNameCanonical: string;
  firstNameRK: never;
  json: Json;
  lastNameCanonical: string;
  lastNameRK: never;
  phone: string;
  updated: number;
  userId: string;
}

interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}

interface MyEntityMap extends EntityMap {
  user: User;
  email: Email;
}

let entityManager: EntityManager<Config>;
let users: User[];
let mockDb: MockDb<User>;

describe('EntityManager', function () {
  beforeEach(function () {
    entityManager = new EntityManager({
      config,
      logger: {
        ...console,
        debug: (...args: unknown[]) => {
          console.debug(...args.map((arg) => inspect(arg, false, null)));
        },
      },
    });

    users = getUsers(100, 0, 2).map((user) =>
      entityManager.addKeys(entity, user),
    );

    mockDb = new MockDb(users);
  });

  describe('addKeys', function () {
    it('should add unsharded keys to item', function () {
      const item = getUsers()[0];

      const result = entityManager.addKeys(entity, item);

      const extendedItem = { ...item, entity };

      expect(result).to.deep.include({
        entityPK:
          entityManager.config.entities.user.keys.entityPK.encode(extendedItem),
        entitySK:
          entityManager.config.entities.user.keys.entitySK.encode(extendedItem),
        firstNameSK:
          entityManager.config.entities.user.keys.firstNameSK.encode(
            extendedItem,
          ),
        lastNameSK:
          entityManager.config.entities.user.keys.lastNameSK.encode(
            extendedItem,
          ),
      });
    });

    it('should add sharded keys to item', function () {
      const item = getUsers(1, 1)[0];

      const result = entityManager.addKeys(entity, item);

      expect(result).to.have.property('shardKey').with.length(1);
      expect(result.entityPK).to.match(/user![0-3]/);
    });

    it('should re-use existing shard key', function () {
      const item = { ...getUsers(1, 1)[0], shardKey: 'q' };

      const result = entityManager.addKeys(entity, item);

      expect(result.shardKey).to.equal('q');
      expect(result.entityPK).to.equal('user!q');
    });

    it('should perform sharded overwrite', function () {
      const item = { ...getUsers(1, 1)[0], shardKey: 'q' };

      const result = entityManager.addKeys(entity, item, true);

      expect(result).to.have.property('shardKey').with.length(1);
      expect(result.entityPK).to.match(/user![0-3]/);
    });
  });

  describe('removeKeys', function () {
    it('should remove unsharded keys from item', function () {
      const item = getUsers()[0];

      const result = entityManager.removeKeys(
        entity,
        entityManager.addKeys(entity, item),
      );

      expect(result).to.deep.equal(item);
    });

    it('should remove sharded keys from item', function () {
      const item = getUsers(1, 1)[0];

      const result = entityManager.removeKeys(
        entity,
        entityManager.addKeys(entity, item),
      );

      expect(result).to.deep.equal(item);
    });
  });
});
