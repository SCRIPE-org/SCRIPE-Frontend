import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ISecurityPoliciesService } from "../../domain/interfaces/ISecurityPoliciesService";

export class SecurityPoliciesService implements ISecurityPoliciesService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.SECURITY_POLICIES.IP_POLICIES.LIST, params as Record<string, string>);
    return this.api.get(url);
  }

  async getById(id: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.SECURITY_POLICIES.EVENTS.LIST);
  }
}
