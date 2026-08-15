import { V1 } from "@/core/config/api-endpoints/_shared";

export const DSR_ENDPOINTS = {
  DSR_LIST: `${V1}/compliance/dsr`,
  DSR_BY_ID: (id: string) => `${V1}/compliance/dsr/${id}`,
  DSR_SUBMIT: `${V1}/compliance/dsr`,
  DSR_REVIEW: (id: string) => `${V1}/compliance/dsr/${id}/review`,
  DSR_CANCEL: (id: string) => `${V1}/compliance/dsr/${id}/cancel`,
  DSR_CONFIRM_ERASURE: (id: string) => `${V1}/compliance/dsr/${id}/confirm-erasure`,
  DSR_DOWNLOAD: (id: string) => `${V1}/compliance/dsr/${id}/download`,
} as const;
