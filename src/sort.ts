import { isNumber, isString } from 'radash';

import type { Entity } from './Config';
import { isNil } from './util';

/**
 * Specifies progressive sorting on properties of `Item`.
 *
 * @typeParam Item - Item type.
 */
export type SortOrder<Item extends Entity> = {
  property: keyof Item;
  desc?: boolean;
}[];

/**
 * Sort an array of `Item` progressively by `sort`.
 *
 * @typeParam Item - Item type.
 *
 * @param items - Array of Item.
 * @param sort - Sort array.
 *
 * @returns Sorted `items`.
 *
 * @remarks
 * Sorts `items` progresively by the elements of `sort`, passing to the next element if values at the current element are equal.
 *
 * Comparisons are made as expected for `number`, `string`, and `bigint` types.
 *
 * `null` and `undefined` values are considered equivalent and less than any other value.
 *
 *  Other types are compared by truthiness, where truthy is greater than falsy.
 */
export const sort = <Item extends Entity>(
  items: Item[] = [],
  sortOrder: SortOrder<Item> = [],
): Item[] =>
  [...items].sort((a, b) => {
    let comp = 0;

    for (const { property, desc } of sortOrder) {
      if (isNumber(a[property]) && isNumber(b[property]))
        comp = a[property] - b[property];
      else if (isString(a[property]) && isString(b[property]))
        comp = a[property].localeCompare(b[property]);
      else if (
        typeof a[property] === 'bigint' &&
        typeof b[property] === 'bigint'
      )
        comp =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      else if (!isNil(a[property]) && isNil(b[property])) comp = 1;
      else if (isNil(a[property]) && !isNil(b[property])) comp = -1;
      else if (a[property] && !b[property]) comp = 1;
      else if (!a[property] && b[property]) comp = -1;

      if (comp) return desc ? -comp : comp;
    }

    return comp;
  });
