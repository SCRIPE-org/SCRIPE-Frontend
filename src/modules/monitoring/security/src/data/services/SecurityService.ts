/**
 * Security Service
 *
 * Handles all HTTP API calls for security-related endpoints.
 * Uses Dashboard controller endpoints for security data.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ISecurityService } from "../../domain/interfaces/ISecurityService";
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
} from "../../domain/entities/SecurityEntities";

/**
 * API service for executing HTTP calls related to Security endpoints.
 */
export class SecurityService implements ISecurityService {
  constructor(private readonly api: IApiService) {}

  async getSecurityEvents(days: number = 7): Promise<SecurityEvent[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.SECURITY_EVENTS, { days });
    return this.api.get<SecurityEvent[]>(url);
  }

  async getTopBlockedIPs(days: number = 30, limit: number = 10): Promise<BlockedIP[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.TOP_BLOCKED_IPS, { days, limit });
    return this.api.get<BlockedIP[]>(url);
  }

  async getLoginActivity(days: number = 30): Promise<LoginActivityPoint[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.LOGIN_ACTIVITY, { days });
    return this.api.get<LoginActivityPoint[]>(url);
  }

  async getRecentChanges(limit: number = 10): Promise<SecurityChange[]> {
    const url = buildUrl(API_ENDPOINTS.DASHBOARD.RECENT_CHANGES, { limit });
    return this.api.get<SecurityChange[]>(url);
  }
}
