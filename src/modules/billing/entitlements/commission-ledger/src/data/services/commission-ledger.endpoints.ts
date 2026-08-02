import { V1 } from "@/core/config/api-endpoints/_shared";

export const COMMISSION_LEDGER_ENDPOINTS = {
  LEDGER_LIST: `${V1}/commission-ledger`,
  INVOICE_LIST: `${V1}/commission-invoices`,
  RETRY_CHARGE: (id: string) => `${V1}/commission-invoices/${id}/retry-charge`,
  WAIVE: (id: string) => `${V1}/commission-invoices/${id}/waive`,
} as const;
