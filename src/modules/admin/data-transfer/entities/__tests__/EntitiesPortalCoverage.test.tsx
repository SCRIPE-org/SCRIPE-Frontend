import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataExchangeEntity } from "../src/domain/entities/DataExchangeEntity";
import { setDataTransferContainer } from "../../di";

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
}));

const mockStoreState: {
  tenantCode: string | null;
  currentTenant: { id: string } | null;
  user: { id: string; tenantId: string | null } | null;
} = {
  tenantCode: "ahly-sc",
  currentTenant: { id: "ahly-sc" },
  user: { id: "u-1", tenantId: "ahly-sc" },
};

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      if (key === "dataTransferEntities.modules.CRM") return "CRM & Sales";
      if (key === "dataTransferEntities.modules.Identity") return "Identity & Users";
      return key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    success: vi.fn(),
    error: mockToastError,
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    settings: { pageSize: 12 },
    updateSettings: vi.fn(),
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector?: (s: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: {
      success: vi.fn(),
      error: mockToastError,
      warning: vi.fn(),
      info: vi.fn(),
    },
    success: vi.fn(),
    error: mockToastError,
    warning: vi.fn(),
    info: vi.fn(),
  }),
  toast: {
    success: vi.fn(),
    error: mockToastError,
  },
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

import { useEntitiesViewModel } from "../src/presentation/viewmodels/useEntitiesViewModel";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function makeEntity(overrides: Partial<ConstructorParameters<typeof DataExchangeEntity>[0]> = {}) {
  return new DataExchangeEntity({
    entityKey: "crm.lead",
    owningModule: "CRM",
    displayNameEn: "CRM Leads",
    displayNameAr: "عملاء CRM",
    descriptionEn: "Lead records",
    descriptionAr: "سجلات العملاء",
    supportsBulkAutoCreateLookup: true,
    supportsIdentityOnboardingModes: false,
    supportedModes: ["Insert", "Upsert"],
    parentEntityKeys: [],
    remainingQuotaSlots: 50,
    quotaMaxLimit: 100,
    isImportFeatureEnabled: true,
    isExportFeatureEnabled: true,
    canImport: true,
    canExport: true,
    ...overrides,
  });
}

describe("useEntitiesViewModel Wave 2 Portal coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.tenantCode = "ahly-sc";
    mockStoreState.currentTenant = { id: "ahly-sc" };
    mockStoreState.user = { id: "u-1", tenantId: "ahly-sc" };
  });

  afterEach(() => {
    setDataTransferContainer(null);
  });

  it("gates Platform SuperAdmin with isTenantRequired=true when no active tenant is selected", () => {
    mockStoreState.tenantCode = null;
    mockStoreState.currentTenant = null;
    mockStoreState.user = { id: "sa-1", tenantId: null };

    const getAll = vi.fn().mockResolvedValue([]);
    setDataTransferContainer({
      entitiesRepository: {
        getAll,
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {} as never,
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isTenantRequired).toBe(true);
    expect(getAll).not.toHaveBeenCalled();
  });

  it("keeps isError separate from isTenantRequired when active tenant fetch fails", async () => {
    const getAll = vi.fn().mockRejectedValue(new Error("Gateway timeout"));
    setDataTransferContainer({
      entitiesRepository: {
        getAll,
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {} as never,
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isTenantRequired).toBe(false);
    expect(result.current.entities).toEqual([]);
  });

  it("surfaces toast error and clears loading flag when downloadTemplate fails", async () => {
    const downloadTemplate = vi
      .fn()
      .mockRejectedValue(new Error("Template endpoint failed"));

    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([makeEntity()]),
        getDescriptor: vi.fn(),
        downloadTemplate,
      },
      jobsRepository: {} as never,
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.entities).toHaveLength(1));

    await act(async () => {
      await result.current.downloadTemplate(result.current.entities[0]);
    });

    expect(mockToastError).toHaveBeenCalledTimes(1);
    expect(result.current.downloadingTemplateEntity).toBeNull();
  });

  it("filters by selectedModule, matches localized module names in search, and resets filters", async () => {
    const crmLead = makeEntity({ entityKey: "crm.lead", owningModule: "CRM" });
    const identityUser = makeEntity({
      entityKey: "identity.user",
      owningModule: "Identity",
      displayNameEn: "Tenant Users",
    });

    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([crmLead, identityUser]),
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {} as never,
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useEntitiesViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.entities).toHaveLength(2));
    expect(result.current.availableModules).toEqual(["CRM", "Identity"]);
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setSelectedModule("Identity");
    });
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.entities.map((e) => e.entityKey)).toEqual([
      "identity.user",
    ]);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.selectedModule).toBe("all");
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.entities).toHaveLength(2);

    act(() => {
      result.current.setSearch("CRM & Sales");
    });
    expect(result.current.entities.map((e) => e.entityKey)).toEqual(["crm.lead"]);
  });
});
