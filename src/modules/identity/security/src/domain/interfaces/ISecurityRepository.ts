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

export interface ISecurityRepository {
  getSecurityEvents(days?: number): Promise<SecurityEvent[]>;
  getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIP[]>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<SecurityChange[]>;
}
