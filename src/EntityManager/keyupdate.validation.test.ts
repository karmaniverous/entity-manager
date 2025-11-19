import { describe, expect, it } from 'vitest';

import { entityManager } from '../../test/config';
import { updateItemHashKey } from './updateItemHashKey';
import { updateItemRangeKey } from './updateItemRangeKey';

describe('key update validations', function () {
  it('updateItemHashKey throws when timestampProperty missing', function () {
    expect(() => updateItemHashKey(entityManager, 'user', {})).toThrow(
      /missing item timestamp property/i,
    );
  });

  it('updateItemHashKey throws when uniqueProperty missing', function () {
    expect(() =>
      updateItemHashKey(
        entityManager,
        'user',
        // Provide timestamp but omit uniqueProperty
        { created: Date.now() },
      ),
    ).toThrow(/missing item unique property/i);
  });

  it('updateItemRangeKey throws when uniqueProperty missing', function () {
    expect(() => updateItemRangeKey(entityManager, 'user', {})).toThrow(
      /missing item unique property/i,
    );
  });
});
