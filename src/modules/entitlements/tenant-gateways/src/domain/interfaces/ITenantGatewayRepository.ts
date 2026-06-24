import type { TenantGateway } from "../entities/TenantGateway";

/**
 * Interface defining property specifications, keys types, and structural contract rules for configure gateway request.
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
 * Repository layer implementing client request queries for i tenant gateway.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface ITenantGatewayRepository {
  getMyGateways(): Promise<TenantGateway[]>;
  configureGateway(data: ConfigureGatewayRequest): Promise<{ id: string }>;
  verifyGateway(gatewayType: string): Promise<{ isVerified: boolean }>;
  removeGateway(gatewayType: string): Promise<void>;
}
