"use client";

import { usePasskeyManagementViewModel } from "@modules/auth";
import { useSsoProviders } from "@modules/auth/signin";
import { useImpersonation } from "@modules/auth/core/src/presentation/viewmodels/useImpersonation";

/**
 * useCorePasskeyManagement
 *
 * Core-level bridge hook to access the auth module's passkey management viewmodel.
 * Resolves FE-018 cross-module references by providing an abstraction in @core.
 */
export function useCorePasskeyManagement() {
  return usePasskeyManagementViewModel();
}

/**
 * useCoreSsoProviders
 *
 * Core-level bridge hook to access the auth module's SSO providers.
 * Resolves FE-018 cross-module references by providing an abstraction in @core.
 */
export function useCoreSsoProviders() {
  return useSsoProviders();
}

/**
 * useCoreImpersonation
 *
 * Core-level bridge hook to access the auth module's impersonation viewmodel/hook.
 * Resolves FE-018 cross-module references by providing an abstraction in @core.
 */
export function useCoreImpersonation() {
  return useImpersonation();
}
