"use client";

import { usePasskeyManagementViewModel } from "@modules/auth/core/src/presentation/viewmodels/usePasskeyManagementViewModel";
import { useSsoProviders } from "@modules/auth/signin/src/presentation/viewmodels/useSsoProviders";
import { useImpersonation } from "@modules/auth/core/src/presentation/viewmodels/useImpersonation";

/**
 * Core-level bridge to the auth module's STATEFUL hooks.
 *
 * Modules may not import each other (FE-018); core may import modules. Everything another module
 * needs out of auth is re-exposed through core, via a STATIC import so it always resolves.
 *
 * This replaces the runtime component registry, whose entries were only populated as a side effect
 * of importing the `@modules/auth` barrel. No route imports that barrel, so consumers silently fell
 * back to no-ops: the profile page reported `isWebAuthnSupported: false` forever and the admin
 * impersonate button did nothing.
 *
 * Every hook here transitively pulls the auth DI container (they all talk to auth repositories),
 * so this module is deliberately kept to hooks only. Auth's presentational surfaces live in
 * `@core/components/auth-surfaces`, which stays free of the container — importing a shell should
 * not drag an HTTP client behind it.
 *
 * Imports are deep rather than through `@modules/auth`, so consuming one hook does not pull
 * LoginView, the signup wizard and every repository into the consumer's bundle.
 *
 * Nothing in `src/modules/shared/auth` is modified by this file; it only reads from it.
 */

/**
 * Passkey (WebAuthn) management: capability detection, listing, registration, rename and delete.
 */
export function useCorePasskeyManagement() {
  return usePasskeyManagementViewModel();
}

/**
 * Available SSO providers plus the login-initiation action, for account linking flows.
 */
export function useCoreSsoProviders() {
  return useSsoProviders();
}

/**
 * Account impersonation: starts an impersonation session for a target admin.
 */
export function useCoreImpersonation() {
  return useImpersonation();
}
