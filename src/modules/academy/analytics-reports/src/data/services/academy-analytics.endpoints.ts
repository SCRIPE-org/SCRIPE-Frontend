import type { AnalyticsFilterParams } from "../../domain/entities/AcademyAnalytics";

export const ACADEMY_ANALYTICS_ENDPOINTS = {
  OPERATIONAL_METRICS: (filters?: AnalyticsFilterParams) => {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append("branchId", filters.branchId);
    if (filters?.programId) params.append("programId", filters.programId);
    if (filters?.seasonId) params.append("seasonId", filters.seasonId);
    if (filters?.fromUtc) params.append("fromUtc", filters.fromUtc);
    if (filters?.toUtc) params.append("toUtc", filters.toUtc);

    const qs = params.toString();
    return qs ? `/api/v1/academy/analytics/operational-metrics?${qs}` : "/api/v1/academy/analytics/operational-metrics";
  },

  OPERATIONAL_EXPORT: (dataset: string, filters?: AnalyticsFilterParams) => {
    const params = new URLSearchParams();
    params.append("dataset", dataset || "enrollments");
    if (filters?.branchId) params.append("branchId", filters.branchId);
    if (filters?.programId) params.append("programId", filters.programId);
    if (filters?.seasonId) params.append("seasonId", filters.seasonId);

    const qs = params.toString();
    return `/api/v1/academy/analytics/operational-export?${qs}`;
  }
};
