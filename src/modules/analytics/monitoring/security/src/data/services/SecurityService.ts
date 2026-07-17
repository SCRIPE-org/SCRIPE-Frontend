/**
 * Security Service
 *
 * Handles all HTTP API calls for security-related endpoints.
 * Uses Dashboard controller endpoints for security data.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { ISecurityService } from "../../domain/interfaces/ISecurityService";
import { SECURITY_ENDPOINTS } from "./security.endpoints";
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
} from "../../domain/entities/SecurityEntities";

/**
 * Http API network service for security.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class SecurityService implements ISecurityService {
  constructor(private readonly api: IApiService) {}

  async getSecurityEvents(days: number = 7): Promise<SecurityEvent[]> {
    const url = buildUrl(SECURITY_ENDPOINTS.SECURITY_EVENTS, { days });
    return this.api.get<SecurityEvent[]>(url);
  }

  async getTopBlockedIPs(days: number = 30, limit: number = 10): Promise<BlockedIP[]> {
    const url = buildUrl(SECURITY_ENDPOINTS.TOP_BLOCKED_IPS, { days, limit });
    return this.api.get<BlockedIP[]>(url);
  }

  async getLoginActivity(days: number = 30): Promise<LoginActivityPoint[]> {
    const url = buildUrl(SECURITY_ENDPOINTS.LOGIN_ACTIVITY, { days });
    return this.api.get<LoginActivityPoint[]>(url);
  }

  async getRecentChanges(limit: number = 10): Promise<SecurityChange[]> {
    const url = buildUrl(SECURITY_ENDPOINTS.RECENT_CHANGES, { limit });
    return this.api.get<SecurityChange[]>(url);
  }
}
