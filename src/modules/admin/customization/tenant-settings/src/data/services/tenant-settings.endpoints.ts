import { V1 } from "@/core/config/api-endpoints/_shared";

export const TENANT_SETTINGS_ENDPOINTS = {
  MY_SETTINGS: `${V1}/customization/settings`,
} as const;
