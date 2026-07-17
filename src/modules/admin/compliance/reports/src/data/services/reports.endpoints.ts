import { V1 } from "@/core/config/api-endpoints/_shared";

export const REPORTS_ENDPOINTS = {
  REPORTS: `${V1}/compliance/reports`,
  GENERATE_REPORT: `${V1}/compliance/reports/generate`,
} as const;
