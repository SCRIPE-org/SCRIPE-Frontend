/**
 * Auth Module Public Exports
 */

// Core
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
