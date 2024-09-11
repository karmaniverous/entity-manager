import { expect } from 'chai';

import { type Config, configSchema } from './ParsedConfig.js';
import {
  EntityItem,
  findBump,
  getEntityConfig,
  getIndexComponents,
  getShardKey,
  getShardKeySpace,
  validateEntityItem,
  validateEntityKeyToken,
  validateEntityToken,
  validateTimestamp,
} from './util.js';

interface TestItem {
  entityKey: string;
  timestamp: number;
}

let config: Config;

describe('util', function () {
  describe('validateEntityToken', function () {
    beforeEach(function () {
      config = configSchema.parse({ entities: { foo: {} } });
    });

    it('detects valid entityToken', function () {
      expect(validateEntityToken(config, 'foo')).to.be.true;
    });

    it('fails on invalid entityToken', function () {
      expect(() => validateEntityToken(config, 'bar')).to.throw(
        'invalid entity bar',
      );
    });
  });

  describe('getEntityConfig', function () {
    beforeEach(function () {
      config = configSchema.parse({ entities: { foo: {} } });
    });

    it('retrieves valid entity config', function () {
      expect(getEntityConfig(config, 'foo')).to.deep.equal({
        defaultLimit: 10,
        defaultPageSize: 10,
        indexes: {},
        keys: {},
        sharding: {
          bumps: [
            {
              nibbleBits: 1,
              nibbles: 0,
              timestamp: 0,
            },
          ],
        },
      });
    });

    it('fails on invalid entityToken', function () {
      expect(() => getEntityConfig(config, 'bar')).to.throw(
        'invalid entity bar',
      );
    });
  });

  describe('getIndexComponents', function () {
    beforeEach(function () {
      config = configSchema.parse({
        entities: {
          foo: {
            indexes: { bar: ['baz'] },
            keys: { baz: { encode: () => 'baz', decode: () => ({}) } },
          },
        },
      });
    });

    it('retrieves valid index components', function () {
      expect(getIndexComponents(config, 'foo', 'bar')).to.deep.equal(['baz']);
    });

    it('fails on invalid indexToken', function () {
      expect(() => getIndexComponents(config, 'foo', 'fum')).to.throw(
        'invalid index fum on entity foo',
      );
    });
  });

  describe('validateTimestamp', function () {
    it('detects valid timestamp', function () {
      expect(validateTimestamp(42)).to.be.true;
    });

    it('fails on negative timestamp', function () {
      expect(() => validateTimestamp(-1)).to.throw(
        'timestamp must be a non-negative integer',
      );
    });

    it('fails on fractional timestamp', function () {
      expect(() => validateTimestamp(1.5)).to.throw(
        'timestamp must be a non-negative integer',
      );
    });
  });

  describe('findBump', function () {
    beforeEach(function () {
      config = configSchema.parse({
        entities: {
          foo: {
            sharding: {
              bumps: [
                { timestamp: 2, nibbleBits: 1, nibbles: 1 },
                { timestamp: 4, nibbleBits: 1, nibbles: 2 },
              ],
              entityKey: () => 'foo',
              timestamp: () => 0,
            },
          },
        },
      });
    });

    it('finds first bump', function () {
      expect(findBump(config, 'foo', 1).timestamp).to.equal(0);
    });

    it('finds middle bump', function () {
      expect(findBump(config, 'foo', 3).timestamp).to.equal(2);
    });

    it('finds last bump', function () {
      expect(findBump(config, 'foo', 5).timestamp).to.equal(4);
    });
  });

  describe('getShardKey', function () {
    beforeEach(function () {
      config = configSchema.parse({
        entities: {
          foo: {
            sharding: {
              bumps: [
                { timestamp: 2, nibbleBits: 3, nibbles: 1 },
                { timestamp: 4, nibbleBits: 5, nibbles: 2 },
              ],
              entityKey: ({ entityKey }: TestItem) => entityKey,
              timestamp: ({ timestamp }: TestItem) => timestamp,
            },
          },
        },
      });
    });

    it('gets correct shard key for first bump', function () {
      expect(
        getShardKey(config, 'foo', { entityKey: 'bar', timestamp: 1 }),
      ).to.equal(undefined);
    });

    it('gets correct shard key for middle bump', function () {
      expect(
        getShardKey(config, 'foo', { entityKey: 'bar', timestamp: 3 }),
      ).to.equal('4');
    });

    it('gets correct shard key for last bump', function () {
      expect(
        getShardKey(config, 'foo', { entityKey: 'bar', timestamp: 5 }),
      ).to.equal('1k');
    });
  });

  describe('getShardKeySpace', function () {
    beforeEach(function () {
      config = configSchema.parse({
        entities: {
          foo: {
            sharding: {
              bumps: [
                { timestamp: 3, nibbleBits: 2, nibbles: 1 },
                { timestamp: 6, nibbleBits: 2, nibbles: 2 },
              ],
              entityKey: () => 'foo',
              timestamp: () => 0,
            },
          },
        },
      });
    });

    it('gets correct shard key space for first bump', function () {
      expect(getShardKeySpace(config, 'foo', 0, 1)).to.deep.equal([undefined]);
    });

    it('gets correct shard key space for middle bump', function () {
      expect(getShardKeySpace(config, 'foo', 0, 4)).to.deep.equal([
        undefined,
        '0',
        '1',
        '2',
        '3',
      ]);
    });

    it('gets correct shard key space for last bump', function () {
      expect(getShardKeySpace(config, 'foo', 0, 7)).to.deep.equal([
        undefined,
        '0',
        '1',
        '2',
        '3',
        '00',
        '01',
        '02',
        '03',
        '10',
        '11',
        '12',
        '13',
        '20',
        '21',
        '22',
        '23',
        '30',
        '31',
        '32',
        '33',
      ]);
    });

    it('gets correct shard key space on edge of range', function () {
      expect(getShardKeySpace(config, 'foo', 3, 5)).to.deep.equal([
        '0',
        '1',
        '2',
        '3',
      ]);
    });

    it('gets correct shard key space in middle of range', function () {
      expect(getShardKeySpace(config, 'foo', 4, 5)).to.deep.equal([
        '0',
        '1',
        '2',
        '3',
      ]);
    });
  });

  describe('validateEntityItem', function () {
    it('detects valid item', function () {
      expect(validateEntityItem({ foo: 'bar' })).to.be.true;
    });

    it('fails on invalid item', function () {
      expect(() =>
        validateEntityItem([{ foo: 'bar' }] as unknown as EntityItem),
      ).to.throw('invalid item');
    });
  });

  describe('validateEntityKeyToken', function () {
    beforeEach(function () {
      config = configSchema.parse({
        entities: {
          foo: { keys: { bar: { encode: () => 'bar', decode: () => ({}) } } },
        },
      });
    });

    it('detects valid keyToken', function () {
      expect(validateEntityKeyToken(config, 'foo', 'bar')).to.be.true;
    });

    it('fails on invalid keyToken', function () {
      expect(() => validateEntityKeyToken(config, 'foo', 'baz')).to.throw(
        'invalid entity foo key baz',
      );
    });
  });
});
