/**
 * @file index.ts
 * @description Main entry point for the Auth module. Exports repository instances, view containers,
 * page-level views, and registers cross-module components into the global registry to decouple static dependencies.
 */

import { registerComponent } from "@core/common/component-registry";
import { useLoginBrandingTokens } from "./signin/src/presentation/viewmodels/useLoginBrandingTokens";
import { LoginBranding } from "./signin/src/presentation/components/LoginBranding";
import { SlotRenderer } from "./signin/src/presentation/components/SlotRenderer";
import { SignupShell } from "./signup/src/presentation/components/common/SignupShell";
import { useImpersonation } from "./core/src/presentation/viewmodels/useImpersonation";
import { useSsoProviders } from "./signin/src/presentation/viewmodels/useSsoProviders";
import { usePasskeyManagementViewModel } from "./core/src/presentation/viewmodels/usePasskeyManagementViewModel";

// Register components and hooks at runtime for access by the customization/branding module.
// This decouples static imports and satisfies the architectural modularity requirements.
registerComponent("useLoginBrandingTokens", useLoginBrandingTokens);
registerComponent("LoginBranding", LoginBranding);
registerComponent("SlotRenderer", SlotRenderer);
registerComponent("SignupShell", SignupShell);
registerComponent("useImpersonation", useImpersonation);
registerComponent("useSsoProviders", useSsoProviders);
registerComponent("usePasskeyManagementViewModel", usePasskeyManagementViewModel);

// Core exports
export * from "./core/domain/entities";
export * from "./core/domain/interfaces";
export { AuthRepository } from "./core/data/repositories/AuthRepository";
export { TenantResolutionRepository } from "./core/data/repositories/TenantResolutionRepository";
export { SsoRepository } from "./core/data/repositories/SsoRepository";
export { PasswordResetRepository } from "./core/data/repositories/PasswordResetRepository";
export { authContainer, getAuthContainer } from "./di";

// Submodules
export { LoginView } from "./signin";
export { ForgotPasswordView, ResetPasswordView } from "./password-reset";
export { SetupAccountView } from "./account-setup";
export { SignupWizard } from "./signup/src/presentation/views/SignupWizard";
export { PasskeyManagementView } from "./core/src/presentation/views/PasskeyManagementView";
export { usePasskeyManagementViewModel } from "./core/src/presentation/viewmodels/usePasskeyManagementViewModel";
