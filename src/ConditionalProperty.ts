/**
 * Return a type with required property K of type O if C is not `never`, otherwise return a type where K is optional or accepts an empty object.
 *
 * @typeParam K - The property key.
 * @typeParam C - The condition to check.
 * @typeParam O - The type of the property.
 */
export type ConditionalProperty<K extends PropertyKey, C, O extends object> = [
  C,
] extends [never]
  ? Record<K, never> | Partial<Record<K, Record<PropertyKey, never>>>
  : Record<K, O>;
