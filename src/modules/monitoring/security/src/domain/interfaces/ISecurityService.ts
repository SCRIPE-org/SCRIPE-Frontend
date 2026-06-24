/**
 * Security Service Interface
 *
 * Contract for HTTP API calls to security-related endpoints.
 */
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
} from "../entities/SecurityEntities";

/**
 * Interface defining operations for the Security network service.
 */
export interface ISecurityService {
  getSecurityEvents(days?: number): Promise<SecurityEvent[]>;
  getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIP[]>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<SecurityChange[]>;
}
