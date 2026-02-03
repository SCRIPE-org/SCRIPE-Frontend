/**
 * User Module Public API
 *
 * Exports for the User module - SOLID compliant.
 * Note: Components and repositories are exported via type only 
 * to avoid SSR import chain issues.
 */

// Domain Interfaces (type-only exports for SSR safety)
export type {
      IUserProfileRepository,
      UpdateProfileRequest,
      ChangePasswordRequest,
} from "./src/domain/interfaces/IUserProfileRepository";

// Presentation - Views (can be imported directly from paths for SSR safety)
// Use: import { ProfileView } from "@modules/user/src/presentation/views/ProfileView"

// Re-export view model for direct access
export { useProfileViewModel } from "./src/presentation/viewmodels/useUserViewModel";
