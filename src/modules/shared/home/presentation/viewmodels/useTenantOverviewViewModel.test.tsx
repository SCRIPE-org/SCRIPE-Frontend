/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useTenantOverviewViewModel } from "./useTenantOverviewViewModel";
import { useOverviewViewModel } from "./useOverviewViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveTenantDisplayPrefs } from "@core/services/module-bridges";
import { DEFAULT_TENANT_OVERVIEW_LAYOUT } from "../components/tenant-command-center/tenantWidgetRegistry";

vi.mock("./useOverviewViewModel", () => ({
  useOverviewViewModel: vi.fn(),
}));

vi.mock("./usePresentationMode", () => ({
  usePresentationMode: vi.fn(() => ({
    isPresentationMode: false,
    togglePresentationMode: vi.fn(),
  })),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: vi.fn(),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: vi.fn(),
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useCurrentTenantId: vi.fn(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: vi.fn(),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn(),
}));

vi.mock("@core/services/module-bridges", () => ({
  saveTenantDisplayPrefs: vi.fn(),
}));

vi.mock("@modules/admin/identity/di", () => ({
  identityContainer: {
    tenantRepository: {
      getStats: vi.fn(),
      getById: vi.fn(),
    },
  },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

describe("useTenantOverviewViewModel Customization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(useI18n).mockReturnValue({
      t: (key: string) => key,
      language: "en",
      direction: "ltr",
      setLanguage: vi.fn(),
    } as any);

    vi.mocked(useAdminContext).mockReturnValue({
      activeTenantId: "tenant-123",
      activeTenantName: "Acme Sports",
      isImpersonating: false,
    } as any);

    vi.mocked(useCurrentTenantId).mockReturnValue("tenant-123");

    vi.mocked(useEnhancedToast).mockReturnValue({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    } as any);

    vi.mocked(usePermission).mockReturnValue(true);

    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: vi.fn(),
    } as any);

    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isRefetching: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useOverviewViewModel).mockReturnValue({
      summary: { data: null, isRefetching: false },
      loginActivity: { data: [] },
      recentActivity: { data: [] },
      hasDashboardPermission: true,
      refetchAll: vi.fn(),
    } as any);
  });

  it("loads the default layout initially when no saved layout exists", () => {
    const { result } = renderHook(() => useTenantOverviewViewModel());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.canCustomize).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.activeLayout.widgets).toHaveLength(
      DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets.length
    );
  });

  it("enters and exits edit mode properly without persisting drafts", () => {
    const { result } = renderHook(() => useTenantOverviewViewModel());

    act(() => {
      result.current.enterEditMode();
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(false);

    // Make a draft change
    act(() => {
      result.current.updateDraftLayout({
        ...result.current.activeLayout,
        widgets: result.current.activeLayout.widgets.slice(0, 3),
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    // Cancel edit mode
    act(() => {
      result.current.cancelEditMode();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
    // Original layout is preserved
    expect(result.current.activeLayout.widgets).toHaveLength(
      DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets.length
    );
  });

  it("saves the custom layout to backend and client storage on saveLayout", async () => {
    const { result } = renderHook(() => useTenantOverviewViewModel());

    act(() => {
      result.current.enterEditMode();
    });

    const modifiedLayout = {
      ...result.current.activeLayout,
      widgets: [
        {
          id: "custom-quick-actions",
          widgetId: "quickActions" as const,
          colSpan: 12 as const,
          visible: true,
        },
      ],
    };

    act(() => {
      result.current.updateDraftLayout(modifiedLayout);
    });

    await act(async () => {
      await result.current.saveLayout();
    });

    expect(saveTenantDisplayPrefs).toHaveBeenCalledTimes(1);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.activeLayout.widgets).toHaveLength(1);
    expect(result.current.activeLayout.widgets[0].widgetId).toBe("quickActions");
  });

  it("restores the default layout on restoreDefaultLayout", async () => {
    const { result } = renderHook(() => useTenantOverviewViewModel());

    await act(async () => {
      await result.current.restoreDefaultLayout();
    });

    expect(result.current.activeLayout.widgets).toHaveLength(
      DEFAULT_TENANT_OVERVIEW_LAYOUT.widgets.length
    );
  });
});
