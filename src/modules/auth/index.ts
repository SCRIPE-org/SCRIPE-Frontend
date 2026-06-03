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
export { SignupView } from "./signup/src/presentation/views/SignupView";
export { PasskeyManagementView } from "./core/src/presentation/views/PasskeyManagementView";
