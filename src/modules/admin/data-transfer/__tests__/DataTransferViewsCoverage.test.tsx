import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockEntitiesVm = vi.fn();
const mockJobsVm = vi.fn();
const mockPresetsVm = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isPlatformSuperAdmin: false,
    isTenantSuperAdmin: false,
    isSuperAdmin: false,
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    settings: { pageSize: 10 },
    updateSettings: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/data-transfer",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@core/data-exchange", () => ({
  DataExchangeTenantRequiredCard: (props: Record<string, unknown>) => (
    <div data-testid="tenant-required-card">
      <span>{String(props.title ?? "")}</span>
      <span>{String(props.actionLabel ?? "")}</span>
    </div>
  ),
  DataExchangeStudioOverlay: () => null,
  DataExchangeExportDialog: () => null,
  DataExchangeToolbarActions: () => null,
  getEntityDisplayName: (entry: { displayNameEn?: string; entityKey?: string }) =>
    entry.displayNameEn ?? entry.entityKey ?? "",
}));

vi.mock("../entities/src/presentation/viewmodels/useEntitiesViewModel", () => ({
  useEntitiesViewModel: () => mockEntitiesVm(),
}));

vi.mock("../jobs/src/presentation/viewmodels/useJobsViewModel", () => ({
  useJobsViewModel: () => mockJobsVm(),
}));

vi.mock("../presets/src/presentation/viewmodels/usePresetsViewModel", () => ({
  usePresetsViewModel: () => mockPresetsVm(),
}));

import { EntitiesCatalogView } from "../entities/src/presentation/views/EntitiesCatalogView";
import { JobsExecutionView } from "../jobs/src/presentation/views/JobsExecutionView";
import { PresetsView } from "../presets/src/presentation/views/PresetsView";

function makeEntitiesVmState(overrides: Record<string, unknown> = {}) {
  return {
    t: (key: string) => key,
    language: "en" as const,
    isLoading: false,
    isError: false,
    error: null,
    isTenantRequired: false,
    entities: [],
    allFilteredEntities: [],
    availableModules: ["CRM", "Identity"],
    search: "",
    setSearch: vi.fn(),
    selectedModule: "all",
    setSelectedModule: vi.fn(),
    hasActiveFilters: false,
    resetFilters: vi.fn(),
    page: 1,
    pageNumber: 1,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    totalCount: 0,
    pagesCount: 1,
    totalPages: 1,
    pagination: {
      page: 1,
      currentPage: 1,
      pageNumber: 1,
      pageSize: 12,
      itemsCount: 0,
      totalCount: 0,
      pagesCount: 1,
      totalPages: 1,
    },
    kpis: {
      totalEntities: 4,
      importableCount: 3,
      exportableCount: 3,
      quotaConstrainedCount: 1,
    },
    downloadTemplate: vi.fn(),
    downloadingTemplateEntity: null,
    activeStudioEntity: null,
    setActiveStudioEntity: vi.fn(),
    activeExportEntity: null,
    setActiveExportEntity: vi.fn(),
    activeMultiSheetKeys: null,
    setActiveMultiSheetKeys: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  };
}

function makeJobsVmState(overrides: Record<string, unknown> = {}) {
  return {
    jobs: [],
    totalCount: 0,
    pagesCount: 1,
    totalPages: 1,
    isLoading: false,
    isError: false,
    error: null,
    isTenantRequired: false,
    page: 1,
    pageNumber: 1,
    pageSize: 10,
    search: "",
    statusFilter: "all",
    kindFilter: "all",
    setPage: vi.fn(),
    setPageNumber: vi.fn(),
    setPageSize: vi.fn(),
    pagination: {
      page: 1,
      currentPage: 1,
      pageNumber: 1,
      pageSize: 10,
      itemsCount: 0,
      totalCount: 0,
      pagesCount: 1,
      totalPages: 1,
    },
    setSearch: vi.fn(),
    setStatusFilter: vi.fn(),
    setKindFilter: vi.fn(),
    hasActiveFilters: false,
    resetFilters: vi.fn(),
    refetch: vi.fn(),
    importableEntities: [],
    isCatalogLoading: false,
    isStudioPickerOpen: false,
    setIsStudioPickerOpen: vi.fn(),
    activeStudioEntityKey: null,
    setActiveStudioEntityKey: vi.fn(),
    openStudioPicker: vi.fn(),
    launchStudioForEntity: vi.fn(),
    getCatalogEntry: vi.fn(),
    resolveEntityName: (key: string) => key,
    isStudioOpen: false,
    setIsStudioOpen: vi.fn(),
    jobToCancel: null,
    isCancelDialogOpen: false,
    isCancelling: false,
    promptCancelJob: vi.fn(),
    closeCancelDialog: vi.fn(),
    confirmCancelJob: vi.fn(),
    downloadArtifact: vi.fn(),
    isDownloading: false,
    kpis: {
      totalJobs: 8,
      activeJobs: 2,
      completedJobs: 5,
      failedJobs: 1,
    },
    ...overrides,
  };
}

function makePresetsVmState(overrides: Record<string, unknown> = {}) {
  return {
    presets: [],
    allFilteredPresets: [],
    totalCount: 0,
    pagesCount: 1,
    totalPages: 1,
    page: 1,
    pageNumber: 1,
    pageSize: 12,
    setPage: vi.fn(),
    setPageNumber: vi.fn(),
    setPageSize: vi.fn(),
    pagination: {
      page: 1,
      currentPage: 1,
      pageNumber: 1,
      pageSize: 12,
      itemsCount: 0,
      totalCount: 0,
      pagesCount: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    error: null,
    isTenantRequired: false,
    search: "",
    entityFilter: "all",
    entityFilterOptions: [],
    setSearch: vi.fn(),
    setEntityFilter: vi.fn(),
    refetch: vi.fn(),
    importableEntities: [],
    isCatalogLoading: false,
    getCatalogEntry: vi.fn(),
    resolveEntityName: (key: string) => key,
    hasActiveFilters: false,
    resetFilters: vi.fn(),
    activeStudioPreset: null,
    setActiveStudioPreset: vi.fn(),
    isCreatePickerOpen: false,
    setIsCreatePickerOpen: vi.fn(),
    createStudioEntityKey: null,
    setCreateStudioEntityKey: vi.fn(),
    openCreateStudioPicker: vi.fn(),
    launchCreateStudio: vi.fn(),
    isCreateStudioOpen: false,
    setIsCreateStudioOpen: vi.fn(),
    setDefaultPreset: vi.fn(),
    isSettingDefault: false,
    presetToDelete: null,
    isDeleteDialogOpen: false,
    isDeleting: false,
    promptDeletePreset: vi.fn(),
    closeDeleteDialog: vi.fn(),
    confirmDeletePreset: vi.fn(),
    kpis: {
      totalPresets: 3,
      defaultPresets: 1,
      entitiesCovered: 2,
      totalMappings: 14,
    },
    ...overrides,
  };
}

describe("Data Transfer Portal Views (EntitiesCatalogView, JobsExecutionView, PresetsView)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("EntitiesCatalogView renders TenantRequiredCard when isTenantRequired=true", () => {
    mockEntitiesVm.mockReturnValue(makeEntitiesVmState({ isTenantRequired: true }));
    render(<EntitiesCatalogView />);
    expect(screen.getByTestId("tenant-required-card")).toBeInTheDocument();
  });

  it("EntitiesCatalogView keeps KPIs & module toolbar mounted with inline error banner and custom searchPlaceholder", () => {
    mockEntitiesVm.mockReturnValue(
      makeEntitiesVmState({
        isError: true,
        error: new Error("Catalog fetch failed"),
      })
    );
    render(<EntitiesCatalogView />);

    expect(screen.getByTestId("entities-error-banner")).toBeInTheDocument();
    expect(screen.getByTestId("entities-filter-toolbar")).toBeInTheDocument();
    expect(
      screen.getByText("dataTransferEntities.kpi.totalEntities")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("dataTransferEntities.searchPlaceholder")
    ).toBeInTheDocument();
  });

  it("JobsExecutionView renders TenantRequiredCard when isTenantRequired=true", () => {
    mockJobsVm.mockReturnValue(makeJobsVmState({ isTenantRequired: true }));
    render(<JobsExecutionView />);
    expect(screen.getByTestId("tenant-required-card")).toBeInTheDocument();
  });

  it("JobsExecutionView keeps KPIs & filter toolbar mounted on error and wires custom searchPlaceholder", () => {
    mockJobsVm.mockReturnValue(
      makeJobsVmState({
        isError: true,
        error: new Error("Jobs timeout"),
      })
    );
    render(<JobsExecutionView />);

    expect(screen.getByTestId("jobs-error-banner")).toBeInTheDocument();
    expect(screen.getByTestId("jobs-filter-toolbar")).toBeInTheDocument();
    expect(
      screen.getByText("adminDataTransferJobs.kpis.totalJobs")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("adminDataTransferJobs.searchPlaceholder")
    ).toBeInTheDocument();
  });

  it("PresetsView renders TenantRequiredCard when isTenantRequired=true", () => {
    mockPresetsVm.mockReturnValue(makePresetsVmState({ isTenantRequired: true }));
    render(<PresetsView />);
    expect(screen.getByTestId("tenant-required-card")).toBeInTheDocument();
  });

  it("PresetsView keeps KPIs & filter bar mounted with inline error banner and wires custom searchPlaceholder", () => {
    mockPresetsVm.mockReturnValue(
      makePresetsVmState({
        isError: true,
        error: new Error("Presets unavailable"),
      })
    );
    render(<PresetsView />);

    expect(screen.getByTestId("presets-error-banner")).toBeInTheDocument();
    expect(screen.getByTestId("presets-entity-filter-bar")).toBeInTheDocument();
    expect(
      screen.getByText("adminDataTransferPresets.kpis.totalPresets")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("adminDataTransferPresets.searchPlaceholder")
    ).toBeInTheDocument();
  });
});
