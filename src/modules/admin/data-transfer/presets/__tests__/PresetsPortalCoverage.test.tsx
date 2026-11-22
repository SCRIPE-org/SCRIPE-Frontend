import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataExchangePreset } from "../src/domain/entities/DataExchangePreset";
import { setDataTransferContainer } from "../../di";

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
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
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
    toast: { success: vi.fn(), error: vi.fn() },
    success: vi.fn(),
    error: vi.fn(),
  }),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

import { usePresetsViewModel } from "../src/presentation/viewmodels/usePresetsViewModel";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("usePresetsViewModel Wave 2 Portal coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.tenantCode = "ahly-sc";
    mockStoreState.currentTenant = { id: "ahly-sc" };
    mockStoreState.user = { id: "u-1", tenantId: "ahly-sc" };
  });

  afterEach(() => {
    setDataTransferContainer(null);
  });

  it("gates Platform SuperAdmin with isTenantRequired=true when no active tenant is set", () => {
    mockStoreState.tenantCode = null;
    mockStoreState.currentTenant = null;
    mockStoreState.user = { id: "sa-1", tenantId: null };

    const getPresets = vi.fn();
    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([]),
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {} as never,
      presetsRepository: {
        getPresets,
        savePreset: vi.fn(),
        setDefaultPreset: vi.fn(),
        deletePreset: vi.fn(),
      },
    });

    const { result } = renderHook(() => usePresetsViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isTenantRequired).toBe(true);
    expect(getPresets).not.toHaveBeenCalled();
  });

  it("tracks hasActiveFilters and clears search and entityFilter via resetFilters", async () => {
    const presetA = new DataExchangePreset({
      id: "p-1",
      entityKey: "crm.lead",
      name: "Leads",
      importMode: "Insert",
      mappings: [{ sourceColumnHeader: "Email", targetFieldKey: "email" }],
      isDefault: true,
    });
    const presetB = new DataExchangePreset({
      id: "p-2",
      entityKey: "crm.account",
      name: "Accounts",
      importMode: "Upsert",
      mappings: [{ sourceColumnHeader: "Name", targetFieldKey: "name" }],
      isDefault: false,
    });

    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([]),
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {} as never,
      presetsRepository: {
        getPresets: vi.fn().mockResolvedValue([presetA, presetB]),
        savePreset: vi.fn(),
        setDefaultPreset: vi.fn(),
        deletePreset: vi.fn(),
      },
    });

    const { result } = renderHook(() => usePresetsViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.presets).toHaveLength(2));
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setEntityFilter("crm.lead");
      result.current.setSearch("Leads");
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.presets.map((p) => p.id)).toEqual(["p-1"]);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.entityFilter).toBe("all");
    expect(result.current.search).toBe("");
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.presets).toHaveLength(2);
  });
});
