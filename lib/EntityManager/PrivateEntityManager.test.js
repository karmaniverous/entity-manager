/* eslint-env mocha */

// mocha imports
import { expect } from 'chai';

// subject imports
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE_SIZE,
  PrivateEntityManager,
} from './PrivateEntityManager.js';

describe('PrivateEntityManager', function () {
  describe('constructor', function () {
    it('should create a new PrivateEntityManager', function () {
      const privateEntityManager = new PrivateEntityManager();
      expect(privateEntityManager).to.be.an.instanceof(PrivateEntityManager);
    });

    it('should allow no config', function () {
      expect(() => new PrivateEntityManager()).not.to.throw();
    });

    it('should fail on unknown top-level property', function () {
      const config = { foo: {} };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on invalid entity', function () {
      const config = { entities: { 'foo-bar': {} } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on unknown entity property', function () {
      const config = { entities: { foo: { bar: 'baz' } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on invalid entity nibbles value type', function () {
      const config = { entities: { foo: { sharding: { nibbles: 'baz' } } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on negative entity nibbles value', function () {
      const config = { entities: { foo: { nibbles: -1 } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on entity nibbles value over 40', function () {
      const config = { entities: { foo: { sharding: { nibbles: 41 } } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on invalid entity bumps type', function () {
      const config = { entities: { foo: { sharding: { bumps: 'bar' } } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on invalid entity bumps property', function () {
      const config = { foo: { sharding: { bumps: { bar: 1 } } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on invalid entity bumps value type', function () {
      const config = {
        entities: { foo: { sharding: { bumps: { 1: 'baz' } } } },
      };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on negative entity bumps value', function () {
      const config = { entities: { foo: { sharding: { bumps: { 1: -1 } } } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail on entity bumps value over 40', function () {
      const config = { entities: { foo: { sharding: { bumps: { 1: 41 } } } } };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail if nibbles undefined & min bumps value = 0', function () {
      const config = {
        entities: { foo: { sharding: { bumps: { 0: 0, 1: 1 } } } },
      };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail if nibbles >= min bumps value', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 0, bumps: { 0: 0, 1: 1 } } } },
      };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });

    it('should fail if bump values do not monotonically increase by key', function () {
      const config = {
        entities: {
          foo: { sharding: { nibbles: 0, bumps: { 0: 1, 2: 2, 1: 3 } } },
        },
      };

      expect(() => new PrivateEntityManager({ config })).to.throw();
    });
  });

  describe('config', function () {
    it('should return conformed config', function () {
      const config = { entities: { foo: {} } };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.config).to.deep.equal({
        entities: {
          foo: {
            defaultLimit: DEFAULT_LIMIT,
            defaultPageSize: DEFAULT_PAGE_SIZE,
            indexes: {},
            keys: {},
            sharding: {
              bumps: {},
              entityKey: undefined,
              nibbleBits: 1,
              nibbles: 0,
              timestamp: undefined,
            },
          },
        },
        shardKeyToken: 'shardId',
      });
    });
  });

  describe('getNibbles', function () {
    it('should fail if no entityToken', function () {
      const config = {};

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(() => privateEntityManager.getNibbles()).to.throw();
    });

    it('should fail if unknown entityToken', function () {
      const config = {};

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(() => privateEntityManager.getNibbles('foo')).to.throw();
    });

    it('should return nibbles with no bumps', function () {
      const config = { entities: { foo: { sharding: { nibbles: 1 } } } };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getNibbles('foo')).to.deep.equal({
        nibbleBits: 1,
        nibbles: 1,
      });
    });

    it('should return nibbles with only future bumps', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getNibbles('foo', 1)).to.deep.equal({
        nibbleBits: 1,
        nibbles: 1,
      });
    });

    it('should return last bump', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getNibbles('foo', 3)).to.deep.equal({
        nibbleBits: 1,
        nibbles: 2,
      });
    });
  });

  describe('getShardKey', function () {
    it('should fail if no entityToken', function () {
      const config = {};

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(() => privateEntityManager.getShardKey()).to.throw();
    });

    it('should fail if no entityKey', function () {
      const config = {};
      const entityToken = 'foo';

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(() => privateEntityManager.getShardKey(entityToken)).to.throw();
    });

    it('should fail on unknown entityToken', function () {
      const config = {};
      const entityToken = 'foo';
      const entityKey = 'bar';

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(() =>
        privateEntityManager.getShardKey(entityToken, entityKey)
      ).to.throw();
    });

    it('should return correct shardKey with no bumps', function () {
      const config = { entities: { foo: { sharding: { nibbles: 1 } } } };
      const entityToken = 'foo';
      const entityKey = 'bar';

      const privateEntityManager = new PrivateEntityManager({ config });
      const shardKey = privateEntityManager.getShardKey(entityToken, entityKey);

      expect(shardKey).to.have.lengthOf(1);
    });

    it('should return correct shardKey with only future bumps', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };
      const entityToken = 'foo';
      const entityKey = 'bar';

      const privateEntityManager = new PrivateEntityManager({ config });
      const shardKey = privateEntityManager.getShardKey(
        entityToken,
        entityKey,
        1
      );

      expect(shardKey).to.have.lengthOf(1);
    });

    it('should correct shardKey for last bump', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };
      const entityToken = 'foo';
      const entityKey = 'bar';

      const privateEntityManager = new PrivateEntityManager({ config });
      const shardKey = privateEntityManager.getShardKey(
        entityToken,
        entityKey,
        3
      );

      expect(shardKey).to.have.lengthOf(2);
    });

    it('supports documentation examples', function () {
      const config = {
        entities: {
          transaction: {
            sharding: {
              nibbles: 1,
              bumps: {
                1676354948256: 2,
                1676554948256: 3,
              },
            },
          },
        },
      };
      const entityToken = 'transaction';
      const entityKey = 'some_transaction_key';

      const privateEntityManager = new PrivateEntityManager({ config });

      let shardKey = privateEntityManager.getShardKey(
        entityToken,
        entityKey,
        1676454948256
      );
      expect(shardKey).to.have.lengthOf(2);

      shardKey = privateEntityManager.getShardKey(
        entityToken,
        entityKey,
        1676554948256
      );
      expect(shardKey).to.have.lengthOf(3);
    });
  });

  describe('getShardSpace', function () {
    it('supports zero nibble', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 0, bumps: { 2: 1, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getShardKeySpace('foo', 3)).to.deep.equal([
        undefined,
        '0',
        '1',
      ]);
    });

    it('supports pre-bump timestamp', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getShardKeySpace('foo', 1)).to.deep.equal([
        '0',
        '1',
      ]);
    });

    it('supports mid-bump timestamp', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getShardKeySpace('foo', 3)).to.deep.equal([
        '0',
        '1',
        '00',
        '01',
        '10',
        '11',
      ]);
    });
  });
});
