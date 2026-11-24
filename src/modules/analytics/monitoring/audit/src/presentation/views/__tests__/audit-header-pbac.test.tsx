/**
 * Audit Header PBAC Export Gating & Tenant Subtitle Interpolation Tests
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import { AuditView } from "../AuditView";

const mockRefetchAll = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === "audit.header.tenantSubtitle") {
        return `Audit records for ${params?.tenant ?? "{{tenant}}"}.`;
      }
      return key;
    },
    language: "en" as const,
    direction: "ltr" as const,
    registerBothLanguages: vi.fn(),
    markModuleLoaded: vi.fn(),
    isModuleLoaded: () => true,
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    isPlatform: false,
    activeTenantName: "Al Ahly SC",
  }),
}));

vi.mock("../../viewmodels/useAuditViewModel", () => ({
  useAuditViewModel: () => ({
    kpis: {},
    logs: { isLoading: false, error: null, data: null, refetch: vi.fn() },
    hubSummary: { isLoading: false },
    filters: { pageSize: 20 },
    hasActiveFilters: false,
    activeFilterCount: 0,
    isRefetching: false,
    selectedLogId: null,
    detail: { isLoading: false, data: null },
    updateFilter: vi.fn(),
    setDatePreset: vi.fn(),
    resetFilters: vi.fn(),
    openDetail: vi.fn(),
    closeDetail: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    quickFilterByUser: vi.fn(),
    quickFilterByCorrelationId: vi.fn(),
    refetchAll: mockRefetchAll,
  }),
}));

vi.mock("../../viewmodels/useAuditRealtime", () => ({
  useAuditRealtime: () => ({
    connectionState: "connected" as const,
    realtimeEventCount: 0,
  }),
}));

vi.mock("../../components/AuditKpiSummary", () => ({
  AuditKpiSummary: () => <div data-testid="audit-kpis" />,
}));
vi.mock("../../components/AuditFilterPanel", () => ({
  AuditFilterPanel: () => <div data-testid="audit-filters" />,
}));
vi.mock("../../components/AuditLogTable", () => ({
  AuditLogTable: () => <div data-testid="audit-table" />,
}));
vi.mock("../../components/AuditDetailDrawer", () => ({
  AuditDetailDrawer: () => <div data-testid="audit-drawer" />,
}));
vi.mock("../../components/AuditExportDialog", () => ({
  AuditExportDialog: () => <div data-testid="audit-export-dialog" />,
}));

describe("AuditView / AuditHeader PBAC export gating and tenant subtitle interpolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAppStore.setState({ isAuthenticated: false, permissions: [] as never, roles: [] });
  });

  it("hides Export button when user only holds audit.view and interpolates tenant subtitle", () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["audit.view"] as never,
      roles: [],
    });

    render(<AuditView />);

    expect(screen.getByText("Audit records for Al Ahly SC.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /audit\.export\.button/i })).toBeNull();
  });

  it("renders Export button when user holds audit.export or audit.export_pdf", () => {
    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["audit.view", "audit.export"] as never,
      roles: [],
    });

    const { rerender } = render(<AuditView />);
    expect(screen.getByRole("button", { name: /audit\.export\.button/i })).toBeInTheDocument();

    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: ["audit.view", "audit.export_pdf"] as never,
      roles: [],
    });

    rerender(<AuditView />);
    expect(screen.getByRole("button", { name: /audit\.export\.button/i })).toBeInTheDocument();
  });
});
