import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ISecurityPoliciesService } from "../../domain/interfaces/ISecurityPoliciesService";

export class SecurityPoliciesService implements ISecurityPoliciesService {
  constructor(private readonly api: IApiService) {}

  // ── IP Policies ─────────────────────────────────────────────────
  async getIpPolicies(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.SECURITY_POLICIES.IP_POLICIES.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async createIpPolicy(data: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.SECURITY_POLICIES.IP_POLICIES.CREATE, data);
  }

  async updateIpPolicy(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.api.put(API_ENDPOINTS.SECURITY_POLICIES.IP_POLICIES.UPDATE(id), data);
  }

  async deleteIpPolicy(id: string): Promise<unknown> {
    return this.api.delete(API_ENDPOINTS.SECURITY_POLICIES.IP_POLICIES.DELETE(id));
  }

  // ── Device Sessions ─────────────────────────────────────────────
  async getDevices(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.SECURITY_POLICIES.DEVICES.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async revokeDevice(id: string): Promise<unknown> {
    return this.api.delete(API_ENDPOINTS.SECURITY_POLICIES.DEVICES.REVOKE(id));
  }

  async revokeAllDevices(): Promise<unknown> {
    return this.api.delete(API_ENDPOINTS.SECURITY_POLICIES.DEVICES.REVOKE_ALL);
  }

  async trustDevice(id: string): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.SECURITY_POLICIES.DEVICES.TRUST(id), {});
  }

  // ── Security Events ─────────────────────────────────────────────
  async getEvents(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.SECURITY_POLICIES.EVENTS.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async getEventStats(): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.SECURITY_POLICIES.EVENTS.STATS);
  }

  // ── GeoIP ───────────────────────────────────────────────────────
  async resolveGeoIp(ip: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.SECURITY_POLICIES.GEOIP.RESOLVE(ip));
  }

  // ── SIEM ────────────────────────────────────────────────────────
  async getSiemStatus(): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.SECURITY_POLICIES.SIEM.STATUS);
  }

  // ── Anomaly Detection ───────────────────────────────────────────
  async getAnomalyConfig(): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.SECURITY_POLICIES.ANOMALY.CONFIG);
  }
}
