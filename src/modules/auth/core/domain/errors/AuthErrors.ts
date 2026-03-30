/**
 * Auth Errors — Domain Layer
 *
 * Custom error types used in the auth flow.
 * These are domain concepts consumed by both data and presentation layers.
 *
 * @module auth/core/domain
 */

/**
 * Thrown when login requires 2FA verification.
 * The UI catches this to transition to the 2FA input step.
 */
export class TwoFactorRequiredError extends Error {
  constructor() {
    super("Two-factor authentication required");
    this.name = "TwoFactorRequiredError";
  }
}
