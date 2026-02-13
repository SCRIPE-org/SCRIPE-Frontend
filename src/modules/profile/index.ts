/**
 * Profile Module Public API
 *
 * Re-exports all public types and interfaces.
 */

// Domain entities (type-only)
export type { AdminProfile } from "./src/domain/entities/AdminProfile";
export type { ActiveSession } from "./src/domain/entities/ActiveSession";
export type { SecurityLogEntry } from "./src/domain/entities/SecurityLogEntry";

// Domain interfaces (type-only)
export type {
      IProfileRepository,
      UpdateProfileRequest,
      ChangePasswordRequest,
} from "./src/domain/interfaces/IProfileRepository";
