/**
 * Transforms a function such that it only executes when `condition` is truthy.
 *
 * @param fn - The function to conditionally execute.
 * @param condition - The condition to check before executing `fn`.
 *
 * @typeParam F - The type of the function to conditionally execute.
 *
 * @returns The conditionalized function with the same signature as `fn`.
 *
 */
export function conditionalize<
  F extends (...args: Parameters<F>) => ReturnType<F>,
>(
  fn: F,
  condition?: unknown,
): (...args: Parameters<F>) => ReturnType<F> | undefined {
  return (...args: Parameters<F>): ReturnType<F> | undefined => {
    if (condition) {
      return fn(...args);
    } else {
      return undefined;
    }
  };
}
