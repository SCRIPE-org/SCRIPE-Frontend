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
 * Http API network service for i security.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ISecurityService {
  getSecurityEvents(days?: number): Promise<SecurityEvent[]>;
  getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIP[]>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<SecurityChange[]>;
}
