import type { TenantGateway } from "../entities/TenantGateway";

/**
 * Interface structure detailing the properties and attributes of Configure Gateway Request.
 */
export interface ConfigureGatewayRequest {
  gatewayType: string;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  merchantId?: string;
  displayLabel?: string;
  isTestMode?: boolean;
}

/**
 * Interface defining repository methods for managing TenantGateway data access.
 */
export interface ITenantGatewayRepository {
  getMyGateways(): Promise<TenantGateway[]>;
  configureGateway(data: ConfigureGatewayRequest): Promise<{ id: string }>;
  verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }>;
  removeGateway(gatewayType: string): Promise<void>;
}
