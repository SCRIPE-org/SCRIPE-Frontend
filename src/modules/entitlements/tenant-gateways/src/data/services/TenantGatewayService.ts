/**
 * TenantGatewayService — HTTP API calls only, no business logic.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { ITenantGatewayService } from "../../domain/interfaces/ITenantGatewayService";
import type { TenantGatewayModel, ConfigureGatewayModel } from "../models/TenantGatewayModels";

export class TenantGatewayService implements ITenantGatewayService {
  constructor(private readonly api: IApiService) {}

  async getMyGateways(): Promise<TenantGatewayModel[]> {
    return this.api.get<TenantGatewayModel[]>(API_ENDPOINTS.ENTITLEMENTS.TENANT_GATEWAYS.LIST);
  }

  async configureGateway(data: ConfigureGatewayModel): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_GATEWAYS.CONFIGURE,
      data
    );
  }

  async verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }> {
    return this.api.post<{ isVerified: boolean }>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_GATEWAYS.VERIFY(gatewayType),
      {}
    );
  }

  async removeGateway(gatewayType: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.TENANT_GATEWAYS.REMOVE(gatewayType));
  }
}
