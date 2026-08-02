import { V1 } from "@/core/config/api-endpoints/_shared";

export const FINANCIALS_ENDPOINTS = {
  PURCHASES: `${V1}/marketplace/financials/purchases`,
  PAYOUTS: `${V1}/marketplace/financials/payouts`,
  PAYOUT_PROCESS: (id: string) => `${V1}/marketplace/financials/payouts/${id}/process`,
} as const;
