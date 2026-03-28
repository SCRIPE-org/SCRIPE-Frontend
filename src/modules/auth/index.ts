/**
 * Auth Module Public Exports
 */

// Core
export * from "./core/domain/entities";
export * from "./core/domain/interfaces";
export { AuthRepository } from "./core/data/repositories/AuthRepository";
export { authContainer, getAuthContainer } from "./di";

// Submodules
export { LoginView } from "./signin";
export { ForgotPasswordView, ResetPasswordView } from "./password-reset";
// export { RouteGuard } from './core/presentation/components/RouteGuard'; // RouteGuard moved to Core
