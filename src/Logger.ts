/**
 * Generic logger endpoint type.
 *
 * @category Logger
 */
export type LoggerEndpoint = (...args: unknown[]) => void;

/**
 * Logger interface.
 *
 * @category Logger
 */
export interface Logger {
  debug: LoggerEndpoint;
  error: LoggerEndpoint;
}

/**
 * Logger options.
 *
 * @category Logger
 */
export interface LoggerOptions {
  /** Logger to use for internal logging. Must support the `debug` & `error` methods. Defaults to `console`. */
  logger?: Logger;

  /** Enables internal logging when `true`. */
  logInternals?: boolean;
}
