import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACCOUNT_SETUP_ENDPOINTS = {
  VALIDATE_TOKEN: (token: string) =>
    `${V1}/account-setup/validate?token=${encodeURIComponent(token)}`,
  CUSTOM_FIELDS: (token: string) =>
    `${V1}/account-setup/custom-fields?token=${encodeURIComponent(token)}`,
  ACTIVATE: `${V1}/account-setup/activate`,
} as const;
