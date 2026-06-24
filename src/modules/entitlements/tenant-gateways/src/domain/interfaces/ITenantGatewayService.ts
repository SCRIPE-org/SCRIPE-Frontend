import type {
  TenantGatewayModel,
  ConfigureGatewayModel,
} from "../../data/models/TenantGatewayModels";

/**
 * Interface defining operations for the TenantGateway network service.
 */
export interface ITenantGatewayService {
  getMyGateways(): Promise<TenantGatewayModel[]>;
  configureGateway(data: ConfigureGatewayModel): Promise<{ id: string }>;
  verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }>;
  removeGateway(gatewayType: string): Promise<void>;
}
