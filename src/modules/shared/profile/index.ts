/**
 * Profile Module Public API
 *
 * Re-exports all public types and interfaces.
 */

// Domain entities (type-only)
export type { AdminProfile } from "./core/src/domain/entities/AdminProfile";
export type { ActiveSession } from "./core/src/domain/entities/ActiveSession";
export type { SecurityLogEntry } from "./core/src/domain/entities/SecurityLogEntry";
export type { PasskeyCredential } from "./core/src/domain/entities/PasskeyCredential";
export type { WorkstationSession } from "./core/src/domain/entities/WorkstationSession";
export type { SecurityAuditEntry } from "./core/src/domain/entities/SecurityAuditEntry";

// Domain interfaces (type-only)
export type {
  IProfileRepository,
  UpdateProfileRequest,
  ChangePasswordRequest,
  Enable2FAResult,
} from "./core/src/domain/interfaces/IProfileRepository";
export type {
  ISecurityRepository,
  SudoVerifyResult,
} from "./core/src/domain/interfaces/ISecurityRepository";

export { container } from "./di";
