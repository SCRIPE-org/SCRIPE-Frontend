/**
 * Raw DTO types matching the backend API response shape exactly.
 */

/** Matches GET /tenant-gateways list item */
export interface TenantGatewayModel {
  id: string;
  gateway: string;
  displayLabel: string | null;
  merchantId: string | null;
  isEnabled: boolean;
  isVerified: boolean;
  isTestMode: boolean;
  lastVerifiedAt: string | null;
  createdAt: string;
  modifiedAt: string | null;
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
