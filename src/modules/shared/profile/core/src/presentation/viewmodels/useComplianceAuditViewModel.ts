"use client";

/**
 * useComplianceAuditViewModel
 *
 * ViewModel for the SOC2 Enterprise Compliance Audit Trail view.
 * Handles tamper-evident log streaming, search & event filtering,
 * slide-out forensic JSON inspector, and CSV report exports.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { sanitizeCsvCell } from "@core/common/sanitize";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";

/** React Query key factory for compliance audit trail queries. */
export const auditKeys = {
  all: ["profile", "compliance-audit"] as const,
  list: (page: number) => [...auditKeys.all, "list", page] as const,
};

/** ViewModel managing paginated compliance audit trail entries, filtering, forensic drawer, and CSV export. */
export function useComplianceAuditViewModel() {
  const securityRepo = container.securityRepository;
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<"ALL" | "SUCCESS" | "FAILURE">("ALL");

  // Selected entry for Forensic Payload Drawer
  const [selectedEntry, setSelectedEntry] = useState<SecurityAuditEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: entries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: auditKeys.list(page),
    queryFn: () => securityRepo.getAuditTrail(page, pageSize),
    staleTime: 30 * 1000,
  });

  // Filter entries (React 19 Compiler optimizes without manual useMemo)
  const filteredEntries = entries.filter((entry) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesType = entry.eventType.toLowerCase().includes(query);
      const matchesIp = entry.ipAddress.toLowerCase().includes(query);
      const matchesDetails = entry.details?.toLowerCase().includes(query);
      const matchesActor = entry.impersonatedBy?.toLowerCase().includes(query);
      if (!matchesType && !matchesIp && !matchesDetails && !matchesActor) {
        return false;
      }
    }
    if (eventTypeFilter !== "ALL" && entry.eventType !== eventTypeFilter) {
      return false;
    }
    if (outcomeFilter === "SUCCESS" && !entry.isSuccess) return false;
    if (outcomeFilter === "FAILURE" && entry.isSuccess) return false;
    return true;
  });

  // Unique event types for dropdown
  const uniqueEventTypes = Array.from(new Set(entries.map((e) => e.eventType)));

  // Forensic drawer controls
  const openDrawer = (entry: SecurityAuditEntry) => {
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  };

  // Export CSV
  const exportCsv = () => {
    if (filteredEntries.length === 0) return;
    const headers = [
      "ID",
      "Timestamp (UTC)",
      "Event Type",
      "Status",
      "IP Address",
      "User Agent",
      "Details",
      "Impersonated By",
    ].map(sanitizeCsvCell);
    const rows = filteredEntries.map((e) =>
      [
        e.id,
        e.timestamp.toISOString(),
        e.eventType,
        e.isSuccess ? "Success" : "Failure",
        e.ipAddress,
        e.userAgent || "",
        e.details || "",
        e.impersonatedBy || "None",
      ].map(sanitizeCsvCell)
    );

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scripe_audit_log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    entries: filteredEntries,
    rawCount: entries.length,
    filteredCount: filteredEntries.length,
    isLoading,
    error: error?.message ?? null,
    refetch,
    page,
    setPage,

    // Filters
    searchQuery,
    setSearchQuery,
    eventTypeFilter,
    setEventTypeFilter,
    outcomeFilter,
    setOutcomeFilter,
    uniqueEventTypes,

    // Forensic Drawer
    selectedEntry,
    isDrawerOpen,
    openDrawer,
    closeDrawer,

    // Export
    exportCsv,
  };
}
