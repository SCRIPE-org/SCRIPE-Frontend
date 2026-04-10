"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";

export function useSecurityPoliciesViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { securityPoliciesRepository } = complianceContainer;
  const queryClient = useQueryClient();

  // ── IP Policies ─────────────────────────────────────────────────
  const ipPoliciesQuery = useQuery({
    queryKey: ["security-policies", "ip", page, pageSize, search],
    queryFn: () => securityPoliciesRepository.getIpPolicies({ page, pageSize, search: search || undefined }),
  });

  // ── Device Sessions ─────────────────────────────────────────────
  const devicesQuery = useQuery({
    queryKey: ["security-policies", "devices", page, pageSize],
    queryFn: () => securityPoliciesRepository.getDevices({ page, pageSize }),
  });

  // ── Security Events ─────────────────────────────────────────────
  const eventsQuery = useQuery({
    queryKey: ["security-policies", "events", page, pageSize, search],
    queryFn: () => securityPoliciesRepository.getEvents({ page, pageSize, search: search || undefined }),
  });

  const eventStatsQuery = useQuery({
    queryKey: ["security-policies", "event-stats"],
    queryFn: () => securityPoliciesRepository.getEventStats(),
  });

  // ── SIEM Status ─────────────────────────────────────────────────
  const siemQuery = useQuery({
    queryKey: ["security-policies", "siem-status"],
    queryFn: () => securityPoliciesRepository.getSiemStatus(),
  });

  // ── Anomaly Config ──────────────────────────────────────────────
  const anomalyQuery = useQuery({
    queryKey: ["security-policies", "anomaly-config"],
    queryFn: () => securityPoliciesRepository.getAnomalyConfig(),
  });

  // ── Mutations ───────────────────────────────────────────────────
  const createIpPolicyMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => securityPoliciesRepository.createIpPolicy(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-policies", "ip"] }),
  });

  const deleteIpPolicyMutation = useMutation({
    mutationFn: (id: string) => securityPoliciesRepository.deleteIpPolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-policies", "ip"] }),
  });

  const revokeDeviceMutation = useMutation({
    mutationFn: (id: string) => securityPoliciesRepository.revokeDevice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-policies", "devices"] }),
  });

  const revokeAllDevicesMutation = useMutation({
    mutationFn: () => securityPoliciesRepository.revokeAllDevices(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-policies", "devices"] }),
  });

  const trustDeviceMutation = useMutation({
    mutationFn: (id: string) => securityPoliciesRepository.trustDevice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-policies", "devices"] }),
  });

  const resolveGeoIpMutation = useMutation({
    mutationFn: (ip: string) => securityPoliciesRepository.resolveGeoIp(ip),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    // Pagination & search
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    handleSearch,

    // Tab queries
    ipPolicies: {
      items: (ipPoliciesQuery.data?.items as unknown[]) ?? [],
      totalCount: ipPoliciesQuery.data?.totalCount ?? 0,
      isLoading: ipPoliciesQuery.isLoading,
      error: ipPoliciesQuery.error,
      refetch: ipPoliciesQuery.refetch,
    },
    devices: {
      items: (devicesQuery.data?.items as unknown[]) ?? [],
      totalCount: devicesQuery.data?.totalCount ?? 0,
      isLoading: devicesQuery.isLoading,
      error: devicesQuery.error,
      refetch: devicesQuery.refetch,
    },
    events: {
      items: (eventsQuery.data?.items as unknown[]) ?? [],
      totalCount: eventsQuery.data?.totalCount ?? 0,
      isLoading: eventsQuery.isLoading,
      error: eventsQuery.error,
      refetch: eventsQuery.refetch,
    },
    eventStats: {
      data: eventStatsQuery.data,
      isLoading: eventStatsQuery.isLoading,
      error: eventStatsQuery.error,
    },
    siem: {
      data: siemQuery.data,
      isLoading: siemQuery.isLoading,
      error: siemQuery.error,
    },
    anomaly: {
      data: anomalyQuery.data,
      isLoading: anomalyQuery.isLoading,
      error: anomalyQuery.error,
    },

    // Mutations
    createIpPolicy: createIpPolicyMutation.mutateAsync,
    deleteIpPolicy: deleteIpPolicyMutation.mutateAsync,
    revokeDevice: revokeDeviceMutation.mutateAsync,
    revokeAllDevices: revokeAllDevicesMutation.mutateAsync,
    trustDevice: trustDeviceMutation.mutateAsync,
    resolveGeoIp: resolveGeoIpMutation.mutateAsync,
    geoIpResult: resolveGeoIpMutation.data,
    isResolvingGeoIp: resolveGeoIpMutation.isPending,
  };
}
