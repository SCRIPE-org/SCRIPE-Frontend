import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const CONSENT_ENDPOINTS = {
  MY_CONSENT: `${V1}/compliance/consent/me`,
  RECORD_CONSENT: `${V1}/compliance/consent`,
  CONSENT_ANALYTICS: `${V1}/compliance/consent/analytics`,
} as const;
