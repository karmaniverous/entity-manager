/**
 * Flattens the top layer of logic in a type.
 *
 * @category Utility
 * @protected
 */
export type Unwrap<T> = { [P in keyof T]: T[P] };
