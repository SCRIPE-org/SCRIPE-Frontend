import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const ACCOUNT_SETUP_ENDPOINTS = {
  VALIDATE_TOKEN: `${V1}/account-setup/validate`,
  CUSTOM_FIELDS: `${V1}/account-setup/custom-fields`,
  ACTIVATE: `${V1}/account-setup/activate`,
} as const;
