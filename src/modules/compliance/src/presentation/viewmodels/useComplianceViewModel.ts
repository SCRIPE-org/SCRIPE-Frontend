"use client";

import { useQuery } from "@tanstack/react-query";
import { complianceContainer } from "../../../di";
import type { ComplianceDashboardData, DsrData } from "../../domain/entities/ComplianceEntities";
import { DataSubjectRequest } from "../../domain/entities/ComplianceEntities";

export function useComplianceDashboard() {
  const { complianceRepository } = complianceContainer;

  const dashboardQuery = useQuery({
    queryKey: ["compliance", "dashboard"],
    queryFn: () => complianceRepository.getDashboard(),
    staleTime: 30_000,
  });

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}

export function useDsrList(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  requestType?: string;
  search?: string;
} = {}) {
  const { complianceRepository } = complianceContainer;

  return useQuery({
    queryKey: ["compliance", "dsrs", params],
    queryFn: () => complianceRepository.getDsrList(params),
    staleTime: 15_000,
  });
}

export function useMyConsent() {
  const { complianceRepository } = complianceContainer;

  return useQuery({
    queryKey: ["compliance", "my-consent"],
    queryFn: () => complianceRepository.getMyConsent(),
    staleTime: 60_000,
  });
}

export function useRetentionPolicies() {
  const { complianceRepository } = complianceContainer;

  return useQuery({
    queryKey: ["compliance", "retention"],
    queryFn: () => complianceRepository.getRetentionPolicies(),
    staleTime: 60_000,
  });
}