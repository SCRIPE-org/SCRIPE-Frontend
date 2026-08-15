/**
 * Raw DTO types matching the backend API response shape exactly.
 */

/** Matches GET /tenant-gateways list item (TenantGatewayResponse on the backend) */
export interface TenantGatewayModel {
  id: string;
  gatewayType: string;
  displayLabel: string | null;
  merchantId: string | null;
  isActive: boolean;
  isDefault: boolean;
  isVerified: boolean;
  isTestMode: boolean;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Matches POST /tenant-gateways request body */
export interface ConfigureGatewayModel {
  gatewayType: string;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  merchantId?: string;
  displayLabel?: string;
  isTestMode?: boolean;
}
