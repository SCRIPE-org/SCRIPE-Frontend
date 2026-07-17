import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACCOUNT_SETUP_ENDPOINTS = {
  VALIDATE_TOKEN: (token: string) => `${V1}/AccountSetup/validate-token?token=${encodeURIComponent(token)}`,
  ACTIVATE: `${V1}/AccountSetup/activate`,
} as const;
