/* eslint-env mocha */

import { expect } from 'chai';
import { inspect } from 'util';

import { config, day, now, UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { EntityManager } from './EntityManager';

const entityManager = new EntityManager(config, {
  logger: {
    ...console,
    debug: (...args: unknown[]) => {
      console.debug(...args.map((arg) => inspect(arg, false, null)));
    },
  },
});

describe('EntityManager', function () {
  describe('updateItemHashKey', function () {
    it('should add unsharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now;

      entityManager.updateItemHashKey('user', item);

      expect(item.hashKey).to.equal('user!');
    });

    it('should add sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day;

      entityManager.updateItemHashKey('user', item);

      expect(item.hashKey?.length).to.equal(6);
    });

    it('should not overwrite sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day * 2;
      item.hashKey = 'user!q';

      entityManager.updateItemHashKey('user', item);

      expect(item.hashKey).to.equal('user!q');
    });

    it('should overwrite sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day * 2;
      item.hashKey = 'user!q';

      entityManager.updateItemHashKey('user', item, true);

      expect(item.hashKey.length).to.equal(7);
    });
  });
});
