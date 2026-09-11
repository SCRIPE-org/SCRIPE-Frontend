/**
 * loginTypes — Type contracts and stage descriptors for user authentication and sign-in viewmodels.
 */

/**
 * Encapsulates credentials and persistence choices captured in the login form.
 */
export interface LoginFormData {
  /** User identifier (email address or username) */
  identifier: string;
  /** Secret credential password */
  password: string;
  /** Persistent refresh session toggle */
  staySignedIn: boolean;
}

/**
 * State machine stages for sign-in and authentication flows.
 */
export type LoginStep =
  | "credentials"
  | "two-factor"
  | "workspace-selection"
  | "magic-link-request"
  | "magic-link-sent"
  | "phone-otp"
  | "passkey"
  | "qr-login";
