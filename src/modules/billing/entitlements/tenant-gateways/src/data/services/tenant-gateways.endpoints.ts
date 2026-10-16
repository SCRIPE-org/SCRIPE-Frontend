import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const TENANT_GATEWAYS_ENDPOINTS = {
  LIST: `${V1}/tenant-gateways`,
  CONFIGURE: `${V1}/tenant-gateways`,
  VERIFY: (gatewayType: string) => `${V1}/tenant-gateways/${gatewayType}/verify`,
  REMOVE: (gatewayType: string) => `${V1}/tenant-gateways/${gatewayType}`,
} as const;
