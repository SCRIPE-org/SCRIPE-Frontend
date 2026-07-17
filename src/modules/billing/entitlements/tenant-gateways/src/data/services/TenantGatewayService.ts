/**
 * TenantGatewayService — HTTP API calls only, no business logic.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { ITenantGatewayService } from "../../domain/interfaces/ITenantGatewayService";
import type { TenantGatewayModel, ConfigureGatewayModel } from "../models/TenantGatewayModels";
import { TENANT_GATEWAYS_ENDPOINTS } from "./tenant-gateways.endpoints";

/**
 * Http API network service for tenant gateway.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class TenantGatewayService implements ITenantGatewayService {
  constructor(private readonly api: IApiService) {}

  async getMyGateways(): Promise<TenantGatewayModel[]> {
    return this.api.get<TenantGatewayModel[]>(TENANT_GATEWAYS_ENDPOINTS.LIST);
  }

  async configureGateway(data: ConfigureGatewayModel): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      TENANT_GATEWAYS_ENDPOINTS.CONFIGURE,
      data
    );
  }

  async verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }> {
    return this.api.post<{ isVerified: boolean }>(
      TENANT_GATEWAYS_ENDPOINTS.VERIFY(gatewayType),
      {}
    );
  }

  async removeGateway(gatewayType: string): Promise<void> {
    await this.api.delete(TENANT_GATEWAYS_ENDPOINTS.REMOVE(gatewayType));
  }
}
