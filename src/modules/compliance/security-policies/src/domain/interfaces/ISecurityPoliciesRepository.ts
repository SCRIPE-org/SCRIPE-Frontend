export interface ISecurityPoliciesRepository {
  // IP Policies
  getIpPolicies(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  createIpPolicy(data: Record<string, unknown>): Promise<unknown>;
  updateIpPolicy(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteIpPolicy(id: string): Promise<unknown>;

  // Device Sessions
  getDevices(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  revokeDevice(id: string): Promise<unknown>;
  revokeAllDevices(): Promise<unknown>;
  trustDevice(id: string): Promise<unknown>;

  // Security Events
  getEvents(params?: Record<string, unknown>): Promise<{ items: unknown[]; totalCount: number }>;
  getEventStats(): Promise<unknown>;

  // GeoIP
  resolveGeoIp(ip: string): Promise<unknown>;

  // SIEM
  getSiemStatus(): Promise<unknown>;

  // Anomaly
  getAnomalyConfig(): Promise<unknown>;
}
