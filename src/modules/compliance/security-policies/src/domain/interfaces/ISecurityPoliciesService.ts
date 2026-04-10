export interface ISecurityPoliciesService {
  // IP Policies
  getIpPolicies(params?: Record<string, unknown>): Promise<unknown>;
  createIpPolicy(data: Record<string, unknown>): Promise<unknown>;
  updateIpPolicy(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteIpPolicy(id: string): Promise<unknown>;

  // Device Sessions
  getDevices(params?: Record<string, unknown>): Promise<unknown>;
  revokeDevice(id: string): Promise<unknown>;
  revokeAllDevices(): Promise<unknown>;
  trustDevice(id: string): Promise<unknown>;

  // Security Events
  getEvents(params?: Record<string, unknown>): Promise<unknown>;
  getEventStats(): Promise<unknown>;

  // GeoIP
  resolveGeoIp(ip: string): Promise<unknown>;

  // SIEM
  getSiemStatus(): Promise<unknown>;

  // Anomaly Detection
  getAnomalyConfig(): Promise<unknown>;
}
