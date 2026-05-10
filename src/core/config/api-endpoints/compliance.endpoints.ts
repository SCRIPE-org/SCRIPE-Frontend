import { V1 } from "./_shared";

export const COMPLIANCE_ENDPOINTS = {
  COMPLIANCE: {
    // Dashboard
    DASHBOARD: `${V1}/compliance/dashboard`,
    DASHBOARD_EXPORT: `${V1}/compliance/dashboard/export`,

    // Regulations
    REGULATIONS: `${V1}/compliance/regulations`,
    REGULATION_BY_ID: (id: string) => `${V1}/compliance/regulations/${id}`,
    REGULATION_PURPOSES: (id: string) => `${V1}/compliance/regulations/${id}/purposes`,
    REGULATION_PURPOSE_BY_ID: (id: string, purposeId: string) =>
      `${V1}/compliance/regulations/${id}/purposes/${purposeId}`,

    // Consent
    RECORD_CONSENT: `${V1}/compliance/consent`,
    MY_CONSENT: `${V1}/compliance/consent/me`,
    SUBJECT_CONSENT: (subjectId: string) => `${V1}/compliance/consent/${subjectId}`,
    CONSENT_ANALYTICS: `${V1}/compliance/consent/analytics`,

    // DSR
    DSR_LIST: `${V1}/compliance/dsr`,
    DSR_BY_ID: (id: string) => `${V1}/compliance/dsr/${id}`,
    DSR_SUBMIT: `${V1}/compliance/dsr`,
    DSR_SUBMIT_SELF: `${V1}/compliance/dsr/me`,
    DSR_REVIEW: (id: string) => `${V1}/compliance/dsr/${id}/review`,
    DSR_CONFIRM_ERASURE: (id: string) => `${V1}/compliance/dsr/${id}/confirm-erasure`,
    DSR_DOWNLOAD: (id: string) => `${V1}/compliance/dsr/${id}/download`,
    DSR_CANCEL: (id: string) => `${V1}/compliance/dsr/${id}/cancel`,

    // Retention
    RETENTION_LIST: `${V1}/compliance/retention`,
    RETENTION_UPDATE: `${V1}/compliance/retention`,
    RETENTION_BY_ID: (id: string) => `${V1}/compliance/retention/${id}`,
    RETENTION_EXECUTIONS: `${V1}/compliance/retention/executions`,

    // Data Inventory
    DATA_INVENTORY: `${V1}/compliance/data-inventory`,
    DATA_INVENTORY_BY_ID: (id: string) => `${V1}/compliance/data-inventory/${id}`,

    // Reports
    REPORTS: `${V1}/compliance/reports`,
    GENERATE_REPORT: `${V1}/compliance/reports/generate`,
  },
};
