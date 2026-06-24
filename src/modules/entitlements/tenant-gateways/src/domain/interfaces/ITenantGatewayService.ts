import type {
  TenantGatewayModel,
  ConfigureGatewayModel,
} from "../../data/models/TenantGatewayModels";

/**
 * Http API network service for i tenant gateway.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ITenantGatewayService {
  getMyGateways(): Promise<TenantGatewayModel[]>;
  configureGateway(data: ConfigureGatewayModel): Promise<{ id: string }>;
  verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }>;
  removeGateway(gatewayType: string): Promise<void>;
}
