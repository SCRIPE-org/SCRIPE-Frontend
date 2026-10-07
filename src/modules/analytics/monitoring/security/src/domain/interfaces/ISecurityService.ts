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
import type { ActiveSessionDto, DashboardSummaryDto } from "../../data/models/SecurityModels";

/**
 * Http API network service for security.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ISecurityService {
  getSecurityEvents(days?: number): Promise<SecurityEvent[]>;
  getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIP[]>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<SecurityChange[]>;
  getDashboardSummary(): Promise<DashboardSummaryDto>;
  getSessions(): Promise<ActiveSessionDto[]>;
  revokeSession(tokenId: string): Promise<void>;
  getAdmins(pageSize?: number): Promise<{ items: Array<{ id: string; isTwoFactorEnabled?: boolean }>; totalCount: number }>;
}
