/**
 * Security Repository Interface
 *
 * Contract for the security data repository.
 * Returns domain entities (not raw DTOs).
 */
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
} from "../entities/SecurityEntities";

/**
 * Repository layer implementing client request queries for i security.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface ISecurityRepository {
  readonly exportEndpoint: string;
  getSecurityEvents(days?: number): Promise<SecurityEvent[]>;
  getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIP[]>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<SecurityChange[]>;
}
