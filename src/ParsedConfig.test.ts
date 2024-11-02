/* eslint-env mocha */

import { defaultTranscodes } from '@karmaniverous/entity-tools';
import { expect } from 'chai';

import type { Config, EntityMap } from './Config';
import { configSchema } from './ParsedConfig';

describe('Config', function () {
  it('should apply config defaults', function () {
    const config: Config = { transcodes: defaultTranscodes };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig).to.deep.include({
      entities: {},
      generatedKeyDelimiter: '|',
      generatedValueDelimiter: '#',
      hashKey: 'hashKey',
      shardKeyDelimiter: '!',
      rangeKey: 'rangeKey',
      throttle: 10,
    });
  });

  it('should apply entity defaults', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
      transcodes: defaultTranscodes,
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo).to.deep.include({
      defaultLimit: 10,
      defaultPageSize: 10,
      generated: {},
      indexes: {},
      shardBumps: [{ timestamp: 0, chars: 0, charBits: 1 }],
      elementTranscodes: { bar: 'string', baz: 'int' },
    });
  });

  it('should fail on invalid generated key delimiter', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      generatedKeyDelimiter: 'foo',
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw('regex');
  });

  it('should fail on generated key delimiter collision', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      generatedKeyDelimiter: '#',
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'generatedKeyDelimiter contains generatedValueDelimiter',
    );
  });

  it('should fail on invalid generated value delimiter', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      generatedValueDelimiter: 'foo',
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw('regex');
  });

  it('should fail on generated value delimiter collision', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      generatedValueDelimiter: '|',
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'generatedValueDelimiter contains generatedKeyDelimiter',
    );
  });

  it('should fail on invalid shard key delimiter', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      shardKeyDelimiter: 'foo',
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw('regex');
  });

  it('should fail on shard key delimiter collision', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      shardKeyDelimiter: '|',
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'shardKeyDelimiter contains generatedKeyDelimiter',
    );
  });

  it('should fail when entity index components are empty', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          indexes: { id: { components: [] } },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw('too_small');
  });

  it('should fail when entity index components contain dupes', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          indexes: { id: { components: ['bar', 'bar'] } },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      "duplicate array element 'bar'",
    );
  });

  it('should fail when entity index projections are empty', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          indexes: {
            id: { components: ['hashKey', 'rangeKey', 'bar'], projections: [] },
          },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw('too_small');
  });

  it('should fail when entity index projections contain dupes', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          indexes: {
            // @ts-expect-error Type '"bang"' is not assignable to type '"bar" | "baz"'
            id: { components: ['bar', 'baz'], projections: ['bang', 'bang'] },
          },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      "duplicate array element 'bang'",
    );
  });

  it('should fail when entity index projections contain component', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          indexes: {
            id: { components: ['bar', 'baz'], projections: ['bar'] },
          },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'index projection is an index component, hash key, or range key',
    );
  });

  it('should fail when entity index projections contain hash key', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          indexes: {
            // @ts-expect-error Type '"hashKey"' is not assignable to type '"bar" | "baz"'
            id: { components: ['bar', 'baz'], projections: ['hashKey'] },
          },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'index projection is an index component, hash key, or range key',
    );
  });

  it('should fail when entity generated elements is empty', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number; boo: never };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          generated: {
            boo: { elements: [] },
          },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw('too_small');
  });

  it('should fail when entity generated elements contains dupes', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number; boo: never };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          generated: {
            boo: { elements: ['bar', 'bar'] },
          },
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      "duplicate array element 'bar'",
    );
  });

  it('should fail on negative entity sharding bump chars value', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          shardBumps: [{ timestamp: 0, chars: -1, charBits: 1 }],
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'Number must be greater than or equal to 0',
    );
  });

  it('should fail on entity sharding bump chars value over 40', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          shardBumps: [{ timestamp: 0, chars: 41, charBits: 1 }],
          elementTranscodes: { bar: 'string', baz: 'int' },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'Number must be less than or equal to 40',
    );
  });

  it('should fail when entity sharding bumps contain duplicate timestamp', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          shardBumps: [
            { timestamp: 0, chars: 0, charBits: 1 },
            { timestamp: 0, chars: 1, charBits: 1 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'duplicate array element',
    );
  });

  it('should add missing entity sharding bumps zero-timestamp bump', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          shardBumps: [{ timestamp: 1, chars: 1, charBits: 1 }],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo.shardBumps[0]).to.deep.equal({
      timestamp: 0,
      chars: 0,
      charBits: 1,
    });
  });

  it('should sort entity sharding bumps by timestamp', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          shardBumps: [
            { timestamp: 2, charBits: 1, chars: 2 },
            { timestamp: 1, charBits: 1, chars: 1 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo.shardBumps).to.deep.equal([
      { timestamp: 0, charBits: 1, chars: 0 },
      { timestamp: 1, charBits: 1, chars: 1 },
      { timestamp: 2, charBits: 1, chars: 2 },
    ]);
  });

  it('should fail when entity sharding bumps chars do not increase monotonically with timestamp', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          shardBumps: [
            { timestamp: 1, charBits: 1, chars: 1 },
            { timestamp: 2, charBits: 1, chars: 1 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'shardBump chars do not monotonically increase at timestamp',
    );
  });

  it('should keep configured zero-timestamp bump', function () {
    interface MyEntityMap extends EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<MyEntityMap> = {
      entities: {
        foo: {
          elementTranscodes: { bar: 'string', baz: 'int' },
          shardBumps: [
            { timestamp: 2, charBits: 1, chars: 2 },
            { timestamp: 1, charBits: 1, chars: 1 },
            { timestamp: 0, charBits: 1, chars: 0 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      rangeKey: 'rangeKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo.shardBumps).to.deep.equal([
      { timestamp: 0, charBits: 1, chars: 0 },
      { timestamp: 1, charBits: 1, chars: 1 },
      { timestamp: 2, charBits: 1, chars: 2 },
    ]);
  });
});
