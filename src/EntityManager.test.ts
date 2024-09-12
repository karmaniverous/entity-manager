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
  describe('encodeGeneratedProperty', function () {
    it('should encode generated property', function () {
      const [item] = getUsers() as UserItem[];

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'firstNameRK',
      );

      expect(encoded).to.match(
        /^firstNameCanonical#\w+\|lastNameCanonical#\w+$/,
      );
    });

    it('should encode sharded generated property', function () {
      const [item] = getUsers() as UserItem[];
      item.hashKey = 'user!q';

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'lastNameRK',
      );

      expect(encoded).to.match(
        /^user!q\|lastNameCanonical#\w+\|firstNameCanonical#\w+$/,
      );
    });

    it('should encode atomic generated property', function () {
      const [item] = getUsers() as UserItem[];

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'phoneRK',
      );

      expect(encoded).to.match(/^phone#\+\d+\|created#\d+$/);
    });

    it('should not encode atomic generated property with undefined', function () {
      const [item] = getUsers() as UserItem[];
      item.phone = undefined;

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'phoneRK',
      );

      expect(encoded).to.be.undefined;
    });

    it('should fail on unknown generated property', function () {
      const [item] = getUsers() as UserItem[];

      expect(() =>
        entityManager.encodeGeneratedProperty('user', item, 'foo'),
      ).to.throw('unknown');
    });
  });

  describe('decodeGeneratedProperty', function () {
    it('should decode empty string to empty object', function () {
      const decoded = entityManager.decodeGeneratedProperty('user', '');

      expect(decoded).to.deep.equal({});
    });

    it('should fail on no value delimiters', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty('user', 'abc'),
      ).to.throw('invalid generated property value');
    });

    it('should fail on too many value delimiters', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty('user', 'abc#def#ghi'),
      ).to.throw('invalid generated property value');
    });

    it('should decode hash key', function () {
      const decoded = entityManager.decodeGeneratedProperty('user', 'user!q');

      expect(decoded).to.deep.equal({ hashKey: 'user!q' });
    });

    it('should decode generated property', function () {
      const decoded = entityManager.decodeGeneratedProperty(
        'user',
        'firstNameCanonical#lilian|lastNameCanonical#fahey',
      );

      expect(decoded).to.deep.equal({
        firstNameCanonical: 'lilian',
        lastNameCanonical: 'fahey',
      });
    });

    it('should decode generated property with hash key', function () {
      const decoded = entityManager.decodeGeneratedProperty(
        'user',
        'user!q|firstNameCanonical#lilian|lastNameCanonical#fahey',
      );

      expect(decoded).to.deep.equal({
        hashKey: 'user!q',
        firstNameCanonical: 'lilian',
        lastNameCanonical: 'fahey',
      });
    });

    it('should fail on misplaced hash key', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty(
          'user',
          'firstNameCanonical#lilian|user!q|lastNameCanonical#fahey',
        ),
      ).to.throw('invalid generated property value');
    });
  });

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
