import type { ISecurityPoliciesRepository } from "../../domain/interfaces/ISecurityPoliciesRepository";
import type { ISecurityPoliciesService } from "../../domain/interfaces/ISecurityPoliciesService";

export class SecurityPoliciesRepository implements ISecurityPoliciesRepository {
  constructor(private readonly service: ISecurityPoliciesService) {}

  // ── IP Policies ─────────────────────────────────────────────────
  async getIpPolicies(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getIpPolicies(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async createIpPolicy(data: Record<string, unknown>): Promise<unknown> {
    return this.service.createIpPolicy(data);
  }

  async updateIpPolicy(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.service.updateIpPolicy(id, data);
  }

  async deleteIpPolicy(id: string): Promise<unknown> {
    return this.service.deleteIpPolicy(id);
  }

  // ── Device Sessions ─────────────────────────────────────────────
  async getDevices(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getDevices(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async revokeDevice(id: string): Promise<unknown> {
    return this.service.revokeDevice(id);
  }

  async revokeAllDevices(): Promise<unknown> {
    return this.service.revokeAllDevices();
  }

  async trustDevice(id: string): Promise<unknown> {
    return this.service.trustDevice(id);
  }

  // ── Security Events ─────────────────────────────────────────────
  async getEvents(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }> {
    const result = await this.service.getEvents(params) as { items?: unknown[]; totalCount?: number };
    const items = result.items ?? [];
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getEventStats(): Promise<unknown> {
    return this.service.getEventStats();
  }

  // ── GeoIP ───────────────────────────────────────────────────────
  async resolveGeoIp(ip: string): Promise<unknown> {
    return this.service.resolveGeoIp(ip);
  }

  // ── SIEM ────────────────────────────────────────────────────────
  async getSiemStatus(): Promise<unknown> {
    return this.service.getSiemStatus();
  }

  // ── Anomaly ─────────────────────────────────────────────────────
  async getAnomalyConfig(): Promise<unknown> {
    return this.service.getAnomalyConfig();
  }
}
