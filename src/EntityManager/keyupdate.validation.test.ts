import { describe, expect, it } from 'vitest';

import { day, entityManager, now } from '../../test/config';
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
        { created: now + day },
      ),
    ).toThrow(/missing item unique property/i);
  });

  it('updateItemRangeKey throws when uniqueProperty missing', function () {
    expect(() => updateItemRangeKey(entityManager, 'user', {})).toThrow(
      /missing item unique property/i,
    );
  });
});
