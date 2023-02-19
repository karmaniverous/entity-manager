/* eslint-env mocha */

// mocha imports
import chai from 'chai';
const expect = chai.expect;

// subject imports
import { PrivateEntityManager } from './PrivateEntityManager.js';

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
            keys: {},
            sharding: { bumps: {}, nibbles: 0, source: undefined },
          },
        },
        shardKeyToken: 'shardId',
      });
    });
  });

  describe('bumpNibbles', function () {
    it('should conform valid input', function () {
      const now = Date.now() + 1000;
      const config = {
        entities: {
          foo: {
            sharding: {
              nibbles: 1,
              bumps: { [now - 1000]: 2, [now + 1000]: 4 },
            },
          },
        },
      };

      const privateEntityManager = new PrivateEntityManager({ config });
      privateEntityManager.bumpNibbles('foo', now, 3);

      expect(privateEntityManager.config).to.deep.equal({
        entities: {
          foo: {
            keys: {},
            sharding: {
              bumps: { [now - 1000]: 2, [now]: 3, [now + 1000]: 4 },
              nibbles: 1,
              source: undefined,
            },
          },
        },
        shardKeyToken: 'shardId',
      });
    });

    it('should fail with past timestamp', function () {
      const now = Date.now() - 1000;
      const config = {
        entities: {
          foo: {
            sharding: {
              nibbles: 1,
              bumps: { [now - 1000]: 2, [now + 1000]: 4 },
            },
          },
        },
      };

      const privateEntityManager = new PrivateEntityManager({ config });
      expect(() => privateEntityManager.bumpNibbles('foo', now, 3)).to.throw();
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

      expect(privateEntityManager.getNibbles('foo')).to.equal(1);
    });

    it('should return nibbles with only future bumps', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getNibbles('foo', 1)).to.equal(1);
    });

    it('should return last bump', function () {
      const config = {
        entities: { foo: { sharding: { nibbles: 1, bumps: { 2: 2, 4: 4 } } } },
      };

      const privateEntityManager = new PrivateEntityManager({ config });

      expect(privateEntityManager.getNibbles('foo', 3)).to.equal(2);
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
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
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
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
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
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        '00',
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '0a',
        '0b',
        '0c',
        '0d',
        '0e',
        '0f',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '1a',
        '1b',
        '1c',
        '1d',
        '1e',
        '1f',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '2a',
        '2b',
        '2c',
        '2d',
        '2e',
        '2f',
        '30',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '38',
        '39',
        '3a',
        '3b',
        '3c',
        '3d',
        '3e',
        '3f',
        '40',
        '41',
        '42',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',
        '49',
        '4a',
        '4b',
        '4c',
        '4d',
        '4e',
        '4f',
        '50',
        '51',
        '52',
        '53',
        '54',
        '55',
        '56',
        '57',
        '58',
        '59',
        '5a',
        '5b',
        '5c',
        '5d',
        '5e',
        '5f',
        '60',
        '61',
        '62',
        '63',
        '64',
        '65',
        '66',
        '67',
        '68',
        '69',
        '6a',
        '6b',
        '6c',
        '6d',
        '6e',
        '6f',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '78',
        '79',
        '7a',
        '7b',
        '7c',
        '7d',
        '7e',
        '7f',
        '80',
        '81',
        '82',
        '83',
        '84',
        '85',
        '86',
        '87',
        '88',
        '89',
        '8a',
        '8b',
        '8c',
        '8d',
        '8e',
        '8f',
        '90',
        '91',
        '92',
        '93',
        '94',
        '95',
        '96',
        '97',
        '98',
        '99',
        '9a',
        '9b',
        '9c',
        '9d',
        '9e',
        '9f',
        'a0',
        'a1',
        'a2',
        'a3',
        'a4',
        'a5',
        'a6',
        'a7',
        'a8',
        'a9',
        'aa',
        'ab',
        'ac',
        'ad',
        'ae',
        'af',
        'b0',
        'b1',
        'b2',
        'b3',
        'b4',
        'b5',
        'b6',
        'b7',
        'b8',
        'b9',
        'ba',
        'bb',
        'bc',
        'bd',
        'be',
        'bf',
        'c0',
        'c1',
        'c2',
        'c3',
        'c4',
        'c5',
        'c6',
        'c7',
        'c8',
        'c9',
        'ca',
        'cb',
        'cc',
        'cd',
        'ce',
        'cf',
        'd0',
        'd1',
        'd2',
        'd3',
        'd4',
        'd5',
        'd6',
        'd7',
        'd8',
        'd9',
        'da',
        'db',
        'dc',
        'dd',
        'de',
        'df',
        'e0',
        'e1',
        'e2',
        'e3',
        'e4',
        'e5',
        'e6',
        'e7',
        'e8',
        'e9',
        'ea',
        'eb',
        'ec',
        'ed',
        'ee',
        'ef',
        'f0',
        'f1',
        'f2',
        'f3',
        'f4',
        'f5',
        'f6',
        'f7',
        'f8',
        'f9',
        'fa',
        'fb',
        'fc',
        'fd',
        'fe',
        'ff',
      ]);
    });
  });
});
