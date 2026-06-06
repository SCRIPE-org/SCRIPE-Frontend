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
    // Required for `instanceof` to work correctly when TypeScript targets ES2015+
    // and the bundler does not preserve the prototype chain for Error subclasses.
    Object.setPrototypeOf(this, TwoFactorRequiredError.prototype);
  }
}

/**
 * Represents a single workspace option returned during multi-tenant login discovery.
 * The frontend renders these as cards in the workspace picker UI.
 */
export interface WorkspaceChoice {
  /** Encrypted tenant ID — passed as tenantId on the second login call */
  tenantId: string;
  /** Tenant code — used to build /login?_tenant={code} URL */
  tenantCode: string;
  /** Display name shown in the picker card */
  tenantName: string;
  /** Logo URL for branding */
  logoUrl: string | null;
  /** True if this is the platform/super-admin workspace (no tenant scope) */
  isPlatformAdmin: boolean;
  /** False means account first-time setup is pending — card shown disabled */
  isActivated: boolean;
  /**
   * True when the workspace cannot be entered for an operational reason:
   * tenant is suspended/cancelled, or the admin account is deactivated.
   * Distinct from isActivated (which is specifically for pending first-time setup).
   */
  isDisabled?: boolean;
  /**
   * Human-readable reason why the workspace is disabled.
   * Null/undefined when isDisabled is false.
   * E.g. "Suspended", "Cancelled", "Account deactivated"
   */
  disabledReason?: string | null;
  /**
   * TRUE — the password entered on the main screen matched this workspace.
   *        Card is unlocked/clickable — select to log in.
   * FALSE — the password didn't match. Card shows an inline 'Enter password' form.
   * Undefined/null — method did not use password (e.g., magic link, SSO).
   */
  isPasswordVerified?: boolean;
  /**
   * TRUE — this account is currently locked out (too many failed attempts).
   *        Card shows lockout badge + countdown until lockedUntil.
   */
  isLocked?: boolean;
  /**
   * ISO date string when the lockout expires (only populated when isLocked is true).
   */
  lockedUntil?: string | null;
}

/**
 * Thrown when the email belongs to multiple tenant admins.
 * Credentials have been validated ✓ — no tokens issued yet.
 * The UI catches this to show the workspace picker and re-call login
 * with the selected tenantId.
 */
export class WorkspaceSelectionRequiredError extends Error {
  public readonly availableWorkspaces: WorkspaceChoice[];

  constructor(workspaces: WorkspaceChoice[]) {
    super("Multiple workspaces found — please select a workspace to continue");
    this.name = "WorkspaceSelectionRequiredError";
    this.availableWorkspaces = workspaces;
    // Required for `instanceof` to work correctly when TypeScript targets ES2015+
    // and the bundler does not preserve the prototype chain for Error subclasses.
    Object.setPrototypeOf(this, WorkspaceSelectionRequiredError.prototype);
  }
}
