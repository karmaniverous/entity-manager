import { defaultTranscodes, type EntityMap } from '@karmaniverous/entity-tools';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Config } from './Config';
import type { ConfigMap } from './ConfigMap';
import { configSchema } from './ParsedConfig';

interface BazBarEntityMap extends EntityMap {
  foo: { bar: string; baz: number };
}

let testConfig: Config<
  ConfigMap<{
    EntityMap: BazBarEntityMap;
    HashKey: 'hashKey';
    RangeKey: 'rangeKey';
    ShardedKeys: 'shardedProperty';
    UnshardedKeys: 'unshardedProperty';
    TranscodedProperties: 'bar' | 'baz';
  }>
>;

describe('Config', function () {
  beforeEach(function () {
    testConfig = {
      entities: {
        foo: {
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      generatedProperties: {
        sharded: {
          shardedProperty: ['bar'],
        },
        unsharded: {
          unshardedProperty: ['baz'],
        },
      },
      hashKey: 'hashKey',
      propertyTranscodes: { bar: 'string', baz: 'int' },
      rangeKey: 'rangeKey',
      transcodes: defaultTranscodes,
    };
  });

  it('should apply config defaults', function () {
    const config: Config<
      ConfigMap<{ HashKey: 'hashKey'; RangeKey: 'rangeKey' }>
    > = {
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
      transcodes: defaultTranscodes,
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig).to.deep.include({
      entities: {},
      generatedKeyDelimiter: '|',
      generatedProperties: {
        sharded: {},
        unsharded: {},
      },
      generatedValueDelimiter: '#',
      indexes: {},
      propertyTranscodes: {},
      shardKeyDelimiter: '!',
      throttle: 10,
    });
  });

  it('should apply entity defaults', function () {
    const parsedConfig = configSchema.parse(testConfig);

    expect(parsedConfig.entities.foo).to.deep.include({
      defaultLimit: 10,
      defaultPageSize: 10,
      shardBumps: [{ timestamp: 0, chars: 0, charBits: 1 }],
    });
  });

  it('should fail on invalid generated key delimiter', function () {
    testConfig.generatedKeyDelimiter = 'foo';

    expect(() => configSchema.parse(testConfig)).to.throw('regex');
  });

  it('should fail on generated key delimiter collision', function () {
    testConfig.generatedKeyDelimiter = '#';

    expect(() => configSchema.parse(testConfig)).to.throw(
      'generatedKeyDelimiter contains generatedValueDelimiter',
    );
  });

  it('should fail on invalid generated value delimiter', function () {
    testConfig.generatedValueDelimiter = 'foo';

    expect(() => configSchema.parse(testConfig)).to.throw('regex');
  });

  it('should fail on generated value delimiter collision', function () {
    testConfig.generatedValueDelimiter = '|';

    expect(() => configSchema.parse(testConfig)).to.throw(
      'generatedValueDelimiter contains generatedKeyDelimiter',
    );
  });

  it('should fail on invalid shard key delimiter', function () {
    testConfig.shardKeyDelimiter = 'foo';

    expect(() => configSchema.parse(testConfig)).to.throw('regex');
  });

  it('should fail on shard key delimiter collision', function () {
    testConfig.shardKeyDelimiter = '|';

    expect(() => configSchema.parse(testConfig)).to.throw(
      'shardKeyDelimiter contains generatedKeyDelimiter',
    );
  });

  it('should allow empty index projections', function () {
    testConfig.indexes = {
      id: { hashKey: 'hashKey', rangeKey: 'bar', projections: [] },
    };

    expect(() => configSchema.parse(testConfig)).not.to.throw;
  });

  it('should fail when entity index projections contain dupes', function () {
    testConfig.indexes = {
      id: {
        hashKey: 'hashKey',
        rangeKey: 'bar',
        projections: ['bang', 'bang'],
      },
    };

    expect(() => configSchema.parse(testConfig)).to.throw(
      'duplicate array element',
    );
  });

  it('should fail when entity index projections contain hash key', function () {
    testConfig.indexes = {
      id: {
        hashKey: 'hashKey',
        rangeKey: 'bar',
        projections: ['hashKey'],
      },
    };

    expect(() => configSchema.parse(testConfig)).to.throw(
      'index projection is a key',
    );
  });

  it('should fail when entity index projections contain range key', function () {
    testConfig.indexes = {
      id: {
        hashKey: 'hashKey',
        rangeKey: 'bar',
        projections: ['bar'],
      },
    };

    expect(() => configSchema.parse(testConfig)).to.throw(
      'index projection is a key',
    );
  });

  it('should fail when entity index projections contain other key', function () {
    testConfig.indexes = {
      id: {
        hashKey: 'hashKey',
        rangeKey: 'bar',
        projections: ['rangeKey'],
      },
    };

    expect(() => configSchema.parse(testConfig)).to.throw(
      'index projection is a key',
    );
  });

  it('should fail when sharded generated property elements is empty', function () {
    testConfig.generatedProperties.sharded.shardedProperty = [];

    expect(() => configSchema.parse(testConfig)).to.throw('too_small');
  });

  it('should fail when sharded generated property elements contains dupes', function () {
    testConfig.generatedProperties.sharded.shardedProperty = ['bar', 'bar'];

    expect(() => configSchema.parse(testConfig)).to.throw(
      'duplicate array element',
    );
  });

  it('should fail when unsharded generated property elements is empty', function () {
    testConfig.generatedProperties.unsharded.unshardedProperty = [];

    expect(() => configSchema.parse(testConfig)).to.throw('too_small');
  });

  it('should fail when unsharded generated property elements contains dupes', function () {
    testConfig.generatedProperties.unsharded.unshardedProperty = ['bar', 'bar'];

    expect(() => configSchema.parse(testConfig)).to.throw(
      'duplicate array element',
    );
  });

  it('should fail on negative entity sharding bump chars value', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 0, chars: -1, charBits: 1 },
    ];

    expect(() => configSchema.parse(testConfig)).to.throw(
      'Too small: expected number to be >=0',
    );
  });

  it('should fail on entity sharding bump chars value over 40', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 0, chars: 41, charBits: 1 },
    ];

    expect(() => configSchema.parse(testConfig)).to.throw(
      'Too big: expected number to be <=40',
    );
  });

  it('should fail when entity sharding bumps contain duplicate timestamp', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 0, chars: 0, charBits: 1 },
      { timestamp: 0, chars: 1, charBits: 1 },
    ];

    expect(() => configSchema.parse(testConfig)).to.throw(
      'duplicate array element',
    );
  });

  it('should add missing entity sharding bumps zero-timestamp bump', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 1, chars: 1, charBits: 1 },
    ];

    const parsedConfig = configSchema.parse(testConfig);

    expect(parsedConfig.entities.foo.shardBumps[0]).to.deep.equal({
      timestamp: 0,
      chars: 0,
      charBits: 1,
    });
  });

  it('should sort entity sharding bumps by timestamp', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 2, charBits: 1, chars: 2 },
      { timestamp: 1, charBits: 1, chars: 1 },
    ];

    const parsedConfig = configSchema.parse(testConfig);

    expect(parsedConfig.entities.foo.shardBumps).to.deep.equal([
      { timestamp: 0, charBits: 1, chars: 0 },
      { timestamp: 1, charBits: 1, chars: 1 },
      { timestamp: 2, charBits: 1, chars: 2 },
    ]);
  });

  it('should fail when entity sharding bumps chars do not increase monotonically with timestamp', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 1, charBits: 1, chars: 1 },
      { timestamp: 2, charBits: 1, chars: 1 },
    ];

    expect(() => configSchema.parse(testConfig)).to.throw(
      'shardBump chars do not monotonically increase at timestamp',
    );
  });

  it('should keep configured zero-timestamp bump', function () {
    testConfig.entities.foo.shardBumps = [
      { timestamp: 2, charBits: 1, chars: 2 },
      { timestamp: 1, charBits: 1, chars: 1 },
      { timestamp: 0, charBits: 1, chars: 0 },
    ];

    const parsedConfig = configSchema.parse(testConfig);

    expect(parsedConfig.entities.foo.shardBumps).to.deep.equal([
      { timestamp: 0, charBits: 1, chars: 0 },
      { timestamp: 1, charBits: 1, chars: 1 },
      { timestamp: 2, charBits: 1, chars: 2 },
    ]);
  });
});
