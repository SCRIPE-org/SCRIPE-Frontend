import { V1 } from "@/core/config/api-endpoints/_shared";

export const EMPLOYMENT_RECORD_ENDPOINTS = {
  LIST: `${V1}/EmploymentRecords`,
  BY_ID: (id: string) => `${V1}/EmploymentRecords/${id}`,
  CREATE: `${V1}/EmploymentRecords`,
  UPDATE: (id: string) => `${V1}/EmploymentRecords/${id}`,
  DELETE: (id: string) => `${V1}/EmploymentRecords/${id}`,
} as const;
