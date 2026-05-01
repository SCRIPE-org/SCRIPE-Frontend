import type {
  TenantGatewayModel,
  ConfigureGatewayModel,
} from "../../data/models/TenantGatewayModels";

export interface ITenantGatewayService {
  getMyGateways(): Promise<TenantGatewayModel[]>;
  configureGateway(data: ConfigureGatewayModel): Promise<{ id: string }>;
  verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }>;
  removeGateway(gatewayType: string): Promise<void>;
}
