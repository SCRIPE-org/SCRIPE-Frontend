/**
 * Profile Module Public API
 *
 * Re-exports all public types and interfaces.
 */

// Domain entities (type-only)
export type { AdminProfile } from "./core/src/domain/entities/AdminProfile";
export type { ActiveSession } from "./core/src/domain/entities/ActiveSession";
export type { SecurityLogEntry } from "./core/src/domain/entities/SecurityLogEntry";

// Domain interfaces (type-only)
export type {
  IProfileRepository,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "./core/src/domain/interfaces/IProfileRepository";
