import type { TenantGateway } from "../entities/TenantGateway";

export interface ConfigureGatewayRequest {
  gatewayType: string;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  merchantId?: string;
  displayLabel?: string;
  isTestMode?: boolean;
}

export interface ITenantGatewayRepository {
  getMyGateways(): Promise<TenantGateway[]>;
  configureGateway(data: ConfigureGatewayRequest): Promise<{ id: string }>;
  verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }>;
  removeGateway(gatewayType: string): Promise<void>;
}
