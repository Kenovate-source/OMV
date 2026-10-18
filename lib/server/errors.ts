// lib/server/errors.ts — small shared error types for the server layer.

/** A required environment variable / setup step is missing. Always a
 *  deployment problem, never the customer's fault. */
export class ConfigError extends Error {
  constructor(public readonly variable: string) {
    super(`Required environment variable is not set: ${variable}`);
    this.name = "ConfigError";
  }
}
